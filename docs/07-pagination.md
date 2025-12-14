# Feature: Pagination System

## 1. Overview

The pagination system divides trip lists into manageable pages, displaying 8 trips per page. It includes Previous/Next navigation buttons, a page selector dropdown, and automatic page reset on new searches. The system provides smooth scrolling and maintains page state during navigation.

**Purpose:**
- Display trips in manageable chunks (8 per page)
- Navigate between pages efficiently
- Jump to specific pages via dropdown
- Reset pagination on new searches
- Maintain page state during navigation
- Provide visual feedback for current page

**Key Capabilities:**
- **Page Navigation**: Previous/Next buttons for sequential navigation
- **Page Selector**: Dropdown to jump to any page
- **Page Counter**: Display current page and total pages
- **Auto-scroll**: Scroll to top when changing pages
- **Auto-reset**: Reset to page 1 on new data fetch
- **Smart Reset**: Reset to page 1 if current page becomes empty

---

## 2. Architecture / Flow

### Pagination Initialization Flow
```
Component mounts → Initialize currentPage = 1
  → Calculate totalPages from trips.length / itemsPerPage
  → Display first page of trips
  → Show pagination controls
```

### Page Navigation Flow
```
User clicks "Next" → nextPage()
  → Check if currentPage < totalPages
  → Increment currentPage
  → Scroll to top
  → Display new page of trips
```

### Page Selection Flow
```
User selects page from dropdown → goToPage(page)
  → Validate page number (1 to totalPages)
  → Set currentPage = page
  → Scroll to top
  → Display selected page of trips
```

### Data Fetch Flow
```
New data fetched → Reset currentPage = 1
  → Recalculate totalPages
  → Display first page
  → Update pagination controls
```

### Delete Flow
```
Trip deleted → Remove from trips array
  → Recalculate totalPages
  → Check if current page is empty
  → If empty and not page 1, reset to page 1
  → Update pagination controls
```

---

## 3. Tech Stack & Libraries

### Core Technologies

| Library/API | Purpose | Why This Choice | How It Works |
|------------|---------|----------------|--------------|
| **Vue 3 Computed** | Calculate paginated data | - Reactive<br>- Efficient<br>- Automatic updates | Computed property slices trips array based on currentPage. Automatically updates when trips or currentPage changes |
| **Array.slice()** | Extract page items | - Native JavaScript<br>- Efficient<br>- No dependencies | Slices array from start index to end index. Returns new array with page items |
| **window.scrollTo()** | Scroll to top | - Native browser API<br>- Smooth scrolling<br>- No dependencies | Scrolls window to top with smooth animation when page changes |

---

## 4. Core Logic

### 4.1 Pagination State

**Location:** `src/views/LandingView.vue` and `src/views/MyTripsView.vue`

```typescript
const currentPage = ref(1)
const itemsPerPage = 8

const totalPages = computed(() => {
  return Math.ceil(trips.value.length / itemsPerPage)
})

const paginatedTrips = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return trips.value.slice(start, end)
})
```

### 4.2 Navigation Functions

```typescript
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
```

### 4.3 Data Fetch with Reset

```typescript
const fetchTrips = async (query?: string) => {
  loading.value = true
  error.value = ''
  currentPage.value = 1 // Reset to first page when fetching new data
  
  try {
    // ... fetch trips ...
    trips.value = response.data
  } catch (err) {
    // ... error handling ...
  } finally {
    loading.value = false
  }
}
```

### 4.4 Delete Handler with Smart Reset

```typescript
const handleTripDeleted = (tripId: number) => {
  trips.value = trips.value.filter((t) => t.id !== tripId)
  // Reset to first page if current page becomes empty
  if (paginatedTrips.value.length === 0 && currentPage.value > 1) {
    currentPage.value = 1
  }
}
```

### 4.5 Pagination UI

```vue
<!-- Pagination -->
<div class="flex items-center justify-center gap-4 mt-8">
  <button
    type="button"
    @click="prevPage"
    :disabled="currentPage === 1"
    :class="[
      'px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer',
      currentPage === 1
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
        : 'bg-sky-500 text-white hover:bg-sky-600',
    ]"
  >
    Previous
  </button>
  
  <div class="flex items-center gap-2">
    <span class="text-gray-700 font-medium">หน้า</span>
    <select
      :value="currentPage"
      @change="goToPage(Number(($event.target as HTMLSelectElement).value))"
      class="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-gray-700 font-medium cursor-pointer"
    >
      <option v-for="page in totalPages" :key="page" :value="page">
        {{ page }}
      </option>
    </select>
    <span class="text-gray-700 font-medium">/ {{ totalPages }}</span>
  </div>
  
  <button
    type="button"
    @click="nextPage"
    :disabled="currentPage === totalPages"
    :class="[
      'px-4 py-2 rounded-lg font-semibold transition-colors cursor-pointer',
      currentPage === totalPages
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
        : 'bg-sky-500 text-white hover:bg-sky-600',
    ]"
  >
    Next
  </button>
</div>
```

---

## 5. Data Model / State Structure

### Component State

```typescript
const currentPage = ref(1)           // Current page number
const itemsPerPage = 8               // Items per page (constant)
const trips = ref<Trip[]>([])        // All trips (full dataset)
```

### Computed Properties

```typescript
const totalPages = computed(() => {
  return Math.ceil(trips.value.length / itemsPerPage)
})

const paginatedTrips = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return trips.value.slice(start, end)
})
```

---

## 6. Edge Cases / Limitations / TODO

### Edge Cases Handled

1. **Empty List**: Pagination still displays (shows "หน้า 1 / 1")
2. **Single Page**: Buttons disabled but still visible
3. **Page Out of Bounds**: Validation prevents invalid page numbers
4. **Empty Page After Delete**: Auto-resets to page 1 if current page empty
5. **Zero Items**: Handles division by zero (totalPages = 0)
6. **Page Reset on Search**: Resets to page 1 on new search
7. **Smooth Scrolling**: Scrolls to top on page change

### Current Limitations

1. **Client-Side Only**: All trips loaded, then paginated (not server-side)
2. **Fixed Page Size**: Cannot change items per page
3. **No Page Jump**: Cannot jump to first/last page directly
4. **No Keyboard Navigation**: No arrow key navigation
5. **No URL Parameters**: Page number not in URL (lost on refresh)
6. **No Infinite Scroll**: Must click to load next page
7. **No Loading State**: No loading indicator during page change
8. **No Page Caching**: Recalculates on every render
9. **No Virtual Scrolling**: Renders all items (performance issue with many items)

### TODO / Future Enhancements

- [ ] **Server-Side Pagination**: Paginate on backend (load only current page)
- [ ] **Configurable Page Size**: Allow users to choose items per page
- [ ] **Page Jump Buttons**: Add "First" and "Last" buttons
- [ ] **Keyboard Navigation**: Arrow keys for page navigation
- [ ] **URL Parameters**: Store page number in URL query params
- [ ] **Infinite Scroll**: Auto-load next page on scroll
- [ ] **Loading State**: Show loading indicator during page change
- [ ] **Page Caching**: Cache computed paginated data
- [ ] **Virtual Scrolling**: Only render visible items
- [ ] **Page Size Selector**: Dropdown to change items per page
- [ ] **Page Info**: Show "Showing X-Y of Z items"
- [ ] **Pagination Presets**: Quick jump to common pages
- [ ] **Mobile Optimization**: Touch-friendly pagination for mobile

### Known Issues

- **Performance**: Loading all trips then paginating may be slow with many trips
- **Memory Usage**: All trips stored in memory (not ideal for large datasets)
- **No Persistence**: Page number lost on page refresh
- **Race Conditions**: Rapid page changes may cause flickering
- **Scroll Position**: May lose scroll position on page change (intended behavior)

