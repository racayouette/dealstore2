# NetDiscount - Deal Aggregation Platform

## Overview

NetDiscount is a modern web application for aggregating and displaying net deals, coupons, and discounts from various retailers. The platform allows users to browse deals by categories, search for specific products, and discover featured offers from popular stores. Built with a React frontend and Express backend, it provides a comprehensive deal discovery experience with features like deal categorization, store browsing, search functionality, detailed deal pages, and a comprehensive advertisement banner management system through the Advertising Panel.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Page Visibility & SEO Management
The application features a comprehensive page visibility system that allows administrators to dynamically control which pages are accessible to users and search engines:

- **Dynamic Navigation**: Header menu automatically updates to show/hide pages based on visibility settings
- **DOM Protection**: Hidden pages render 404 errors instead of content when accessed directly
- **Database-Driven Controls**: All visibility settings stored in PostgreSQL with real-time updates
- **SEO Integration**: Dynamic sitemap generation (`/sitemap.xml`) includes only visible pages
- **Search Engine Optimization**: Automated `robots.txt` generation with proper admin area exclusions
- **Admin Interface**: Visual toggle controls in Advertising Panel with Eye/EyeOff icons
- **Real-time Updates**: Changes take effect immediately across navigation and sitemap

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom design system using CSS variables
- **Routing**: Wouter for client-side routing (lightweight React router alternative)
- **State Management**: TanStack Query (React Query) for server state management
- **File Upload**: Uppy integration for file handling with AWS S3 support

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **API Design**: RESTful API with structured error handling and logging middleware

### Database Schema Design
The application uses a normalized database schema with the following core entities:
- **Categories**: Hierarchical category structure with parent-child relationships
- **Stores**: Retailer information with logo URLs and featured status
- **Deals**: Core deal entities with pricing, discounts, ratings, and expiration dates
- **Products**: Product catalog linked to deals and categories
- **Deal-Product Relations**: Many-to-many relationship between deals and products
- **Advertisement Banners**: Public service announcement banners with content, styling, metadata, and impression controls
- **Banner Settings**: Per-page banner visibility controls managed through the Advertising Panel

### Development Environment
- **Development Server**: Vite dev server with HMR (Hot Module Replacement)
- **Database Migrations**: Drizzle Kit for schema management and migrations
- **Type Safety**: Shared TypeScript schemas between frontend and backend
- **Build Process**: Vite for frontend bundling, esbuild for backend compilation

### API Structure
The backend provides RESTful endpoints for:
- Category management with hierarchical data retrieval
- Store browsing with featured store support and alphabetical filtering
- Deal discovery with filtering by category, store, and search functionality
- Product catalog management
- Advertisement banner management with database-driven visibility controls and impression limiting
- Banner settings per page with centralized control through the Advertising Panel
- Real-time banner content editing with auto-save functionality
- Impression-based banner display controls (always show vs. limited impressions)
- Page visibility management system with dynamic navigation and SEO integration
- Dynamic sitemap generation based on visible pages for optimal SEO crawling
- Robots.txt generation with proper admin area exclusions

### Error Handling and Logging
- Centralized error handling middleware with appropriate HTTP status codes
- Request/response logging with performance metrics
- Graceful error boundaries in React components

### File Organization
- **Monorepo Structure**: Client, server, and shared code in organized directories
- **Shared Schemas**: Common TypeScript types and Zod validation schemas
- **Component Architecture**: Reusable UI components with proper separation of concerns
- **Custom Hooks**: Reusable React hooks for common functionality

## External Dependencies

### Database and Storage
- **Neon Database**: Serverless PostgreSQL database hosting
- **Google Cloud Storage**: File storage service for images and assets
- **Drizzle ORM**: Type-safe database toolkit with PostgreSQL driver

### UI and Styling
- **Radix UI**: Headless UI component library for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **shadcn/ui**: Pre-built component collection built on Radix UI

### Development Tools
- **Vite**: Fast build tool and development server
- **TanStack Query**: Data fetching and caching library
- **Wouter**: Minimalist routing library for React
- **Zod**: Schema validation library for TypeScript

### File Upload and Processing
- **Uppy**: Modular file uploader with multiple plugins
- **AWS S3 Integration**: Direct file upload to S3-compatible storage

### Utilities
- **class-variance-authority**: Utility for creating variant-based component APIs
- **clsx**: Utility for constructing className strings conditionally
- **nanoid**: URL-safe unique string ID generator