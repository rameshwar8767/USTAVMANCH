# Event Management System (EMS)
# Comprehensive Features Guide

## Table of Contents

1. [Introduction](#introduction)
2. [User Roles](#user-roles)
3. [Key Features](#key-features)
   - [For Customers](#for-customers)
   - [For Vendors](#for-vendors)
   - [For Administrators](#for-administrators)
4. [Technical Features](#technical-features)
5. [System Architecture](#system-architecture)
6. [Getting Started](#getting-started)

## Introduction

The Event Management System (EMS) is a comprehensive platform designed to connect event service providers (vendors) with customers looking to organize events. The system facilitates the entire event planning process from browsing vendors to booking services and managing events.

## User Roles

The system supports three primary user roles, each with specific features and capabilities:

### Customer
- End users looking to book event services
- Can browse vendors, make bookings, and manage their events
- Access to personalized dashboard and booking history

### Vendor
- Service providers offering event-related services
- Can manage their products/services, handle bookings, and communicate with customers
- Access to business analytics and booking management tools

### Administrator
- System administrators with full control over the platform
- Can manage users, vendors, categories, and monitor system activities
- Access to comprehensive reporting and analytics tools

## Key Features

### For Customers

#### 1. User Registration and Authentication
- Simple sign-up process with email verification
- Secure login with JWT authentication
- Password recovery functionality

#### 2. Vendor Discovery
- Browse vendors by categories (catering, venue, photography, etc.)
- Advanced search and filtering options
- Featured vendors section on the homepage

#### 3. Vendor Details View
- Comprehensive vendor profiles with services, pricing, and reviews
- Photo galleries showcasing previous work
- Contact information and business details

#### 4. Booking Management
- Intuitive booking process with date and time selection
- Event details specification (location, attendee count, event type)
- Special requirements and notes section
- Booking confirmation and status tracking

#### 5. Customer Dashboard
- Overview of all bookings (pending, confirmed, completed, cancelled)
- Quick access to upcoming events
- Booking history with detailed information
- Offline capability for viewing bookings when internet is unavailable

#### 6. Real-time Chat
- Direct communication with vendors
- File sharing capabilities
- Chat history preservation
- Real-time typing indicators and online status

### For Vendors

#### 1. Vendor Registration and Profile Management
- Business profile creation with detailed information
- Service/product catalog management
- Portfolio and gallery uploads
- Business hours and availability settings

#### 2. Product/Service Management
- Add, edit, and remove services or products
- Set pricing and availability
- Upload images and detailed descriptions
- Categorize offerings for better discoverability

#### 3. Booking Management
- Comprehensive booking dashboard
- Booking approval/rejection functionality
- Calendar view of all scheduled events
- Booking details with customer information and event specifications
- Offline capability for managing bookings when internet is unavailable

#### 4. Vendor Dashboard
- Business analytics and performance metrics
- Recent booking overview
- Quick access to pending approvals
- Revenue tracking and reporting

#### 5. Customer Communication
- Real-time chat with customers
- Notification system for new bookings and messages
- Automated booking status updates

### For Administrators

#### 1. User Management
- Comprehensive user database
- User creation, editing, and deactivation
- Role assignment and permission management

#### 2. Vendor Management
- Vendor approval process
- Vendor performance monitoring
- Category assignment and management

#### 3. Category Management
- Create and manage service categories
- Assign icons and colors to categories
- Organize vendors by categories

#### 4. Booking Oversight
- Monitor all bookings across the platform
- Resolve disputes between vendors and customers
- Generate booking reports and analytics

#### 5. System Analytics
- Comprehensive reporting dashboard
- User activity tracking
- Revenue and booking statistics
- Platform performance metrics

## Technical Features

### 1. Responsive Design
- Mobile-first approach ensuring usability on all devices
- Adaptive layouts for different screen sizes
- Touch-friendly interface elements

### 2. Offline Functionality
- Local storage for critical data
- Offline booking creation and management
- Automatic synchronization when connection is restored
- Fallback mechanisms for API unavailability

### 3. Real-time Updates
- WebSocket integration for instant notifications
- Live chat functionality
- Real-time booking status updates

### 4. Data Visualization
- Interactive charts and graphs for analytics
- Visual representation of booking data
- Performance metrics visualization

### 5. Security Features
- JWT-based authentication
- Role-based access control
- Secure API endpoints
- Data encryption for sensitive information

## System Architecture

### Frontend
- React.js for UI components
- Material-UI for design system
- React Router for navigation
- React Query for data fetching and caching
- Context API for state management
- Socket.IO client for real-time communication

### Backend
- Node.js with Express framework
- MongoDB database for data storage
- JWT for authentication
- RESTful API design
- Socket.IO for WebSocket communication
- Multer for file uploads

### Key Technical Implementations

#### Hybrid Data Approach
- Combination of API data and localStorage for offline functionality
- Smart merging of data from multiple sources
- Prioritized data retrieval for optimal performance

#### Vendor Identification System
- Multiple identifier matching for reliable vendor association
- Fallback mechanisms for vendor identification
- Vendor-specific storage for direct access

#### Booking System
- Comprehensive booking object with complete metadata
- Status tracking and update synchronization
- Offline booking creation with mock data generation

## Getting Started

### System Requirements
- Node.js (v14 or higher)
- MongoDB (v4 or higher)
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

#### Backend Setup
1. Clone the repository
2. Navigate to the backend directory: `cd event-management-backend`
3. Install dependencies: `npm install`
4. Configure environment variables in `.env` file
5. Start the server: `npm run dev`

#### Frontend Setup
1. Navigate to the frontend directory: `cd event-management-frontend`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env` file
4. Start the development server: `npm run dev`
5. Access the application at: `http://localhost:5174`

---

*This document provides an overview of the Event Management System's features and functionality. For detailed technical documentation, please refer to the codebase and API documentation.*
