# Feature: Search & Filtering

## 1. Overview

The search and filtering system allows users to find trips by keywords, tags, or location. It includes real-time search suggestions, tag-based filtering, and search result sorting. The system searches across trip titles, descriptions, and tags.

**Purpose:**
- Search trips by keywords
- Filter trips by tags
- Real-time search suggestions
- Search across multiple fields (title, description, tags)
- Display search results with pagination
- Sort results by creation date

**Key Capabilities:**
- **Keyword Search**: Search in titles, descriptions, and tags
- **Tag Filtering**: Click tags to filter trips
- **Search Suggestions**: Real-time suggestions as user types
- **Search History**: Maintains search query in input
- **Result Sorting**: Results sorted by creation date (newest first)

---

## 2. Architecture / Flow

### Search Flow
```
User types in search bar → Debounce (300ms)
  → fetchSuggestions(query)
  → GET /api/trips/search?q={query}
  → Display suggestions dropdown
  → User clicks suggestion or presses Enter
  → fetchTrips(query)
  → GET /api/trips/search?q={query}
  → Display results with pagination
  → Reset to page 1
```

### Tag Filter Flow
```
User clicks tag on trip card → handleTagSelected(tag)
  → Set searchQuery to tag
  → Clear suggestions
  → fetchTrips(tag)
  → GET /api/trips/search?q={tag}
  → Display filtered results
```

### Suggestion Selection Flow
```
User clicks suggestion → handleSelectSuggestion(trip)
  → Set searchQuery to trip title
  → Clear suggestions
  → fetchTrips(trip.title)
  → Display results
```

---

## 3. Tech Stack & Libraries

### Core Technologies

| Library/API | Purpose | Why This Choice | How It Works |
|------------|---------|----------------|--------------|
| **Debouncing** | Limit API calls | - Reduces server load<br>- Better UX<br>- Native JavaScript | Uses `setTimeout` to delay API calls. Clears timeout on new input. Only calls API after 300ms of no typing |
| **Vue Watch** | React to input changes | - Built into Vue<br>- Automatic reactivity<br>- Efficient updates | Watches `searchQuery` ref. Triggers debounced function on change |
| **Axios** | HTTP client for search | - Promise-based<br>- Query parameter support<br>- Error handling | GET request with `q` query parameter. Backend searches across title, description, tags |

---

## 4. Core Logic

### 4.1 Search Implementation

**Location:** `src/views/LandingView.vue`

```typescript
const searchQuery = ref('')
const suggestions = ref<Trip[]>([])
const searchContainerRef = ref<HTMLElement | null>(null)
let suggestionTimeoutId: number | null = null

const fetchTrips = async (query?: string) => {
  loading.value = true
  error.value = ''
  currentPage.value = 1 // Reset to first page
  
  try {
    let response: AxiosResponse<Trip[]>
    if (query && query.trim()) {
      response = await tripsAPI.search(query.trim())
    } else {
      response = await tripsAPI.getAll()
    }
    
    // Sort by createdAt (newest first)
    trips.value = response.data.sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return b.id - a.id
    })
  } catch (err) {
    error.value = 'ไม่สามารถโหลดทริปได้'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  fetchTrips(searchQuery.value)
}
```

### 4.2 Search Suggestions (Debounced)

```typescript
const fetchSuggestions = async (query: string) => {
  if (!query.trim()) {
    suggestions.value = []
    return
  }

  try {
    const response: AxiosResponse<Trip[]> = await tripsAPI.search(query.trim())
    suggestions.value = response.data
  } catch (err) {
    // Silently fail - just don't show suggestions
    console.error(err)
  }
}

// Watch searchQuery with debouncing
watch(
  searchQuery,
  (value) => {
    if (suggestionTimeoutId !== null) {
      window.clearTimeout(suggestionTimeoutId)
    }

    suggestionTimeoutId = window.setTimeout(() => {
      fetchSuggestions(value)
    }, 300) // 300ms debounce
  },
)
```

### 4.3 Suggestion Selection

```typescript
const handleSelectSuggestion = (trip: Trip) => {
  searchQuery.value = trip.title
  suggestions.value = []
  fetchTrips(trip.title)
}
```

### 4.4 Tag Filtering

```typescript
const handleTagSelected = (tag: string) => {
  searchQuery.value = tag
  suggestions.value = []
  fetchTrips(tag)
}
```

### 4.5 Click Outside Handler

```typescript
const handleClickOutside = (event: MouseEvent) => {
  if (!searchContainerRef.value) return

  const target = event.target as HTMLElement | null
  if (target && !searchContainerRef.value.contains(target)) {
    suggestions.value = []
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})
```

### 4.6 Search UI

```vue
<div ref="searchContainerRef" class="relative flex-1 w-full">
  <input
    v-model="searchQuery"
    type="text"
    placeholder="ค้นหาทริป..."
    class="w-full px-4 py-3 pr-10 border-b-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
    @keyup.enter="handleSearch"
  />
  <button
    type="button"
    @click="handleSearch"
    class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-sky-600 transition-colors cursor-pointer"
  >
    <Search class="h-5 w-5" />
  </button>

  <!-- Suggestions dropdown -->
  <ul
    v-if="suggestions.length > 0 && searchQuery.trim()"
    class="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto"
  >
    <li v-for="trip in suggestions" :key="trip.id">
      <button
        type="button"
        class="w-full text-left px-4 py-2 hover:bg-sky-50"
        @click="handleSelectSuggestion(trip)"
      >
        {{ trip.title }}
      </button>
    </li>
  </ul>
</div>
```

---

## 5. Data Model / State Structure

### Component State

```typescript
const searchQuery = ref('')           // Search input value
const suggestions = ref<Trip[]>([])   // Search suggestions
const trips = ref<Trip[]>([])         // Search results
const loading = ref(false)            // Loading state
const error = ref('')                 // Error message
```

### Search API Response

```typescript
interface Trip {
  id: number
  title: string
  description: string
  photos: string[]
  tags: string[]
  authorId?: number
  createdAt?: string
}
```

---

## 6. Edge Cases / Limitations / TODO

### Edge Cases Handled

1. **Empty Query**: Clears suggestions if query is empty
2. **Debounce Race Condition**: Clears previous timeout on new input
3. **Click Outside**: Closes suggestions when clicking outside
4. **Enter Key**: Submits search on Enter key press
5. **No Results**: Displays "ไม่พบทริป" message
6. **Network Errors**: Handles errors gracefully
7. **Special Characters**: Handles special characters in search query

### Current Limitations

1. **No Advanced Filters**: Cannot filter by date, location, author
2. **No Search History**: No saved search history
3. **No Search Operators**: No AND/OR/NOT operators
4. **No Fuzzy Search**: No typo tolerance
5. **No Autocomplete**: No autocomplete for tags
6. **No Search Analytics**: No tracking of popular searches
7. **No Saved Searches**: Cannot save search queries
8. **No Search Suggestions**: No "Did you mean?" suggestions
9. **No Search Highlighting**: No highlighting of matched terms
10. **No Sort Options**: Only sorted by date (no relevance sort)

### TODO / Future Enhancements

- [ ] **Advanced Filters**: Filter by date range, location, author
- [ ] **Search History**: Save and display recent searches
- [ ] **Search Operators**: Support AND/OR/NOT operators
- [ ] **Fuzzy Search**: Typo tolerance and fuzzy matching
- [ ] **Tag Autocomplete**: Autocomplete for tag input
- [ ] **Search Analytics**: Track popular searches
- [ ] **Saved Searches**: Save and manage search queries
- [ ] **Search Suggestions**: "Did you mean?" suggestions
- [ ] **Search Highlighting**: Highlight matched terms in results
- [ ] **Sort Options**: Sort by relevance, date, popularity
- [ ] **Search Filters UI**: Visual filter panel
- [ ] **Location-based Search**: Search by map area
- [ ] **Date Range Search**: Filter by trip dates
- [ ] **Author Search**: Filter by trip author

### Known Issues

- **Debounce Delay**: 300ms delay may feel slow for some users
- **No Result Caching**: Same query may hit API multiple times
- **Case Sensitivity**: Search may be case-sensitive (backend dependent)
- **Special Characters**: Some special characters may break search
- **Long Queries**: Very long queries may cause performance issues

