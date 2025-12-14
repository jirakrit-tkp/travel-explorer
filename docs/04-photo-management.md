# Feature: Photo Upload & Management

## 1. Overview

The photo management system allows users to upload, preview, organize, and manage multiple photos for their trips. It supports selecting a main photo, reordering photos, and removing unwanted photos before submission.

**Purpose:**
- Upload multiple photos per trip
- Preview photos before submission
- Select main photo (first in array)
- Reorder photos by setting main photo
- Remove photos before upload
- Delete photos when editing trips
- Visual feedback during upload process

**Key Capabilities:**
- **Multiple Upload**: Select and upload multiple photos at once
- **Photo Preview**: Preview selected photos before upload
- **Main Photo Selection**: Set any photo as main (moves to first position)
- **Photo Removal**: Remove photos before upload or during edit
- **Upload Progress**: Visual feedback during upload
- **Photo Deletion**: Delete photos from existing trips

---

## 2. Architecture / Flow

### Photo Upload Flow
```
User clicks "Add Photo" → File input opens
  → User selects one or more image files
  → Files added to selectedFiles array
  → Create preview URLs using URL.createObjectURL()
  → Display preview thumbnails
  → User can reorder or remove photos
  → On form submit → Upload all selected files
    → POST /api/files/upload (for each file)
    → Get URLs from responses
    → Combine with existing photos
    → Submit trip with photo URLs
```

### Main Photo Selection Flow
```
User clicks "Main" button on photo → setMainPhoto(index)
  → Remove photo from current position
  → Insert at beginning of array
  → Update preview display
  → On submit, this photo becomes first in array
```

### Photo Removal Flow (New Photos)
```
User clicks delete on preview → removePhotoAt(index)
  → Revoke object URL (free memory)
  → Remove from previewUrls array
  → Remove from selectedFiles array
  → Update display
```

### Photo Removal Flow (Existing Photos)
```
User clicks delete on existing photo → removeExistingPhoto(url)
  → Remove from existingPhotos array
  → Add to photosToDelete array
  → On submit → DELETE /api/files/upload?url={url}
  → Photo deleted from server
```

### Edit Mode Photo Management
```
User edits trip → Load existing photos
  → Display existing photos with delete option
  → User can add new photos
  → User can remove existing photos
  → On submit:
    → Delete photos in photosToDelete array
    → Upload new photos
    → Combine: [newMainPhoto, ...existingPhotos, ...otherNewPhotos]
```

---

## 3. Tech Stack & Libraries

### Core Technologies

| Library/API | Purpose | Why This Choice | How It Works |
|------------|---------|----------------|--------------|
| **File API** | File selection and preview | - Native browser API<br>- No dependencies<br>- Direct file access | `<input type="file">` allows file selection. `FileReader` or `URL.createObjectURL()` creates preview URLs |
| **URL.createObjectURL()** | Create preview URLs | - Fast and efficient<br>- No server round-trip<br>- Automatic cleanup | Creates blob URL from File object. Displays in `<img>` tag. Must revoke to free memory |
| **FormData** | File upload | - Standard for file uploads<br>- Works with multipart/form-data<br>- Axios support | Creates FormData object. Appends file. Sends via POST request. Backend receives as multipart |
| **Axios** | HTTP client for uploads | - Promise-based<br>- Progress tracking support<br>- Error handling | POST request with FormData. Returns uploaded file URL. Handles errors gracefully |

---

## 4. Core Logic

### 4.1 File Selection Handler

**Location:** `src/components/TripForm.vue`

```typescript
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files) {
    const files = Array.from(target.files)
    
    // Add new files to existing selection
    selectedFiles.value = [...selectedFiles.value, ...files]
    
    // Create preview URLs
    const newUrls = files.map((file) => URL.createObjectURL(file))
    previewUrls.value = [...previewUrls.value, ...newUrls]
    
    // Clear input to allow selecting same file again
    target.value = ''
  }
}
```

### 4.2 Photo Preview Display

```vue
<!-- New photos (preview) -->
<figure
  v-for="(url, index) in previewUrls"
  :key="`preview-${url}`"
  class="relative h-32 w-32 rounded-lg bg-gray-100"
>
  <!-- Main badge -->
  <span
    v-if="index === 0"
    class="absolute left-1 top-1 z-10 rounded bg-sky-600 px-1.5 py-0.5 text-[10px] text-white"
  >
    Main
  </span>
  <button
    v-if="index !== 0"
    type="button"
    @click.stop="setMainPhoto(index)"
    class="absolute left-1 top-1 z-10 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white cursor-pointer"
  >
    Main
  </button>
  <!-- Delete button -->
  <button
    type="button"
    @click.stop="removePhotoAt(index)"
    class="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md cursor-pointer"
  >
    <X class="h-3 w-3" />
  </button>
  <img
    :src="url"
    alt="ตัวอย่างรูปทริป"
    class="h-full w-full rounded-lg object-cover"
  />
</figure>
```

### 4.3 Main Photo Selection

```typescript
const setMainPhoto = (index: number) => {
  if (index < 0 || index >= selectedFiles.value.length) {
    return
  }

  const removedFiles = selectedFiles.value.splice(index, 1)
  const removedUrls = previewUrls.value.splice(index, 1)
  const file = removedFiles[0]
  const url = removedUrls[0]

  if (!file || !url) {
    return
  }

  // If there are existing photos, move first existing to end
  if (existingPhotos.value.length > 0) {
    const firstExisting = existingPhotos.value.shift()
    if (firstExisting) {
      existingPhotos.value.push(firstExisting)
    }
    selectedFiles.value.unshift(file)
    previewUrls.value.unshift(url)
  } else {
    // No existing photos, just reorder new photos
    selectedFiles.value.unshift(file)
    previewUrls.value.unshift(url)
  }
}
```

### 4.4 Photo Upload

```typescript
const uploadPhotos = async () => {
  if (selectedFiles.value.length === 0) return []

  uploading.value = true
  try {
    const uploadPromises = selectedFiles.value.map((file) => filesAPI.upload(file))
    const responses = await Promise.all(uploadPromises)
    return responses.map((res: AxiosResponse<{ url: string }>) => res.data.url)
  } catch (err) {
    console.error('Upload failed:', err)
    throw err
  } finally {
    uploading.value = false
  }
}
```

### 4.5 Photo Deletion

```typescript
const deletePhotos = async () => {
  if (photosToDelete.value.length === 0) return

  try {
    const deletePromises = photosToDelete.value.map((url) => filesAPI.delete(url))
    await Promise.all(deletePromises)
  } catch (err) {
    console.error('Delete photos failed:', err)
  }
}
```

### 4.6 Memory Cleanup

```typescript
const revokePreviews = () => {
  previewUrls.value.forEach((url) => {
    URL.revokeObjectURL(url)
  })
  previewUrls.value = []
}

const removePhotoAt = (index: number) => {
  const url = previewUrls.value[index]
  if (url) {
    URL.revokeObjectURL(url)  // Free memory
  }
  previewUrls.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

onBeforeUnmount(() => {
  revokePreviews()  // Cleanup on component unmount
})
```

### 4.7 Photo Combination Logic

```typescript
// Combine existing and new photos
let allPhotos: string[] = []
if (existingPhotos.value.length > 0 && newPhotoUrls.length > 0) {
  // New photo[0] should be main, so put it first
  const firstNewPhoto = newPhotoUrls[0]
  if (firstNewPhoto) {
    allPhotos = [firstNewPhoto, ...existingPhotos.value, ...newPhotoUrls.slice(1)]
  } else {
    allPhotos = [...existingPhotos.value, ...newPhotoUrls]
  }
} else if (existingPhotos.value.length > 0) {
  // Only existing photos
  allPhotos = [...existingPhotos.value]
} else {
  // Only new photos (or no photos)
  allPhotos = newPhotoUrls
}
```

---

## 5. Data Model / State Structure

### Component State

```typescript
const selectedFiles = ref<File[]>([])           // Files to upload
const previewUrls = ref<string[]>([])          // Preview blob URLs
const existingPhotos = ref<string[]>([])       // Existing photo URLs (edit mode)
const photosToDelete = ref<string[]>([])       // URLs to delete (edit mode)
const uploading = ref(false)                   // Upload in progress
const photoInputRef = ref<HTMLInputElement | null>(null)  // File input ref
```

### File Input Configuration

```vue
<input
  id="photos"
  ref="photoInputRef"
  type="file"
  multiple
  accept="image/*"
  @change="handleFileSelect"
  class="sr-only"
/>
```

---

## 6. Edge Cases / Limitations / TODO

### Edge Cases Handled

1. **No Photos Selected**: Validation requires at least 1 photo
2. **Memory Leaks**: Properly revokes object URLs on removal/unmount
3. **Upload Failure**: Error handling with user feedback
4. **Concurrent Uploads**: Uses Promise.all for parallel uploads
5. **Delete Failure**: Continues even if some deletes fail
6. **Large Files**: No client-side size validation (backend handles)
7. **Invalid File Types**: Browser `accept="image/*"` filters

### Current Limitations

1. **No Image Compression**: Photos uploaded as-is (no client-side compression)
2. **No Image Cropping**: Cannot crop/resize before upload
3. **No Image Editing**: No filters, adjustments, or effects
4. **No Drag & Drop**: Must use file picker (no drag-drop interface)
5. **No Upload Progress**: No per-file progress indicators
6. **No Image Optimization**: No WebP conversion or optimization
7. **No Batch Operations**: Cannot select multiple photos at once efficiently
8. **No Photo Albums**: Cannot organize photos into albums
9. **No Photo Metadata**: No EXIF data display/editing
10. **No Photo Sharing**: Cannot share individual photos

### TODO / Future Enhancements

- [ ] **Image Compression**: Compress images before upload
- [ ] **Image Cropping**: Add crop/resize functionality
- [ ] **Image Editing**: Add filters and adjustments
- [ ] **Drag & Drop**: Implement drag-drop interface
- [ ] **Upload Progress**: Show per-file progress bars
- [ ] **Image Optimization**: Convert to WebP, optimize size
- [ ] **Batch Selection**: Better multi-file selection
- [ ] **Photo Albums**: Organize photos into albums
- [ ] **Photo Metadata**: Display/edit EXIF data
- [ ] **Photo Sharing**: Share individual photos
- [ ] **Photo Zoom**: Zoom/lightbox view
- [ ] **Photo Slideshow**: Full-screen slideshow
- [ ] **Photo Sorting**: Drag-to-reorder interface
- [ ] **Photo Tags**: Tag photos for organization
- [ ] **Photo Search**: Search photos by tags/metadata

### Known Issues

- **Memory Usage**: Large images consume significant memory for previews
- **Upload Timeout**: No timeout handling for slow uploads
- **Network Errors**: Partial uploads not handled (all-or-nothing)
- **File Size Limit**: No client-side validation of file size
- **Browser Compatibility**: Some older browsers may not support File API

