
# CarbonX 

A digital platform that helps people in Kenya track their real environmental actions—such as clean cooking, tree planting, waste reduction, and renewable energy use—and automatically verify them using AI, geolocation, and images. Each contribution is recorded in a transparent, tamper-proof blockchain log and converted into measurable climate impact. Built with React, TypeScript, and Supabase, the platform provides real-time validation, mapping, and digital proof of impact that users can use for rewards, reporting, or sustainability programs.

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#️-technologies-used)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Key Pages](#-key-pages)
- [Authentication](#-authentication)
- [Mapping Features](#️-mapping-features)
- [Achievement System](#-achievement-system)
- [Impact Metrics](#-impact-metrics)
- [Contributing](#-contributing)

---

## 🌟 Features

### Core Functionality
- **Individual Contributions Tracking**: Submit and track personal climate actions (tree planting, solar installations, water conservation, etc.)
- **AI-Powered Verification**: Automated verification system for submitted contributions
- **Real-time Community Feed**: See what others are doing for the planet with live updates
- **Interactive Global Map**: Visual representation of all verified contributions with geographic coordinates
- **Achievement System**: Unlock badges and milestones based on your climate impact
- **Token Rewards**: Earn climate tokens for verified contributions
- **Government & NGO Projects**: Browse large-scale climate initiatives

### Contribution Types Supported
-  **Tree Planting**
-  **Solar Energy** 
-  **Water Conservation** 
-  **Composting**
-  **Clean Cooking** 
-  **Urban Gardening**

---

## Technologies Used

### Frontend
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful component library
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Sonner** - Toast notifications

### Backend & Services
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Authentication (email/password)
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage for images
- **Nominatim API** - Geocoding service (OpenStreetMap)
- **Leaflet** - Interactive maps

### State Management
- **React Context API** - Authentication state
- **TanStack Query (React Query)** - Server state management
- **Local Storage** - Form drafts and persistence
- **Zod** - Form validation

---


## 🚀 Getting Started

### Prerequisites
- **Node.js** v16 or higher
- **npm** or **yarn**
- **Supabase account** (free tier works)
- Basic knowledge of React and TypeScript

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/IcodeAlpha/carbonx.git
   cd carbonx
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file 

4. **Run database migrations**
   
   Go to your **Supabase Dashboard → SQL Editor** and execute


5. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

6. **Build for production**
   ```bash
   npm run build
   ```

---

## Project Structure

```
carbonx/
├── src/
│   ├── components/
│   │   ├── ui/                          # shadcn/ui components (buttons, cards, etc.)
│   │   ├── Navigation.tsx               # Main navigation bar
│   │   ├── ContributionMapWrapper.tsx   # Interactive map component
│   │   ├── AchievementBadges.tsx        # Achievement display
│   │   ├── ImpactStatistics.tsx         # Impact metrics display
│   │   └── contribution/
│   │       └── ContributionFormSteps.tsx  # Multi-step contribution form
│   │
│   ├── contexts/
│   │   └── AuthContext.tsx              # Authentication context provider
│   │
│   ├── hooks/
│   │   ├── useContributionForm.ts       # Form state management with Zod
│   │   ├── useAchievements.ts           # Achievement logic and calculations
│   │   └── use-toast.ts                 # Toast notification hook
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts                # Supabase client configuration
│   │       └── types.ts                 # Auto-generated database types
│   │
│   ├── pages/
│   │   ├── Landing.tsx                  # Landing/homepage
│   │   ├── Auth.tsx                     # Login/signup page
│   │   ├── Dashboard.tsx                # User dashboard with stats
│   │   ├── Contribute.tsx               # Contribution submission form
│   │   ├── CommunityFeed.tsx            # Public feed of contributions
│   │   ├── BigProjects.tsx              # Government/NGO projects
│   │   └── NotFound.tsx                 # 404 page
│   │
│   ├── lib/
│   │   └── utils.ts                     # Utility functions
│   │
│   ├── App.tsx                          # Main app with routing
│   └── main.tsx                         # App entry point
│
├── supabase/
│   └── migrations/                      # Database migration files
│
├── public/                              # Static assets
├── .env                                 # Environment variables (not in git)
├── package.json                         # Dependencies
├── tsconfig.json                        # TypeScript config
├── vite.config.ts                       # Vite config
└── README.md                            # This file
```

---

## Key Pages

### 1. Landing Page (`/`)
**Purpose**: Introduction to the platform

**Features**:
- Hero section with call-to-action
- Key features overview
- How it works section
- Statistics showcase
- Sign up prompt

### 2. Authentication (`/auth`)
**Purpose**: User registration and login

**Features**:
- Email/password authentication
- Powered by Supabase Auth
- Session persistence
- Automatic profile creation
- Redirect to dashboard after login

### 3. Dashboard (`/dashboard`)
**Purpose**: Personal climate action overview

**Features**:
- **Climate Tokens**: Total tokens earned from verified contributions
- **Total Contributions**: Number of submissions
- **Verified Count**: Successfully verified contributions
- **Pending Review**: Contributions awaiting verification
- **Recent Contributions**: List of latest submissions with status
- **Achievement Progress**: Unlocked badges and completion percentage
- **Impact Statistics**: Charts and metrics of environmental impact
- Real-time updates via Supabase subscriptions

### 4. Contribute (`/contribute`)
**Purpose**: Submit new environmental contributions

**Multi-step Form**:
1. **Type Selection**: Choose contribution type (tree planting, solar, etc.)
2. **Location**: Interactive map to pin exact location with GPS support
3. **Details**: Quantity, unit, start date, and description
4. **Photos**: Optional photo uploads for verification
5. **Review**: Final review before submission

**Features**:
- Form validation with Zod
- Draft auto-save to localStorage
- Real-time field validation
- Progress indicator
- Submission history sidebar (scrollable)
- Status tracking (pending/verified/rejected)

### 5. Community Feed (`/community`)
**Purpose**: Public feed of verified contributions

**Features**:
- **Global Map**: Interactive map showing all verified contributions with color-coded markers
- **Contribution Cards**: 
  - User avatar and name
  - Contribution type badge
  - Title and description
  - Photo gallery (if available)
  - Location and quantity
  - Like and comment buttons
  - Time ago indicator
- **Real-time Updates**: New contributions appear automatically
- **Legend**: Color guide for different contribution types
- **Refresh Button**: Manual refresh option
- Responsive grid layout

### 6. Big Projects (`/big-projects`)
**Purpose**: Browse government and NGO sponsored climate projects

**Features**:
- Project cards with images
- Project type and verification standard
- Location information
- Available carbon credits (tonnes)
- Pricing per tonne
- Description and impact metrics
- Grid layout with hover effects

---
## Authentication

CarbonX uses **Supabase Authentication** with the following features:

### Authentication Methods
- Email/password authentication
- Session persistence via localStorage
- Auto token refresh

### Security Features
- **Row Level Security (RLS)** on all tables
- Users can only modify their own data
- Verified contributions are publicly viewable
- Secure session management

### Auth Flow
1. User signs up with email/password
2. Supabase creates auth user
3. Profile automatically created via trigger
4. User redirected to dashboard
5. JWT token stored in localStorage

### Protected Routes
All routes except `/` and `/auth` require authentication. The `AuthContext` provider handles:
- Loading state
- Current user state
- Automatic redirects to `/auth` if not logged in

---

## Mapping Features

### Location Capture Methods

#### 1. Interactive Map Selection
- Click anywhere on the map to set location
- Map displays a marker at selected coordinates
- Reverse geocoding converts coordinates to address

#### 2. GPS Current Location
- "Use My Location" button
- Browser geolocation API
- Automatic address lookup via Nominatim

#### 3. Manual Entry
- Type location name directly
- Auto-geocoding on input change
- Validation feedback

### Coordinate Storage Format

Coordinates are stored as JSONB:
```json
{
  "lat": -0.3676,
  "lng": 37.0729
}
```

### Map Features
- **Leaflet** for interactive maps
- **OpenStreetMap** tiles (free)
- **Nominatim** for geocoding (free)
- Color-coded markers by contribution type
- Zoom controls
- Popup info on marker click
- Responsive map sizing

### Geocoding Services Used
- **Forward Geocoding**: Address → Coordinates
- **Reverse Geocoding**: Coordinates → Address
- Rate limit: Respect Nominatim usage policy

---

## Achievement System

### Overview
Users unlock achievements based on their climate action activity. Achievements are calculated dynamically from contribution data.

### Achievement Categories

#### 1. **Contributions** (Quantity-based)
- 🌱 **Climate Pioneer**: Submit your first contribution (1)
- 🌿 **Active Contributor**: Submit 5 verified contributions
- 🏆 **Climate Champion**: Submit 10 verified contributions
- ⭐ **Sustainability Leader**: Submit 25 verified contributions

#### 2. **Diversity** (Variety-based)
- 🎯 **Versatile Activist**: Try 3 different contribution types
- 💡 **Eco Innovator**: Try 5 different contribution types

#### 3. **Impact** (Environmental impact)
- 🌍 **Impact Maker**: Achieve 100+ total impact units
- 🌟 **Change Leader**: Achieve 500+ total impact units

#### 4. **Consistency** (Activity-based)
- 🔥 **Dedicated Activist**: 3+ contributions in last 30 days
- ⚡ **Unstoppable Force**: 7+ contributions in last 30 days

### Achievement Display
- Progress bars showing completion
- Locked/unlocked states
- Percentage completion
- Badge icons
- Organized by category

---

#### Community Feed Updates
- New verified contributions appear instantly
- Live verification status changes
- Real-time like/comment counts

#### Verification Notifications
When a contribution is verified:
- Toast notification appears
- Dashboard updates automatically
- Token balance increases
- Achievement progress updates

---

## Impact Metrics

### Contribution-Specific Metrics

Each contribution type calculates different environmental impact:

####  Tree Planting
- **CO₂ Sequestration**: Estimated carbon captured per tree
- **Oxygen Production**: O₂ generated annually
- **Biodiversity Impact**: Species supported

####  Solar Energy
- **kWh Generated**: Renewable energy produced
- **CO₂ Avoided**: Emissions prevented vs. fossil fuels
- **Cost Savings**: Money saved on electricity

####  Water Conservation
- **Liters Saved**: Water conserved
- **Energy Saved**: Pumping/treatment energy avoided
- **Rainfall Utilized**: Harvested rainwater percentage

####  Composting
- **Waste Diverted**: Kg of organic waste from landfills
- **Methane Avoided**: CH₄ emissions prevented
- **Soil Enrichment**: Nutrient value added

####  Clean Cooking
- **Emissions Reduced**: CO, PM2.5, black carbon
- **Fuel Saved**: Traditional fuel usage reduced
- **Health Impact**: Indoor air quality improvement

####  Urban Gardening
- **Food Produced**: Kg of produce grown
- **Food Miles Saved**: Transportation emissions avoided
- **Green Space Created**: m² of urban greening

### Token Calculation
```typescript
baseTokens = {
  tree_planting: 5 tokens per tree
  home_solar: 50 tokens per kW installed
  rainwater_harvesting: 10 tokens per 1000L capacity
  composting: 3 tokens per kg/week
  clean_cooking: 20 tokens per stove
  gardening: 4 tokens per m²
}

totalTokens = baseTokens × quantity
```
---

## Future Enhancements

### Planned Features
-  **Blockchain Integration**: Immutable verification on Ethereum/Polygon
-  **Mobile App**: React Native version for iOS/Android
-  **Carbon Credit Marketplace**: Buy/sell verified carbon credits
-  **Social Features**: Follow users, share to social media
-  **Advanced Analytics**: Data visualization dashboard
-  **Multi-language Support**: i18n for Swahili, French, etc.
-  **Offline Mode**: PWA with offline sync
-  **Gamification**: Leaderboards, challenges, competitions
-  **Corporate Accounts**: Team/organization features
-  **API Access**: Public API for third-party integrations
-  **Satellite Verification**: Automated satellite image analysis
-  **Payment Integration**: M-Pesa, Stripe for credit purchases

### Technical Improvements
-  E2E testing with Playwright
-  Performance optimization
-  SEO optimization
-  CDN for image hosting
-  Redis caching layer
-  GraphQL API option
-  Microservices architecture

---

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute
-  Report bugs
-  Suggest new features
-  Design improvements
-  Code contributions

---

## Team & Acknowledgments

### Built With ❤️
Built for a sustainable future in Kenya and beyond.

### Core Technologies
- **Supabase** - For the amazing BaaS platform
- **OpenStreetMap & Nominatim** - Free mapping services
- **shadcn/ui** - Beautiful component library
- **Lucide** - Icon library
- **Vercel** - Deployment platform

### Special Thanks
- All climate activists and early adopters
- Open source community
- Kenyan environmental organizations
- Everyone fighting climate change

---

### Get in Touch
- **GitHub Repository**: [https://github.com/IcodeAlpha/carbonx](https://github.com/yourusername/carbonx)

---

**🌍 Start making a difference today! Every contribution counts. 💚**

*Together, we can build a sustainable future for Kenya and the planet.*