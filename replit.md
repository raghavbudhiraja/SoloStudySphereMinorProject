# Solo Study - Immersive Focus Platform

## Overview

Solo Study is an immersive web application designed to create distraction-free study environments. The platform allows users to select atmospheric backgrounds and ambient soundscapes while tracking study sessions with a timer. Users can set goals and monitor their progress through completed study sessions.

The application emphasizes progressive immersion - starting with an awareness-focused landing page that transitions into a full-screen, distraction-minimal study room where UI elements fade into the background to maximize concentration.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool

**UI Component System**: 
- Shadcn/ui component library (New York style variant)
- Radix UI primitives for accessible, unstyled components
- Tailwind CSS for styling with custom design tokens
- Class Variance Authority (CVA) for component variants

**State Management**:
- TanStack Query (React Query) for server state management and caching
- Local React state for UI interactions
- Custom hooks for reusable logic (audio player, mobile detection, toast notifications)

**Routing**: Wouter for lightweight client-side routing

**Design System**:
- Typography: Inter/Manrope for body text, Space Grotesk/DM Sans for headlines
- Spacing: Tailwind scale (2, 4, 6, 8, 12 units)
- Layout: Single-column centered content (max-w-4xl) for landing, full-screen (100vh) for study room
- Progressive immersion UI approach with backdrop blur effects

### Backend Architecture

**Server Framework**: Express.js with TypeScript

**API Design**: RESTful endpoints
- `/api/goals` - CRUD operations for study goals
- `/api/sessions` - Study session tracking

**Data Layer**: 
- Drizzle ORM for type-safe database operations
- In-memory storage implementation (MemStorage) for development
- Interface-based storage abstraction (IStorage) allows swapping implementations

**Middleware**:
- JSON body parsing with raw body preservation
- Request/response logging with duration tracking
- Vite development server integration for HMR

**Development Environment**:
- Vite middleware mode for seamless dev experience
- Automatic server restart on errors
- Source maps for debugging

### Database Schema

**Goals Table**:
- `id` (varchar, UUID primary key)
- `text` (text, goal description)
- `completed` (boolean, completion status)
- `order` (integer, display ordering)

**Study Sessions Table**:
- `id` (varchar, UUID primary key)
- `duration` (integer, session length in seconds/minutes)
- `background` (text, selected environment ID)
- `soundscape` (text, selected ambient sound ID)
- `completedAt` (timestamp, session completion time)

**ORM Choice**: Drizzle was selected for type safety and SQL-like query building while maintaining TypeScript integration. The schema uses Zod for runtime validation through drizzle-zod integration.

### External Dependencies

**Database**: 
- PostgreSQL (via Neon serverless driver)
- Connection pooling through @neondatabase/serverless
- Session storage using connect-pg-simple

**UI Components**:
- Radix UI primitives (accordion, dialog, dropdown, checkbox, slider, tabs, etc.)
- Embla Carousel for image carousels
- Lucide React for iconography
- CMDK for command palette functionality

**Media Assets**:
- Background images: Library, Forest, Space, Coffee Shop environments (stored in attached_assets/generated_images)
- Soundscapes: Ambient audio files from external CDN (Pixabay)

**Development Tools**:
- Replit-specific plugins (runtime error modal, cartographer, dev banner)
- ESBuild for production bundling
- TSX for TypeScript execution in development

**Form Handling**:
- React Hook Form for form state
- Hookform Resolvers with Zod for validation

**Utilities**:
- date-fns for date manipulation
- clsx and tailwind-merge for conditional class names
- nanoid for unique ID generation