import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import MyTripsView from '../views/MyTripsView.vue'
import CreateTripView from '../views/CreateTripView.vue'
import EditTripView from '../views/EditTripView.vue'
import TripDetailView from '../views/TripDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresGuest: true }
    },
    {
      path: '/my-trips',
      name: 'my-trips',
      component: MyTripsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/trips/create',
      name: 'create-trip',
      component: CreateTripView,
      meta: { requiresAuth: true }
    },
    {
      path: '/trips/:id',
      name: 'trip-detail',
      component: TripDetailView
    },
    {
      path: '/trips/:id/edit',
      name: 'edit-trip',
      component: EditTripView,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  // Check if route requires authentication
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest && isAuthenticated) {
    next({ name: 'my-trips' })
    return
  }

  next()
})

export default router

