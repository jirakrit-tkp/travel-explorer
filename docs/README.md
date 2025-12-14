# Travel Explorer - Feature Documentation

This directory contains detailed documentation for all major features of the Travel Explorer application.

## 📚 Documentation Index

1. **[Authentication System](./01-authentication.md)**
   - User registration and login
   - JWT token management
   - Session persistence
   - Protected routes

2. **[Trip Management (CRUD)](./02-trip-management.md)**
   - Create, read, update, delete trips
   - Trip ownership control
   - Photo carousel with auto-slide
   - Trip detail view

3. **[Google Maps Integration](./03-google-maps-integration.md)**
   - Interactive map for location selection
   - Click-to-select functionality
   - Draggable markers
   - Location display

4. **[Photo Upload & Management](./04-photo-management.md)**
   - Multiple photo upload
   - Photo preview
   - Main photo selection
   - Photo deletion

5. **[Markdown Editor](./05-markdown-editor.md)**
   - Markdown formatting toolbar
   - Markdown to HTML conversion
   - Markdown cleaning for previews
   - Text selection wrapping

6. **[Search & Filtering](./06-search-filtering.md)**
   - Keyword search
   - Tag-based filtering
   - Real-time search suggestions
   - Search result sorting

7. **[Pagination System](./07-pagination.md)**
   - Page navigation (Previous/Next)
   - Page selector dropdown
   - Auto-scroll on page change
   - Smart page reset

8. **[Form Validation](./08-form-validation.md)**
   - Required field validation
   - Format validation (coordinates)
   - Visual error indicators
   - Real-time error clearing

9. **[User Feedback System](./09-user-feedback.md)**
   - Snackbar notifications
   - Confirm modal dialogs
   - Auto-dismiss timers
   - Success/error messaging

## 🎯 Quick Reference

### Common Patterns

**Using Composables:**
```typescript
import { useAuth } from '../composables/useAuth'
import { useSnackbar } from '../composables/useSnackbar'
import { useConfirm } from '../composables/useConfirm'

const { user, isAuthenticated, login, logout } = useAuth()
const { showSnackbar } = useSnackbar()
const { confirm: showConfirm } = useConfirm()
```

**API Calls:**
```typescript
import { tripsAPI, filesAPI } from '../services/api'

// Get all trips
const response = await tripsAPI.getAll()

// Create trip
const response = await tripsAPI.create(tripData)

// Upload file
const response = await filesAPI.upload(file)
```

**Form Validation:**
```typescript
const validateForm = () => {
  // Reset errors
  errors.value = { /* ... */ }
  
  // Validate each field
  if (!field.value.trim()) {
    errors.value.field = true
    return false
  }
  
  return true
}
```

## 📖 Reading Guide

Each feature documentation follows this structure:

1. **Overview** - Purpose and key capabilities
2. **Architecture / Flow** - How the feature works
3. **Tech Stack & Libraries** - Technologies used
4. **Core Logic** - Implementation details
5. **Data Model / State Structure** - Data structures
6. **Edge Cases / Limitations / TODO** - Known issues and future plans

## 🔗 Related Documentation

- [API Documentation](../API_DOCUMENTATION.md) - Backend API reference
- [README](../README.md) - Project overview and setup

## 📝 Contributing

When adding new features:

1. Create a new documentation file following the existing format
2. Update this README with a link to the new documentation
3. Include code examples and architecture diagrams
4. Document edge cases and limitations
5. Add TODO items for future enhancements

