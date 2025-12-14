# Feature: Trip Management (CRUD Operations)

## 1. Overview

The trip management system provides full CRUD (Create, Read, Update, Delete) operations for travel trips. Users can create detailed trip posts with photos, descriptions, tags, and locations. The system supports both authenticated users (full CRUD) and anonymous users (read-only).

**Purpose:**
- Create new travel trips with rich content
- View and browse trips from all users
- Edit own trips with full form validation
- Delete own trips with confirmation
- Manage personal trip collection
- Display trip details with photo carousel and map

**Key Capabilities:**
- **Create**: Full-featured trip creation form with validation
- **Read**: Browse all trips, search, filter, and view details
- **Update**: Edit existing trips with pre-filled form data
- **Delete**: Remove trips with confirmation modal
- **Ownership Control**: Only trip owners can edit/delete
- **Sorting**: Trips sorted by creation date (newest first)

---

## 2. Architecture / Flow

### Create Trip Flow
```
User clicks "Create Trip" → Navigate to /trips/create
  → Load TripForm component
  → User fills form (photos, title, tags, description, location)
  → Form validation runs
  ├─ Validation fails? → Show error messages
  └─ Validation passes? → Upload photos → POST /api/trips
      → Backend creates trip
      → Redirect to trip detail page
```

### Read Trip Flow
```
User views trip list → GET /api/trips
  → Sort by createdAt (newest first)
  → Display in paginated list (8 per page)
  → User clicks trip card → Navigate to /trips/:id
  → GET /api/trips/:id
  → Display trip details with photos and map
```

### Update Trip Flow
```
Owner clicks "Edit" → Navigate to /trips/:id/edit
  → Load TripForm with initialData prop
  → Pre-fill form with existing trip data
  → User modifies fields
  → Form validation runs
  ├─ Validation fails? → Show error messages
  └─ Validation passes? → Upload new photos → Delete removed photos → PUT /api/trips/:id
      → Backend updates trip
      → Redirect to trip detail page
```

### Delete Trip Flow
```
Owner clicks "Delete" → Show ConfirmModal
  ├─ User cancels? → Close modal
  └─ User confirms? → DELETE /api/trips/:id
      → Backend deletes trip
      → Show success snackbar
      → Redirect to /my-trips
      → Remove from trip list
```

### My Trips Flow
```
Authenticated user navigates to /my-trips
  → GET /api/trips/mine
  → Filter trips by current user's authorId
  → Display in paginated list
  → Show edit/delete buttons for each trip
```

---

## 3. Tech Stack & Libraries

### Core Technologies

| Library/API | Purpose | Why This Choice | How It Works |
|------------|---------|----------------|--------------|
| **Vue 3 Composition API** | Component state management | - Reactive state<br>- TypeScript support<br>- Composable pattern | TripForm uses refs for form fields, computed for derived state, and watchers for data synchronization |
| **Axios** | HTTP client for API calls | - Promise-based<br>- Request interceptors<br>- Error handling | API calls to backend endpoints. Interceptors add JWT token automatically |
| **Vue Router** | Navigation and routing | - Programmatic navigation<br>- Route params<br>- Navigation guards | Navigate between trip list, detail, create, and edit pages |
| **File API** | Photo upload handling | - Native browser API<br>- File preview<br>- Multiple file selection | File input with `multiple` attribute. Uses `URL.createObjectURL()` for previews |

---

## 4. Core Logic

### 4.1 TripForm Component

**Location:** `src/components/TripForm.vue`

**Key Features:**
- Form validation for all required fields
- Photo upload with preview
- Markdown editor for descriptions
- Google Maps integration for location
- Edit mode with pre-filled data

**Form Fields:**
```typescript
const title = ref('')              // Required
const description = ref('')        // Required, Markdown
const tags = ref('')               // Required, comma-separated
const latitude = ref('')           // Required, -90 to 90
const longitude = ref('')          // Required, -180 to 180
const selectedFiles = ref<File[]>([])  // At least 1 required
```

**Validation Logic:**
```typescript
const validateForm = () => {
  // Reset errors
  errors.value = { title: false, description: false, tags: false, photos: false, latitude: false, longitude: false }
  
  // Validate each field
  if (!title.value.trim()) errors.value.title = true
  if (!description.value.trim()) errors.value.description = true
  if (!tags.value.trim()) errors.value.tags = true
  if (existingPhotos.value.length === 0 && selectedFiles.value.length === 0) {
    errors.value.photos = true
  }
  if (!latitude.value.trim() || parseFloat(latitude.value) < -90 || parseFloat(latitude.value) > 90) {
    errors.value.latitude = true
  }
  if (!longitude.value.trim() || parseFloat(longitude.value) < -180 || parseFloat(longitude.value) > 180) {
    errors.value.longitude = true
  }
  
  return !Object.values(errors.value).some(Boolean)
}
```

**Submit Handler:**
```typescript
const handleSubmit = async () => {
  if (!validateForm()) {
    error.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }
  
  submitting.value = true
  
  try {
    // Delete removed photos (edit mode only)
    if (props.tripId) {
      await deletePhotos()
    }
    
    // Upload new photos
    let newPhotoUrls: string[] = []
    if (selectedFiles.value.length > 0) {
      newPhotoUrls = await uploadPhotos()
    }
    
    // Combine existing and new photos
    const allPhotos = [...existingPhotos.value, ...newPhotoUrls]
    
    // Parse tags
    const tagsArray = tags.value.split(',').map(t => t.trim()).filter(t => t.length > 0)
    
    // Parse coordinates
    const lat = parseFloat(latitude.value)
    const lon = parseFloat(longitude.value)
    
    const tripData = {
      title: title.value.trim(),
      description: description.value.trim(),
      photos: allPhotos,
      tags: tagsArray,
      latitude: lat,
      longitude: lon,
    }
    
    if (props.tripId) {
      // Update trip
      const response = await tripsAPI.update(props.tripId, tripData)
      emit('submit', { id: props.tripId, trip: response.data })
    } else {
      // Create trip
      const response = await tripsAPI.create(tripData)
      emit('submit', { id: response.data.id, trip: response.data })
    }
  } catch (err) {
    error.value = props.tripId ? 'ไม่สามารถอัปเดตทริปได้' : 'ไม่สามารถสร้างทริปได้'
    emit('error', error.value)
  } finally {
    submitting.value = false
  }
}
```

### 4.2 TripCard Component

**Location:** `src/components/TripCard.vue`

**Features:**
- Display trip preview with first photo
- Show title, description preview, and tags
- Markdown cleaning for description preview
- Edit/Delete buttons for owners
- Copy link functionality
- Tag click filtering

**Description Preview:**
```typescript
const cleanMarkdown = (text: string): string => {
  let cleaned = text
  cleaned = cleaned.replace(/\\n/g, ' ')
  cleaned = cleaned.replace(/\*\*(.+?)\*\*/g, '$1')  // Bold
  cleaned = cleaned.replace(/\*(.+?)\*/g, '$1')      // Italic
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1')      // Code
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')  // Links
  cleaned = cleaned.replace(/#+\s*/g, '')            // Headers
  cleaned = cleaned.replace(/^[-*+]\s+/gm, '')       // Lists
  cleaned = cleaned.replace(/\s+/g, ' ').trim()
  return cleaned
}

const previewText = computed(() => {
  const raw = props.trip.description ?? ''
  const description = cleanMarkdown(raw)
  if (description.length <= MAX_PREVIEW_LENGTH) {
    return description
  }
  return `${description.slice(0, MAX_PREVIEW_LENGTH).trimEnd()}...`
})
```

### 4.3 TripDetailView Component

**Location:** `src/views/TripDetailView.vue`

**Features:**
- Photo carousel with auto-slide (8 seconds)
- Navigation buttons (Previous/Next)
- Dot indicators for photo selection
- Google Maps display
- Markdown rendering for description
- Edit/Delete buttons for owners

**Photo Carousel:**
```typescript
const currentPhotoIndex = ref(0)
const autoSlideInterval = ref<number | null>(null)

const startAutoSlide = () => {
  if (trip.value?.photos && trip.value.photos.length > 1) {
    autoSlideInterval.value = window.setInterval(() => {
      nextPhoto()
    }, 8000) // 8 seconds
  }
}

const nextPhoto = () => {
  if (!trip.value?.photos) return
  currentPhotoIndex.value = (currentPhotoIndex.value + 1) % trip.value.photos.length
  resetAutoSlide()
}
```

---

## 5. Data Model / State Structure

### Trip Interface

```typescript
interface Trip {
  id: number
  title: string
  description: string
  photos: string[]
  tags: string[]
  latitude?: number
  longitude?: number
  authorId: number
  authorEmail: string
  authorDisplayName: string
  createdAt: string
  updatedAt: string
}
```

### Form State

```typescript
// TripForm component state
const title = ref('')
const description = ref('')
const tags = ref('')
const latitude = ref('')
const longitude = ref('')
const selectedFiles = ref<File[]>([])
const previewUrls = ref<string[]>([])
const existingPhotos = ref<string[]>([])
const photosToDelete = ref<string[]>([])
const errors = ref({
  title: false,
  description: false,
  tags: false,
  photos: false,
  latitude: false,
  longitude: false,
})
```

---

## 6. Edge Cases / Limitations / TODO

### Edge Cases Handled

1. **Empty Photo List**: Validation requires at least 1 photo
2. **Invalid Coordinates**: Latitude/longitude range validation
3. **Photo Upload Failure**: Error handling with user feedback
4. **Concurrent Edits**: Last write wins (no conflict resolution)
5. **Deleted Trip Access**: 404 error handling with redirect
6. **Unauthorized Edit/Delete**: Backend returns 403, frontend shows error
7. **Network Errors**: Error messages displayed via Snackbar
8. **Large Photo Files**: No client-side size validation (backend handles)

### Current Limitations

1. **No Draft Saving**: Cannot save trips as drafts
2. **No Version History**: Cannot view/edit history of changes
3. **No Collaboration**: Only single author per trip
4. **No Trip Templates**: Cannot save and reuse trip templates
5. **No Bulk Operations**: Cannot delete/edit multiple trips at once
6. **No Trip Duplication**: Cannot duplicate existing trips
7. **No Export**: Cannot export trips as JSON/PDF
8. **No Trip Sharing**: No social media sharing buttons
9. **No Comments**: No comment system on trips
10. **No Ratings**: No rating/review system

### TODO / Future Enhancements

- [ ] **Draft Saving**: Auto-save trips as drafts
- [ ] **Version History**: Track and display edit history
- [ ] **Collaboration**: Allow multiple authors per trip
- [ ] **Trip Templates**: Save and reuse trip templates
- [ ] **Bulk Operations**: Select and delete/edit multiple trips
- [ ] **Trip Duplication**: Clone existing trips
- [ ] **Export Functionality**: Export trips as JSON/PDF
- [ ] **Social Sharing**: Add share buttons for social media
- [ ] **Comments System**: Allow users to comment on trips
- [ ] **Ratings System**: Add rating/review functionality
- [ ] **Trip Collections**: Group related trips
- [ ] **Trip Scheduling**: Add start/end dates
- [ ] **Trip Privacy**: Public/Private trip options
- [ ] **Trip Categories**: Categorize trips by type
- [ ] **Trip Statistics**: View trip views, likes, shares

### Known Issues

- **Photo Order**: Main photo selection logic may be confusing
- **Large Forms**: No auto-save, data lost on page refresh
- **No Undo**: Cannot undo delete operations
- **No Conflict Resolution**: Concurrent edits overwrite each other
- **No Image Optimization**: Photos uploaded as-is (no compression)

