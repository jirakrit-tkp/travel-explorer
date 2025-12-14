# Feature: Authentication System

## 1. Overview

The authentication system provides secure user registration, login, and session management using JWT (JSON Web Tokens). It integrates with the backend API to handle user authentication and maintains user state across the application using Vue 3 Composition API.

**Purpose:**
- Secure user registration and login
- JWT token management and storage
- User session persistence
- Protected route navigation
- Automatic token validation on app load
- Logout functionality

**Key Capabilities:**
- **Registration**: Create new user accounts with email, password, and display name
- **Login**: Authenticate existing users and receive JWT token
- **Token Storage**: Persist tokens in localStorage for session continuity
- **Auto-validation**: Automatically fetch user data on app initialization
- **Protected Routes**: Route guards prevent unauthorized access
- **Logout**: Clear tokens and user data

---

## 2. Architecture / Flow

### Registration Flow
```
User fills registration form → POST /api/auth/register
  → Backend validates and creates user
  → Returns: { token, email, displayName, userId }
  → Store token in localStorage
  → Set user state in useAuth composable
  → Redirect to home page or "My Trips"
```

### Login Flow
```
User fills login form → POST /api/auth/login
  → Backend validates credentials
  → Returns: { token, email, displayName, userId }
  → Store token in localStorage
  → Set user state in useAuth composable
  → Redirect to home page or "My Trips"
```

### Session Initialization Flow
```
App loads → Check localStorage for token
  ├─ Token exists? → GET /api/auth/me
  │   ├─ Valid token? → Set user state
  │   └─ Invalid token? → Clear token and redirect to login
  └─ No token? → User remains unauthenticated
```

### Logout Flow
```
User clicks logout → POST /api/auth/logout
  → Clear token from localStorage
  → Clear user state
  → Redirect to home page
```

### Protected Route Flow
```
User navigates to protected route → Router guard checks
  ├─ isAuthenticated = true? → Allow access
  └─ isAuthenticated = false? → Redirect to /login
```

---

## 3. Tech Stack & Libraries

### Core Technologies

| Library/API | Purpose | Why This Choice | How It Works |
|------------|---------|----------------|--------------|
| **Vue 3 Composition API** | State management for auth | - Built into Vue 3<br>- Reactive state management<br>- Composable pattern for reusability<br>- TypeScript support | `useAuth()` composable exports reactive refs and methods. Components import and use the composable to access auth state and methods |
| **Axios** | HTTP client for API calls | - Promise-based<br>- Request/response interceptors<br>- Automatic JSON parsing<br>- Error handling | Creates axios instance with base URL. Interceptors add JWT token to requests and handle 401 errors |
| **Vue Router** | Route protection | - Built-in navigation guards<br>- Programmatic navigation<br>- Route meta fields | `beforeEach` guard checks authentication status. Redirects unauthenticated users to login |
| **localStorage** | Token persistence | - Browser-native storage<br>- Persists across sessions<br>- No external dependencies | Stores JWT token as string. Retrieved on app initialization to restore session |

---

## 4. Core Logic

### 4.1 useAuth Composable

**Location:** `src/composables/useAuth.ts`

```typescript
export const useAuth = () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  
  const isAuthenticated = computed(() => !!token.value)
  
  // Login function
  const login = async (email: string, password: string) => {
    const response = await authAPI.login(email, password)
    token.value = response.data.token
    localStorage.setItem('token', token.value)
    user.value = { email, displayName, userId }
    return { success: true }
  }
  
  // Register function
  const register = async (email: string, password: string, displayName?: string) => {
    const response = await authAPI.register(email, password, displayName)
    token.value = response.data.token
    localStorage.setItem('token', token.value)
    user.value = { email, displayName, userId }
    return { success: true }
  }
  
  // Logout function
  const logout = async () => {
    await authAPI.logout()
    token.value = null
    user.value = null
    localStorage.removeItem('token')
  }
  
  // Fetch current user
  const fetchUser = async () => {
    if (!token.value) return
    const response = await authAPI.getMe()
    user.value = response.data
  }
  
  return { user, token, isAuthenticated, login, register, logout, fetchUser }
}
```

### 4.2 API Interceptor

**Location:** `src/services/api.ts`

```typescript
// Request interceptor - Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor - Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### 4.3 Route Guard

**Location:** `src/router/index.js`

```javascript
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token
  
  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ path: '/login', query: { redirect: to.fullPath } })
    } else {
      next()
    }
  } else {
    next()
  }
})
```

### 4.4 Login Component

**Location:** `src/views/LoginView.vue`

```vue
<script setup>
import { useAuth } from '../composables/useAuth'
import { useRouter } from 'vue-router'

const { login } = useAuth()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  const result = await login(email.value, password.value)
  
  if (result.success) {
    router.push('/my-trips')
  } else {
    error.value = result.error || 'Login failed'
  }
  
  loading.value = false
}
</script>
```

---

## 5. Data Model / State Structure

### User Interface

```typescript
interface User {
  email: string
  displayName: string
  userId: number
}
```

### Auth Response Interface

```typescript
interface AuthResponse {
  token: string
  email: string
  displayName: string
  userId: number
}
```

### State Management

```typescript
// Global state (singleton pattern via composable)
const user = ref<User | null>(null)           // Current user data
const token = ref<string | null>(null)        // JWT token
const isAuthenticated = computed(() => !!token.value)  // Auth status
```

---

## 6. Edge Cases / Limitations / TODO

### Edge Cases Handled

1. **Token Expiration**: Interceptor detects 401 and redirects to login
2. **Invalid Token**: `fetchUser()` fails silently, clears invalid token
3. **Network Errors**: Login/register functions return error object instead of throwing
4. **Concurrent Requests**: Axios handles multiple requests with same token
5. **Protected Route Access**: Router guard prevents unauthorized navigation
6. **Logout on Error**: 401 errors trigger automatic logout

### Current Limitations

1. **No Token Refresh**: Tokens expire after 24 hours, user must re-login
2. **No Remember Me**: No option to extend session duration
3. **No Password Reset**: Frontend doesn't handle password reset flow
4. **No Social Login**: Only email/password authentication
5. **No Session Timeout Warning**: No warning before token expires
6. **No Multi-tab Sync**: Token changes in one tab don't sync to others
7. **No Biometric Auth**: No fingerprint/face ID support

### TODO / Future Enhancements

- [ ] **Token Refresh**: Implement refresh token mechanism
- [ ] **Remember Me**: Add option to extend session duration
- [ ] **Password Reset**: Implement forgot password flow
- [ ] **Social Login**: Add Google/Facebook OAuth
- [ ] **Session Timeout Warning**: Warn users before token expires
- [ ] **Multi-tab Sync**: Use BroadcastChannel API for cross-tab sync
- [ ] **Biometric Auth**: Add fingerprint/face ID support
- [ ] **Two-Factor Authentication**: Add 2FA support
- [ ] **Account Verification**: Email verification flow
- [ ] **Session Management**: View and revoke active sessions
- [ ] **Activity Logging**: Track login/logout events

### Known Issues

- **Token Storage Security**: localStorage is vulnerable to XSS attacks (consider httpOnly cookies)
- **No CSRF Protection**: No CSRF token implementation
- **Race Condition**: Multiple simultaneous login attempts not handled
- **No Rate Limiting**: Frontend doesn't limit login attempts

