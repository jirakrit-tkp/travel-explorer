# Feature: Form Validation System

## 1. Overview

The form validation system provides comprehensive client-side validation for trip creation and editing forms. It validates all required fields, displays visual error indicators, and provides real-time error clearing as users correct their input.

**Purpose:**
- Validate all required form fields
- Provide visual feedback for validation errors
- Prevent submission of invalid data
- Guide users to correct errors
- Clear errors automatically when fixed

**Key Capabilities:**
- **Required Field Validation**: All fields must be filled
- **Format Validation**: Latitude/longitude range validation
- **Visual Error Indicators**: Red borders and error messages
- **Real-time Error Clearing**: Errors clear as user types
- **Comprehensive Validation**: Validates all fields before submission
- **User-friendly Messages**: Clear error messages in Thai

---

## 2. Architecture / Flow

### Validation Flow
```
User clicks submit → validateForm()
  → Check each field
  ├─ Field invalid? → Set error state
  └─ All valid? → Proceed with submission
  → Display error messages
  → Highlight invalid fields
```

### Error Clearing Flow
```
User types in field → Watch triggers
  → Check if field has error
  → If error exists, clear it
  → Update error state
  → Remove visual error indicator
```

### Submission Flow
```
User clicks submit → handleSubmit()
  → Run validateForm()
  ├─ Validation fails? → Show errors, stop
  └─ Validation passes? → Continue submission
    → Upload photos
    → Submit trip data
    → Handle success/error
```

---

## 3. Tech Stack & Libraries

### Core Technologies

| Library/API | Purpose | Why This Choice | How It Works |
|------------|---------|----------------|--------------|
| **Vue 3 Reactive State** | Error state management | - Built into Vue<br>- Reactive updates<br>- TypeScript support | `errors` ref object tracks validation state. Template reacts to changes automatically |
| **Vue Watch** | Auto-clear errors | - Built into Vue<br>- Automatic reactivity<br>- Efficient updates | Watches form fields. Clears errors when user starts typing |
| **Native Validation** | HTML5 validation | - Browser-native<br>- No dependencies<br>- Accessible | HTML `required` attribute provides basic validation. Custom validation adds business logic |

---

## 4. Core Logic

### 4.1 Validation State

**Location:** `src/components/TripForm.vue`

```typescript
const errors = ref({
  title: false,
  description: false,
  tags: false,
  photos: false,
  latitude: false,
  longitude: false,
})
```

### 4.2 Validation Function

```typescript
const validateForm = () => {
  // Reset all errors
  errors.value = {
    title: false,
    description: false,
    tags: false,
    photos: false,
    latitude: false,
    longitude: false,
  }

  let isValid = true

  // Validate title
  if (!title.value.trim()) {
    errors.value.title = true
    isValid = false
  }

  // Validate description
  if (!description.value.trim()) {
    errors.value.description = true
    isValid = false
  }

  // Validate tags
  if (!tags.value.trim()) {
    errors.value.tags = true
    isValid = false
  }

  // Validate photos (must have at least one photo)
  if (existingPhotos.value.length === 0 && selectedFiles.value.length === 0) {
    errors.value.photos = true
    isValid = false
  }

  // Validate latitude
  const latStr = String(latitude.value || '').trim()
  if (!latStr) {
    errors.value.latitude = true
    isValid = false
  } else {
    const lat = parseFloat(latStr)
    if (isNaN(lat) || lat < -90 || lat > 90) {
      errors.value.latitude = true
      isValid = false
    }
  }

  // Validate longitude
  const lonStr = String(longitude.value || '').trim()
  if (!lonStr) {
    errors.value.longitude = true
    isValid = false
  } else {
    const lon = parseFloat(lonStr)
    if (isNaN(lon) || lon < -180 || lon > 180) {
      errors.value.longitude = true
      isValid = false
    }
  }

  return isValid
}
```

### 4.3 Auto-Clear Errors

```typescript
// Clear errors when user starts typing
watch(title, () => {
  if (errors.value.title) {
    errors.value.title = false
  }
})

watch(description, () => {
  if (errors.value.description) {
    errors.value.description = false
  }
})

watch(tags, () => {
  if (errors.value.tags) {
    errors.value.tags = false
  }
})

watch(latitude, () => {
  if (errors.value.latitude) {
    errors.value.latitude = false
  }
})

watch(longitude, () => {
  if (errors.value.longitude) {
    errors.value.longitude = false
  }
})

watch([existingPhotos, selectedFiles], () => {
  if (errors.value.photos) {
    errors.value.photos = false
  }
})
```

### 4.4 Visual Error Indicators

```vue
<!-- Title field with error styling -->
<input
  id="title"
  v-model="title"
  type="text"
  required
  :class="[
    'w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2',
    errors.title
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : 'border-gray-300 focus:ring-sky-500 focus:border-transparent',
  ]"
  placeholder="เช่น เที่ยวเกาะช้าง"
/>
<p v-if="errors.title" class="mt-1 text-sm text-red-600">
  กรุณากรอกชื่อทริป
</p>
```

### 4.5 Photo Validation UI

```vue
<button
  type="button"
  :class="[
    'flex items-center justify-center h-32 w-32 border-2 border-dashed rounded-lg text-gray-400 hover:text-sky-500 transition-colors text-sm font-medium cursor-pointer',
    errors.photos
      ? 'border-red-500 hover:border-red-600'
      : 'border-gray-300 hover:border-sky-400',
  ]"
  @click="openPhotoPicker"
>
  + เพิ่มรูป
</button>
<p v-if="errors.photos" class="mt-2 text-sm text-red-600">
  กรุณาเลือกรูปภาพอย่างน้อย 1 รูป
</p>
```

### 4.6 Submit Handler

```typescript
const handleSubmit = async () => {
  error.value = ''

  // Validate all fields
  if (!validateForm()) {
    error.value = 'กรุณากรอกข้อมูลให้ครบถ้วน'
    return
  }

  submitting.value = true
  // ... continue with submission ...
}
```

---

## 5. Data Model / State Structure

### Validation State

```typescript
const errors = ref({
  title: boolean           // Title validation error
  description: boolean     // Description validation error
  tags: boolean          // Tags validation error
  photos: boolean        // Photos validation error
  latitude: boolean      // Latitude validation error
  longitude: boolean     // Longitude validation error
})
```

### Form Fields

```typescript
const title = ref('')              // Required
const description = ref('')        // Required
const tags = ref('')               // Required
const latitude = ref('')           // Required, -90 to 90
const longitude = ref('')          // Required, -180 to 180
const selectedFiles = ref<File[]>([])  // At least 1 required
const existingPhotos = ref<string[]>([])  // Existing photos (edit mode)
```

---

## 6. Edge Cases / Limitations / TODO

### Edge Cases Handled

1. **Empty Strings**: Trims whitespace before validation
2. **Number Parsing**: Handles NaN and invalid numbers
3. **Coordinate Ranges**: Validates latitude (-90 to 90) and longitude (-180 to 180)
4. **Photo Count**: Validates at least 1 photo (new or existing)
5. **Type Conversion**: Converts string to number for coordinates
6. **Edit Mode**: Handles existing photos in edit mode
7. **Auto-clear**: Clears errors as user types

### Current Limitations

1. **Client-Side Only**: No server-side validation feedback
2. **No Async Validation**: Cannot validate against server (e.g., duplicate titles)
3. **No Field-Level Validation**: All fields validated at once
4. **No Validation Rules**: No custom validation rules (e.g., min/max length)
5. **No Validation Messages**: Generic error messages (no field-specific details)
6. **No Validation Summary**: No list of all errors at once
7. **No Validation on Blur**: Only validates on submit
8. **No Character Count**: No character count for text fields
9. **No Format Validation**: No email, URL, or phone format validation
10. **No Conditional Validation**: All fields always required

### TODO / Future Enhancements

- [ ] **Server-Side Validation**: Display server validation errors
- [ ] **Async Validation**: Validate against server (e.g., duplicate check)
- [ ] **Field-Level Validation**: Validate individual fields on blur
- [ ] **Custom Rules**: Add min/max length, pattern matching
- [ ] **Detailed Messages**: Field-specific error messages
- [ ] **Validation Summary**: Show all errors in one place
- [ ] **Real-time Validation**: Validate as user types
- [ ] **Character Count**: Show character count for text fields
- [ ] **Format Validation**: Email, URL, phone format validation
- [ ] **Conditional Validation**: Make fields required based on conditions
- [ ] **Validation Rules Config**: Configurable validation rules
- [ ] **Validation Library**: Use validation library (e.g., VeeValidate)
- [ ] **Accessibility**: Better ARIA labels for screen readers
- [ ] **Visual Feedback**: More visual indicators (icons, animations)

### Known Issues

- **Number Input**: HTML number input may allow invalid values
- **Photo Validation**: May not detect if all photos fail to upload
- **Race Conditions**: Rapid typing may cause validation flicker
- **Error Persistence**: Errors may persist after successful submission
- **Mobile Validation**: May not work well on mobile keyboards

