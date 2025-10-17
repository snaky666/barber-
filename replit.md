# Salon de Coiffure - Système de Réservation

## Overview
This project is a professional hair salon booking management system designed with a modern user interface and interactive 3D background animations. It provides a public booking interface, a client list view, an announcements page, and a comprehensive admin panel. The system is designed for a single-salon operation, focusing on efficient appointment management, client-driven day selection, and a visually engaging user experience. The business vision is to offer a streamlined, visually appealing, and highly functional booking solution for hair salons, enhancing both client interaction and administrative efficiency.

## Recent Major Updates (October 2025)
- **GitHub Import to Replit** (October 17, 2025): Successfully imported from GitHub, configured Python 3.11, Node.js 20, and Three.js dependencies
- **Replit Environment Setup** (October 17, 2025): Configured Python 3.11 server, workflow, and VM deployment settings
- **Configurable Working Days**: Admin can now add, remove, and configure working days dynamically through the admin panel
- **Per-Day Capacity Management**: Each working day can have its own capacity setting (1-20 clients)
- **Client Day Selection**: Clients now choose their preferred booking day from available options instead of automatic assignment
- **Fixed Booking Positions**: Bookings stay on the chosen day - no automatic rescheduling when other bookings are deleted
- **Enhanced Admin Panel**: New "Jours de travail" tab for managing working days configuration

## Replit Environment Setup
- **Server**: Python 3.11 HTTP server (server.py) serving static files on port 5000
- **Workflow**: Configured to run `python server.py` automatically on port 5000 with webview output
- **Deployment**: VM deployment configured with `python server.py` for production use
- **Database**: Supabase (cloud PostgreSQL) successfully connected with credentials in js/supabase-config.js
- **Dependencies**: 
  - Python 3.11 (HTTP server)
  - Node.js 20 (for Three.js package management)
  - Three.js v0.180.0 (3D graphics)

## User Preferences
- Language: French (fr) with Arabic support
- Theme: Professional gold on black with modern effects
- Database: Supabase (cloud) + localStorage fallback
- Enhanced with Three.js 3D graphics

## System Architecture
The application uses a Python server to serve static files and provide API endpoints, with frontend built in HTML, CSS, and Vanilla JavaScript. Data can be stored in both Supabase (cloud database) and localStorage (local fallback).

### UI/UX Decisions
- **Theme**: Professional gold-on-black theme with modern effects, gradient animations, smooth transitions, hover effects, and backdrop blur.
- **3D Background**: Interactive particle system using Three.js with 3000+ golden particles, mouse-following parallax, and smooth rotation. Optimized for performance with WebGL and a graceful fallback.
- **Responsiveness**: Fully responsive design with a breakpoint at 768px for mobile/desktop. Features a professional hamburger menu for mobile with smooth sliding animations.
- **Animations**: Incorporates extensive animations including page load fade-in/slide-up, navigation slide-in, card lift/scale on hover, button transitions, and a continuous logo pulse.
- **Bilingual Support**: Fully bilingual interface (French/Arabic) with RTL support.

### Technical Implementations
- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+), Three.js for 3D graphics.
- **Backend**: Python 3.11 HTTP server (server.py) serving static files and providing REST API endpoints for data synchronization
- **Data Storage**: 
  - Supabase (cloud PostgreSQL) for shared data: bookings, announcements, journal, income, debt
  - localStorage for local settings: admin credentials, working days configuration, language preference
- **Admin Panel**: Secured with login credentials (`younes/younes` by default). Provides features for managing bookings (promote, edit, delete, mark "in progress"), cancelling/restoring days, creating announcements, changing admin credentials, and viewing activity.
- **Business Logic**:
    - **Working Days**: Configurable by admin (default: Sunday, Tuesday, Thursday, Friday).
    - **Capacity**: Configurable per day by admin (1-20 clients, default: Friday = 3, others = 5).
    - **Client Day Selection**: Clients choose their preferred booking day from available options with remaining capacity shown.
    - **Fixed Booking Positions**: Bookings remain on the chosen day - deleting a booking simply frees up that spot.
    - **Day Cancellation**: Cancelling a day removes it from available options but preserves existing bookings data.
    - **Completed Bookings**: Marked as completed, hidden from public/admin views but still count towards daily capacity to prevent new bookings from filling the spot.

### Feature Specifications
- **Client Features**: Book appointments, view all bookings by day, see "in progress" clients, view salon announcements, contact page with salon info and social media.
- **Admin Features**: Comprehensive management of bookings, announcements, and system settings.
- **Visual Enhancements**: 3D particle background, improved navigation, professional card designs, enhanced form inputs, smooth button animations, responsive modal dialogs, improved tab navigation, and refined typography.

### System Design Choices
- **Full-Stack Architecture**: Python backend server for API endpoints and static file serving, with frontend JavaScript handling UI and business logic
- **Hybrid Data Storage**: Supabase for shared data across sessions/devices, localStorage for local settings and admin credentials
- **Modularity**: Code is organized into:
  - `server.py` - Python HTTP server with API endpoints
  - `js/supabase-config.js` - Database configuration
  - `js/supabase-client.js` - Database client functions
  - `js/data-layer.js` - Data management layer
  - `js/main.js` - Application logic
  - `js/translations.js` - Bilingual support
- **Static Assets**: HTML, CSS, and JavaScript files suitable for deployment on Replit or GitHub Pages

## External Dependencies
- **Three.js**: Used for creating the interactive 3D particle background animation.