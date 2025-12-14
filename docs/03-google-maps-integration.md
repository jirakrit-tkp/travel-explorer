# Feature: Google Maps Integration

## 1. Overview

The Google Maps integration provides interactive map functionality for location selection and visualization. Users can click on the map to select trip locations, drag markers to adjust positions, and view trip locations on detailed maps.

**Purpose:**
- Visual location selection for trips
- Display trip locations on interactive maps
- Click-to-select location functionality
- Drag-and-drop marker positioning
- Coordinate auto-fill from map clicks
- Location visualization in trip details

**Key Capabilities:**
- **Interactive Map**: Click anywhere to place marker
- **Draggable Markers**: Adjust location by dragging marker
- **Auto-coordinate Fill**: Latitude/longitude auto-populated from map selection
- **Location Display**: Show trip locations in detail view
- **Default Location**: Bangkok as default center point
- **Zoom Control**: Configurable zoom levels

---

## 2. Architecture / Flow

### Map Initialization Flow
```
Component mounts → Check for Google Maps API key
  → Load Google Maps script dynamically
  → Wait for script to load
  → Initialize map with default center (Bangkok)
  → Create marker if coordinates provided
  → Set up click listener (if clickable)
```

### Location Selection Flow
```
User clicks on map → Click event fires
  → Get lat/lng from click event
  → Update or create marker at clicked position
  → Emit 'locationSelect' event with coordinates
  → Parent component updates latitude/longitude fields
  → Clear validation errors
```

### Marker Drag Flow
```
User drags marker → Dragend event fires
  → Get new lat/lng from marker position
  → Emit 'locationSelect' event with new coordinates
  → Parent component updates latitude/longitude fields
```

### Map Update Flow (Props Change)
```
Props (latitude/longitude) change → Watch triggers
  → Update marker position
  → Center map on new location
  → Update marker title
```

---

## 3. Tech Stack & Libraries

### Core Technologies

| Library/API | Purpose | Why This Choice | How It Works |
|------------|---------|----------------|--------------|
| **Google Maps JavaScript API** | Map rendering and interaction | - Industry standard<br>- Rich features<br>- Good documentation<br>- Free tier available | Loads Google Maps script dynamically. Creates Map instance with center/zoom. Adds Marker for location display |
| **Dynamic Script Loading** | Load Google Maps on demand | - No bundle bloat<br>- Load only when needed<br>- Configurable API key | Creates `<script>` tag with API key. Waits for `onload` event. Resolves promise when loaded |
| **Vue 3 Watch** | React to prop changes | - Built into Vue<br>- Automatic reactivity<br>- Efficient updates | Watches latitude/longitude props. Updates map/marker when props change |

---

## 4. Core Logic

### 4.1 GoogleMap Component

**Location:** `src/components/GoogleMap.vue`

**Props:**
```typescript
interface Props {
  latitude?: number      // Optional, defaults to Bangkok
  longitude?: number     // Optional, defaults to Bangkok
  title?: string         // Marker title, defaults to 'ตำแหน่ง'
  zoom?: number          // Map zoom level, defaults to 14
  clickable?: boolean    // Enable click-to-select, defaults to false
}
```

**Events:**
```typescript
emit('locationSelect', { latitude: number, longitude: number })
```

**Map Initialization:**
```typescript
const initializeMap = async () => {
  if (!mapElement.value) return

  const maps = await loadGoogleMaps(import.meta.env.VITE_GOOGLE_MAP_KEY)

  const center = {
    lat: props.latitude ?? 13.736717,  // Bangkok default
    lng: props.longitude ?? 100.523186,
  }

  mapInstance.value = new maps.Map(mapElement.value, {
    zoom: props.zoom,
    center,
  })

  // Create marker if coordinates provided
  if (props.latitude !== undefined && props.longitude !== undefined) {
    markerInstance.value = new maps.Marker({
      position: { lat: props.latitude, lng: props.longitude },
      map: mapInstance.value,
      title: props.title,
      draggable: props.clickable,
    })
  }

  // Add click listener if clickable
  if (props.clickable) {
    clickListener.value = mapInstance.value.addListener('click', (event: any) => {
      const lat = event.latLng.lat()
      const lng = event.latLng.lng()

      // Update or create marker
      if (markerInstance.value) {
        markerInstance.value.setPosition({ lat, lng })
      } else {
        const maps = window.google?.maps
        if (maps) {
          markerInstance.value = new maps.Marker({
            position: { lat, lng },
            map: mapInstance.value,
            title: props.title,
            draggable: true,
          })
        }
      }

      // Emit event
      emit('locationSelect', { latitude: lat, longitude: lng })
    })

    // Add drag listener
    if (markerInstance.value) {
      markerInstance.value.addListener('dragend', (event: any) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        emit('locationSelect', { latitude: lat, longitude: lng })
      })
    }
  }
}
```

**Map Update (Props Change):**
```typescript
watch(
  () => [props.latitude, props.longitude, props.title],
  () => {
    if (mapInstance.value) {
      const lat = props.latitude ?? 13.736717
      const lng = props.longitude ?? 100.523186

      if (markerInstance.value) {
        const newPosition = { lat, lng }
        markerInstance.value.setPosition(newPosition)
        mapInstance.value.setCenter(newPosition)
        markerInstance.value.setTitle(props.title)
      } else if (props.latitude !== undefined && props.longitude !== undefined) {
        // Create marker if it doesn't exist
        const maps = window.google?.maps
        if (maps) {
          markerInstance.value = new maps.Marker({
            position: { lat, lng },
            map: mapInstance.value,
            title: props.title,
            draggable: props.clickable,
          })
        }
      }
    }
  },
)
```

### 4.2 loadGoogleMaps Utility

**Location:** `src/utils/loadGoogleMaps.ts`

```typescript
export function loadGoogleMaps(apiKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.google && window.google.maps) {
      resolve(window.google.maps)
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google.maps)
      } else {
        reject(new Error('Google Maps failed to load'))
      }
    }

    script.onerror = () => reject(new Error('Failed to load Google Maps script'))

    document.head.appendChild(script)
  })
}
```

### 4.3 Integration in TripForm

**Location:** `src/components/TripForm.vue`

```typescript
// Computed for map coordinates
const mapLatitude = computed(() => {
  const lat = parseFloat(latitude.value)
  return isNaN(lat) ? undefined : lat
})

const mapLongitude = computed(() => {
  const lon = parseFloat(longitude.value)
  return isNaN(lon) ? undefined : lon
})

// Handle location selection from map
const handleLocationSelect = (data: { latitude: number; longitude: number }) => {
  latitude.value = data.latitude.toString()
  longitude.value = data.longitude.toString()
  // Clear errors when location is selected
  if (errors.value.latitude) errors.value.latitude = false
  if (errors.value.longitude) errors.value.longitude = false
}
```

**Template:**
```vue
<GoogleMap
  :latitude="mapLatitude"
  :longitude="mapLongitude"
  :clickable="true"
  :zoom="10"
  @location-select="handleLocationSelect"
/>
```

### 4.4 Integration in TripDetailView

**Location:** `src/views/TripDetailView.vue`

```vue
<GoogleMap
  :latitude="trip.latitude"
  :longitude="trip.longitude"
  :title="trip.title"
  :zoom="14"
/>
```

---

## 5. Data Model / State Structure

### Component State

```typescript
const mapElement = ref<HTMLDivElement | null>(null)  // Map container DOM element
const mapInstance = ref<any>(null)                    // Google Maps Map instance
const markerInstance = ref<any>(null)                 // Google Maps Marker instance
const clickListener = ref<any>(null)                  // Click event listener
```

### Event Data

```typescript
interface LocationSelectEvent {
  latitude: number
  longitude: number
}
```

---

## 6. Edge Cases / Limitations / TODO

### Edge Cases Handled

1. **Missing API Key**: Error thrown if API key not provided
2. **Script Load Failure**: Promise rejects with error message
3. **Already Loaded**: Checks if Google Maps already loaded (prevents duplicate scripts)
4. **Invalid Coordinates**: Defaults to Bangkok if coordinates invalid
5. **Marker Creation**: Creates marker only if coordinates provided
6. **Listener Cleanup**: Removes event listeners on component unmount
7. **Props Update**: Updates map/marker when props change

### Current Limitations

1. **No Geocoding**: Cannot search by address (only coordinates)
2. **No Reverse Geocoding**: Cannot display address from coordinates
3. **No Places API**: Cannot search for places/POIs
4. **No Directions**: No route/directions functionality
5. **No Street View**: No Street View integration
6. **No Custom Markers**: Uses default Google Maps marker
7. **No Map Styles**: Uses default map style
8. **No Clustering**: No marker clustering for multiple locations
9. **No Info Windows**: No popup windows on markers
10. **No Drawing Tools**: Cannot draw shapes/polygons

### TODO / Future Enhancements

- [ ] **Geocoding**: Search locations by address
- [ ] **Reverse Geocoding**: Display address from coordinates
- [ ] **Places API**: Search for nearby places/POIs
- [ ] **Directions**: Show routes between locations
- [ ] **Street View**: Integrate Street View
- [ ] **Custom Markers**: Use custom marker icons
- [ ] **Map Styles**: Apply custom map styles
- [ ] **Marker Clustering**: Cluster markers for multiple trips
- [ ] **Info Windows**: Show trip info in popup
- [ ] **Drawing Tools**: Allow drawing shapes/polygons
- [ ] **Map Controls**: Add custom map controls
- [ ] **Offline Maps**: Cache map tiles for offline use
- [ ] **Map Sharing**: Share map view via URL
- [ ] **Heat Maps**: Show trip density with heat map

### Known Issues

- **API Key Exposure**: API key visible in client-side code (use restrictions in Google Cloud Console)
- **Rate Limiting**: No client-side rate limiting (Google handles server-side)
- **Script Loading**: May cause layout shift if script loads slowly
- **Memory Leaks**: Event listeners must be cleaned up properly
- **Mobile Performance**: May be slow on low-end mobile devices

