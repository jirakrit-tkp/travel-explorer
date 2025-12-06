# Travel Explorer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

[![Vue Version](https://img.shields.io/badge/vue-3.5.24-green)](https://vuejs.org/)

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue)](https://www.typescriptlang.org/)

A modern, full-featured travel sharing platform where users can create, discover, and share their travel experiences. Built with Vue 3, TypeScript, and integrated with Google Maps for location-based trip management.

## 📋 Table of Contents

- [Project Description](#-project-description)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Project Structure](#-project-structure)
- [API Documentation](#-api-documentation)
- [Performance Optimizations](#-performance-optimizations)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [Credits](#-credits)
- [License](#-license)

## 🎯 Project Description

**Travel Explorer** is a comprehensive travel sharing platform designed for travelers who want to document and share their adventures. It provides an intuitive interface for creating detailed trip posts with photos, locations, and markdown-formatted descriptions.

### What makes it stand out?

- **Google Maps Integration**: Interactive map for location selection and visualization
- **Markdown Support**: Rich text editing with markdown syntax for trip descriptions
- **Photo Management**: Upload and organize multiple photos with main photo selection
- **Location-Based**: Store and display trip locations with latitude/longitude coordinates
- **Pagination**: Efficient browsing with 8 trips per page and page selector
- **Real-time Validation**: Form validation with visual error feedback
- **Responsive Design**: Beautiful, mobile-friendly UI built with TailwindCSS
- **JWT Authentication**: Secure user authentication and authorization

### Key Challenges Solved

1. **Form Validation**: Comprehensive validation for all required fields with visual error indicators
2. **Map Integration**: Seamless Google Maps integration for location selection and display
3. **Photo Upload**: Multiple photo upload with preview and main photo selection
4. **Markdown Rendering**: Clean markdown-to-HTML conversion for trip descriptions
5. **Pagination**: Client-side pagination with page navigation and dropdown selector
6. **State Management**: Efficient state management with Vue 3 Composition API

## ✨ Features

### For All Users

- 🌍 Browse and discover travel trips from other users
- 🔍 Search trips by keywords, tags, or location
- 📸 View trip photos in a beautiful carousel with auto-slide
- 🗺️ See trip locations on interactive Google Maps
- 🏷️ Filter trips by tags
- 📱 Fully responsive design for mobile and desktop

### For Authenticated Users

- ✍️ Create new trips with photos, descriptions, and locations
- ✏️ Edit your own trips
- 🗑️ Delete your trips
- 📋 Manage all your trips in "My Trips" page
- 🔐 Secure authentication with JWT tokens
- 📝 Markdown editor for rich trip descriptions
- 📍 Click-to-select location on Google Maps
- 🖼️ Upload and organize multiple photos per trip

### System Features

- 🚀 Fast and optimized with Vite build tool
- 🔒 JWT-based authentication with protected routes
- 🎨 Beautiful UI with TailwindCSS
- ⚡ Performance optimized with pagination
- 📱 Fully responsive design
- 🌐 SEO-friendly routing
- 🔧 Comprehensive error handling
- 💬 User feedback with Snackbar notifications
- ✅ Confirmation modals for destructive actions

## 🛠 Tech Stack

### Frontend

- **Framework**: Vue 3.5.24
- **Language**: TypeScript 5.9.3
- **Build Tool**: Vite 7.2.4
- **Routing**: Vue Router 4.6.3
- **Styling**: TailwindCSS 4.1.17
- **Icons**: Lucide Vue Next 0.473.0
- **HTTP Client**: Axios 1.13.2
- **Maps**: Google Maps JavaScript API

### Development Tools

- **Type Checking**: Vue TSC 3.1.4
- **Linting**: TypeScript strict mode
- **Package Manager**: npm

### Backend API

- **Base URL**: `https://travel-explorer-server.onrender.com/api`
- **Authentication**: JWT Bearer Token
- **File Upload**: Multipart form data

## 📦 Installation & Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (version 18.0.0 or higher)
- npm (comes with Node.js)
- Git
- Google Maps API key (for map features)

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-username/travel-explorer.git
cd travel-explorer
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_MAP_KEY=your_google_maps_api_key_here
```

**Note**: Get your Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/).

### Step 4: Run the Application

#### Development Mode

```bash
npm run dev
```

This will start the development server on `http://localhost:5173`

#### Build for Production

```bash
npm run build
```

This will create an optimized production build in the `dist/` directory.

#### Preview Production Build

```bash
npm run preview
```

## 📖 Usage Guide

### Creating Your First Account

1. Navigate to the registration page
2. Fill in your email, password, and display name
3. Click "สมัครสมาชิก" to create your account
4. You'll be automatically logged in after registration

### Creating Your First Trip

1. Log in to your account
2. Click "สร้างทริปใหม่" in the navigation or go to "ทริปของฉัน"
3. Fill in the trip form:
   - **Photos**: Upload at least one photo (click "+ เพิ่มรูป" button)
   - **Title**: Enter your trip title (required)
   - **Tags**: Add comma-separated tags (required)
   - **Description**: Write your trip description in markdown (required)
   - **Location**: Click on the map to select location or enter latitude/longitude (required)
4. Click "สร้างทริป" to save your trip

### Markdown Examples

The description editor supports standard markdown:

```markdown
# Heading 1
## Heading 2

**Bold text** and *italic text*

- Bullet point 1
- Bullet point 2

1. Numbered list
2. Another item

[Link text](https://example.com)

`code snippet`
```

### Using Google Maps

1. **Select Location**: Click anywhere on the map to place a marker
2. **Drag Marker**: Drag the marker to adjust the location
3. **Auto-fill Coordinates**: Latitude and longitude will be automatically filled when you select a location

### Managing Your Trips

1. Go to "ทริปของฉัน" to see all your trips
2. Click on a trip card to view details
3. Use the edit button (pencil icon) to modify your trip
4. Use the delete button (trash icon) to remove your trip
5. Use pagination controls to navigate through multiple trips

### Searching Trips

1. Use the search bar on the landing page
2. Type keywords, tags, or location names
3. View suggestions as you type
4. Press Enter or click the search icon to search

## 📂 Project Structure

```
travel-explorer/
├── public/                      # Static assets
│   └── vite.svg
├── src/
│   ├── assets/                  # Images and other assets
│   ├── components/              # Vue components
│   │   ├── ConfirmModal.vue    # Confirmation dialog
│   │   ├── CTASection.vue      # Call-to-action section
│   │   ├── FeatureSection.vue   # Features showcase
│   │   ├── Footer.vue          # Footer component
│   │   ├── GoogleMap.vue        # Google Maps integration
│   │   ├── HeroSection.vue     # Hero section
│   │   ├── Navbar.vue          # Navigation bar
│   │   ├── Snackbar.vue        # Toast notifications
│   │   ├── TripCard.vue        # Trip card component
│   │   └── TripForm.vue        # Trip creation/edit form
│   ├── composables/            # Vue composables
│   │   ├── useAuth.ts          # Authentication logic
│   │   ├── useConfirm.ts       # Confirmation modal logic
│   │   └── useSnackbar.ts     # Snackbar notifications
│   ├── layouts/                # Layout components
│   │   └── DefaultLayout.vue  # Default page layout
│   ├── router/                 # Vue Router configuration
│   │   └── index.js
│   ├── services/               # API services
│   │   └── api.ts             # Axios API client
│   ├── utils/                  # Utility functions
│   │   ├── loadGoogleMaps.ts  # Google Maps loader
│   │   └── markdown.ts        # Markdown utilities
│   ├── views/                  # Page components
│   │   ├── CreateTripView.vue # Create trip page
│   │   ├── EditTripView.vue   # Edit trip page
│   │   ├── LandingView.vue    # Home page
│   │   ├── LoginView.vue      # Login page
│   │   ├── MyTripsView.vue    # My trips page
│   │   ├── RegisterView.vue   # Registration page
│   │   └── TripDetailView.vue # Trip detail page
│   ├── App.vue                # Root component
│   ├── main.ts                # Application entry point
│   └── style.css              # Global styles
├── API_DOCUMENTATION.md        # API documentation
├── index.html                  # HTML template
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
├── vite.config.ts             # Vite configuration
└── README.md                  # This file
```

## 🔌 API Documentation

### Base URL

Production: `https://travel-explorer-server.onrender.com/api`

### Authentication

Most endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login user | No |
| GET | `/auth/me` | Get current user | Yes |
| POST | `/auth/logout` | Logout user | Yes |

#### Trips

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/trips` | Get all trips | No |
| GET | `/trips/search?q={query}` | Search trips | No |
| GET | `/trips/:id` | Get trip by ID | No |
| GET | `/trips/mine` | Get user's trips | Yes |
| POST | `/trips` | Create new trip | Yes |
| PUT | `/trips/:id` | Update trip | Yes |
| DELETE | `/trips/:id` | Delete trip | Yes |

#### Files

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/files/upload` | Upload single file | Yes |
| POST | `/files/upload/multiple` | Upload multiple files | Yes |
| DELETE | `/files/upload?url={url}` | Delete file | Yes |

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### Example Request

```javascript
// Get all trips
const response = await axios.get('https://travel-explorer-server.onrender.com/api/trips');

// Create a trip (authenticated)
const token = localStorage.getItem('token');
const response = await axios.post(
  'https://travel-explorer-server.onrender.com/api/trips',
  {
    title: 'Trip to Phuket',
    description: 'Beautiful beaches and amazing food',
    photos: ['photo1.jpg', 'photo2.jpg'],
    tags: ['phuket', 'beach', 'thailand'],
    latitude: 7.8804,
    longitude: 98.3923
  },
  {
    headers: { Authorization: `Bearer ${token}` }
  }
);
```

## ⚡ Performance Optimizations

### Build Performance

- Fast build times with Vite
- TypeScript type checking integrated
- Optimized production builds

### Client-Side Optimizations

- **Pagination**: Display 8 trips per page to reduce initial load
- **Lazy Loading**: Images loaded on demand
- **Code Splitting**: Automatic code splitting with Vue Router
- **Markdown Cleaning**: Efficient markdown syntax removal for previews

### State Management

- Efficient state management with Vue 3 Composition API
- Computed properties for derived state
- Reactive refs for simple state

## 🗺️ Roadmap

### Planned Features

- [ ] **Trip Sharing**: Share trips on social media
- [ ] **Trip Collections**: Group related trips into collections
- [ ] **Advanced Search**: Filter by location, date, tags
- [ ] **Trip Templates**: Save and reuse trip templates
- [ ] **Export/Import**: Export trips as JSON or PDF
- [ ] **Trip Collaboration**: Allow multiple users to collaborate on a trip
- [ ] **Comments System**: Add comments to trips
- [ ] **Ratings**: Rate and review trips
- [ ] **Favorites**: Save favorite trips
- [ ] **Dark Mode**: Toggle between light and dark themes
- [ ] **Offline Support**: PWA capabilities for offline access
- [ ] **Trip Statistics**: View trip analytics and statistics
- [ ] **Email Notifications**: Email alerts for trip updates
- [ ] **Multi-language Support**: i18n for international users

### Future Enhancements

- Advanced image editing capabilities
- Integration with travel booking APIs
- Real-time collaboration features
- Mobile app (React Native or Flutter)
- Advanced SEO optimizations
- Automated testing suite
- Performance monitoring and analytics

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### How to Contribute

1. **Fork the repository**

   ```bash
   git clone https://github.com/your-username/travel-explorer.git
   ```

2. **Create a feature branch**

   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make your changes**

   - Follow the existing code style
   - Add comments for complex logic
   - Ensure no TypeScript errors (`npm run build`)

4. **Commit your changes**

   ```bash
   git commit -m "Add amazing feature"
   ```

5. **Push to your branch**

   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open a Pull Request**

   - Describe your changes clearly
   - Reference any related issues

### Code Style Guidelines

- Use Vue 3 Composition API with `<script setup>`
- Always define components with display names
- Use semantic HTML tags (`<section>`, `<article>`, `<header>`, `<footer>`)
- Avoid inline CSS styles (use TailwindCSS classes)
- Add `alt` text to all images
- In JSX text, wrap special characters in curly braces: `{"It's fine"}`
- Avoid `any` type; use `unknown` or specific types
- Write clear, self-documenting code

### Reporting Issues

If you find a bug or have a feature request:

1. Check if it's already reported in [Issues](https://github.com/your-username/travel-explorer/issues)
2. If not, create a new issue with:
   - Clear description
   - Steps to reproduce (for bugs)
   - Expected vs actual behavior
   - Screenshots (if applicable)

## 🙏 Credits

### Technologies & Libraries

- [Vue.js](https://vuejs.org/) - Progressive JavaScript framework
- [TypeScript](https://www.typescriptlang.org/) - Typed JavaScript
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- [Vue Router](https://router.vuejs.org/) - Official router for Vue.js
- [Axios](https://axios-http.com/) - Promise-based HTTP client
- [Lucide](https://lucide.dev/) - Beautiful icon library
- [Google Maps API](https://developers.google.com/maps) - Maps and location services

### Learning Resources

- [Vue.js Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)

### Acknowledgments

Special thanks to:

- The Vue.js team for an amazing framework
- The open-source community for incredible tools and libraries
- TechUp program for project guidance and support
- All contributors who help improve this project

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Travel Explorer

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

**Built with ❤️ for travelers and adventure seekers**

[Report Bug](https://github.com/your-username/travel-explorer/issues) · [Request Feature](https://github.com/your-username/travel-explorer/issues) · [Documentation](./API_DOCUMENTATION.md)

</div>
