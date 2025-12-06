<template>
  <div ref="mapElement" class="map"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { loadGoogleMaps } from '../utils/loadGoogleMaps'

interface Props {
  latitude?: number
  longitude?: number
  title?: string
  zoom?: number
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'ตำแหน่ง',
  zoom: 14,
  clickable: false,
  latitude: 13.736717, // Bangkok default
  longitude: 100.523186, // Bangkok default
})

const emit = defineEmits<{
  (event: 'locationSelect', data: { latitude: number; longitude: number }): void
}>()

const mapElement = ref<HTMLDivElement | null>(null)
const mapInstance = ref<any>(null)
const markerInstance = ref<any>(null)
const clickListener = ref<any>(null)

const initializeMap = async () => {
  if (!mapElement.value) return

  const maps = await loadGoogleMaps(import.meta.env.VITE_GOOGLE_MAP_KEY)

  const center = {
    lat: props.latitude ?? 13.736717,
    lng: props.longitude ?? 100.523186,
  }

  mapInstance.value = new maps.Map(mapElement.value, {
    zoom: props.zoom,
    center,
  })

  // Only show marker if lat/lng are provided
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

    // Add drag listener if marker is draggable
    if (markerInstance.value) {
      markerInstance.value.addListener('dragend', (event: any) => {
        const lat = event.latLng.lat()
        const lng = event.latLng.lng()
        emit('locationSelect', { latitude: lat, longitude: lng })
      })
    }
  }
}

const updateMarker = () => {
  if (!mapInstance.value) return

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
      if (props.clickable) {
        markerInstance.value.addListener('dragend', (event: any) => {
          const lat = event.latLng.lat()
          const lng = event.latLng.lng()
          emit('locationSelect', { latitude: lat, longitude: lng })
        })
      }
    }
  }
}

onMounted(() => {
  initializeMap()
})

watch(
  () => [props.latitude, props.longitude, props.title],
  () => {
    if (mapInstance.value) {
      updateMarker()
    }
  },
)

// Cleanup listener on unmount
onBeforeUnmount(() => {
  if (clickListener.value && mapInstance.value) {
    const maps = window.google?.maps
    if (maps) {
      maps.event.removeListener(clickListener.value)
    }
  }
})
</script>
  
  <style>
  .map {
    width: 100%;
    height: 400px;
  }
  </style>
  