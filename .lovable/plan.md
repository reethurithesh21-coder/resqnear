
# ResQNear - Emergency Connector System

## Overview
A full-featured web app that helps people find nearby emergency services and blood donors using their current location. Features a calm, reassuring design (blues/greens) to help users stay composed during stressful situations.

---

## Core Features

### 1. **Location-Based Emergency Service Finder**
- Auto-detect user's current GPS location on load
- Interactive map showing nearby services (using Google Maps API)
- Category filters: Hospitals, Ambulance, Police, Fire Stations, NGOs
- List view with distance, ratings, and one-tap call buttons
- Search by address/location if GPS unavailable

### 2. **Blood Donor Directory**
- List of blood banks and donation centers from Google Maps
- **Donor Registration Portal** - users can register as blood donors with:
  - Blood group (A+, A-, B+, B-, AB+, AB-, O+, O-)
  - Location/area
  - Contact number
  - Availability status
- **Donor Search** - find registered donors filtered by:
  - Blood group needed
  - Distance from requester
  - Current availability
- Privacy controls for donors (show/hide contact info)

### 3. **User Authentication (Optional)**
- Email/password signup and login
- Required only for:
  - Registering as a blood donor
  - Saving favorite locations
  - Managing donor profile
- Anonymous browsing for service search

### 4. **Service Detail Pages**
- Full info: address, phone, hours, directions
- One-tap call button (prominent)
- Get directions button (opens Google Maps)
- Distance from current location

---

## Pages & Navigation

| Page | Description |
|------|-------------|
| **Home** | Quick category buttons, location status, emergency hotline banner |
| **Search Results** | Map + list view of nearby services |
| **Service Detail** | Full info with call/directions actions |
| **Blood Donors** | Search donors + register as donor |
| **Profile** | Manage donor profile, saved locations |
| **Auth** | Login/signup page |

---

## Design Direction
- **Colors**: Calming blues and greens, white backgrounds
- **Feel**: Trustworthy, professional, reassuring
- **Key principle**: Essential info visible at a glance, large tap targets, fast loading
- **Mobile-first**: Optimized for phone use during emergencies

---

## Technical Approach
- **Frontend**: React with Tailwind CSS, mobile-responsive
- **Maps**: Google Maps JavaScript API (requires your API key)
- **Backend**: Supabase for:
  - User authentication
  - Blood donor database
  - Saved favorites
- **External Data**: Google Places API for emergency service listings

---

## What You'll Need
- **Google Maps API Key** (for maps and places search)
- Services will be fetched live from Google Maps based on user location

