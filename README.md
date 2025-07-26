# Noorain Car Services Lafia Nasarawa

A modern React Native car rental application built with Expo Router, featuring comprehensive rental management, payment processing, and damage reporting capabilities.

## 🏗️ Architecture Overview

### Technology Stack
- **Framework**: React Native with Expo SDK 52
- **Navigation**: Expo Router 4.0 (file-based routing)
- **State Management**: Redux Toolkit with RTK Query
- **UI Components**: React Native Paper + Custom Components
- **Authentication**: JWT-based with refresh tokens
- **Payment Processing**: Paystack integration
- **Database**: Backend API with MongoDB
- **Image Handling**: Expo Image Picker with multi-selection
- **Charts**: React Native Chart Kit
- **Animations**: React Native Reanimated & Lottie

### Project Structure
```
├── app/                          # File-based routing (Expo Router)
│   ├── (auths)/                 # Authentication flow
│   ├── (customer)/              # Customer dashboard
│   ├── (dashboard)/             # Admin dashboard
│   └── _layout.js               # Root layout with Redux Provider
├── apis/                        # RTK Query API slices
│   ├── apiSlice.js             # Base API configuration
│   ├── authApi.js              # Authentication endpoints
│   ├── carsApi.js              # Car management
│   ├── customersApi.js         # Customer management
│   ├── driversApi.js           # Driver management
│   ├── rentApi.js              # Rental management
│   ├── damagesApi.js           # Damage reporting
│   └── paymentsApi.js          # Payment processing
├── components/                  # Reusable UI components
│   ├── forms/                  # Form components with Formik
│   ├── ui/                     # Base UI components
│   └── lists/                  # List components
├── screens/                    # Screen components organized by feature
├── store/                      # Redux store configuration
├── hooks/                      # Custom React hooks
├── constants/                  # App constants and configuration
└── config/                     # App configuration files
```

## 🎯 Key Features

### Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Role-based Access**: Admin and Customer roles with different permissions
- **Profile Management**: Complete user profile setup and management

### Car Management (Admin)
- **CRUD Operations**: Full car inventory management
- **Image Gallery**: Multiple image upload and management
- **Availability Tracking**: Real-time availability status
- **Rating System**: Customer rating and feedback system
- **Reaction System**: Like, dislike, wow, love, sad reactions

### Rental System
- **Booking Flow**: Streamlined car rental booking process
- **Driver Integration**: Optional driver assignment with separate pricing
- **Date Selection**: Flexible start and end date selection
- **Payment Integration**: Secure Paystack payment processing
- **Booking Codes**: Unique booking reference generation

### Customer Features
- **Car Browsing**: Browse available cars with search and filters
- **Rental History**: View past and current rentals
- **Damage Reporting**: Report damages with image uploads
- **Payment Tracking**: View payment history and status

### Admin Dashboard
- **Analytics**: Comprehensive dashboard with charts and statistics
- **User Management**: Customer and driver management
- **Rental Management**: Oversee all rental activities
- **Damage Management**: Review and process damage reports
- **Payment Oversight**: Monitor all payment transactions

## 🔄 Application Workflow

### User Registration & Authentication Flow
1. **Landing Page**: Welcome screen with login/register options
2. **Registration**: Email/password registration with validation
3. **Profile Setup**: Complete profile information (customers only)
4. **Authentication**: JWT token-based session management
5. **Role Routing**: Automatic routing based on user role (Admin/Customer)

### Car Rental Workflow (Customer)
1. **Browse Cars**: View available cars with search functionality
2. **Car Details**: View detailed car information, images, and ratings
3. **Rental Configuration**: 
   - Select rental dates
   - Choose optional driver
   - Calculate total cost
4. **Payment Processing**: Secure Paystack payment integration
5. **Booking Confirmation**: Generate unique booking code
6. **Rental Management**: Track active rentals and history

### Admin Management Workflow
1. **Dashboard Overview**: View key metrics and recent activities
2. **Inventory Management**: Add, edit, delete cars with image management
3. **User Management**: Oversee customers and drivers
4. **Rental Oversight**: Monitor all rental activities and status updates
5. **Damage Processing**: Review and resolve damage reports
6. **Financial Tracking**: Monitor payments and revenue

### Damage Reporting Workflow
1. **Damage Detection**: Customer identifies damage during rental
2. **Report Creation**: Upload images and describe damage
3. **Admin Review**: Admin reviews and updates damage status
4. **Resolution Tracking**: Track damage resolution progress

## 🛠️ Technical Implementation

### State Management Architecture
- **RTK Query**: Efficient data fetching with caching and synchronization
- **Entity Normalization**: Normalized state structure for optimal performance
- **Optimistic Updates**: Immediate UI updates with rollback on failure
- **Background Sync**: Automatic data synchronization

### Navigation Architecture
- **File-based Routing**: Expo Router for type-safe navigation
- **Nested Navigation**: Tabs within drawer navigation
- **Protected Routes**: Authentication-based route protection
- **Deep Linking**: Support for deep linking to specific screens

### Component Architecture
- **Atomic Design**: Reusable components following atomic design principles
- **Form Management**: Formik integration with Yup validation
- **Error Boundaries**: Comprehensive error handling
- **Loading States**: Consistent loading indicators across the app

### Data Flow
1. **API Layer**: RTK Query manages all server communication
2. **State Layer**: Redux store maintains application state
3. **Component Layer**: React components consume state via hooks
4. **UI Layer**: Consistent design system with theme support

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator / Android Emulator
- Backend API server running

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd noorain-car-services

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Environment Configuration
Create a `.env` file with the following variables:
```env
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_PAYSTACK_KEY=your_paystack_key
```

### Development Workflow
1. **Start Development Server**: `npx expo start`
2. **Run on iOS**: Press `i` in terminal or scan QR code
3. **Run on Android**: Press `a` in terminal or scan QR code
4. **Web Development**: Press `w` for web version

## 📱 Platform Support

- **iOS**: Full native support with iOS-specific optimizations
- **Android**: Complete Android support with Material Design
- **Web**: Progressive Web App capabilities

## 🔧 Configuration

### API Configuration
- Base URL configuration in `constants/index.js`
- RTK Query setup in `apis/apiSlice.js`
- Authentication interceptors for token management

### Payment Configuration
- Paystack integration in rental confirmation
- Secure payment processing with transaction tracking
- Payment status management and verification

### Image Management
- Multi-image upload with Expo Image Picker
- Image optimization and compression
- Gallery view with full-screen modal

## 🧪 Testing Strategy

### Component Testing
- Unit tests for utility functions
- Component testing with React Native Testing Library
- Integration tests for critical user flows

### API Testing
- RTK Query endpoint testing
- Mock API responses for development
- Error handling validation

## 🚀 Deployment

### Build Configuration
- Expo Application Services (EAS) for builds
- Environment-specific configurations
- Code signing and app store preparation

### Production Considerations
- Performance optimization
- Bundle size optimization
- Security best practices
- Error monitoring and analytics

## 🔒 Security Features

- **JWT Token Management**: Secure token storage and refresh
- **API Security**: Request/response interceptors
- **Input Validation**: Comprehensive form validation
- **Image Security**: Secure image upload and storage
- **Payment Security**: PCI-compliant payment processing

## 📈 Performance Optimizations

- **Lazy Loading**: Component and route-based code splitting
- **Image Optimization**: Optimized image loading and caching
- **State Optimization**: Normalized state structure
- **Network Optimization**: Request deduplication and caching
- **Memory Management**: Proper cleanup and memory leak prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes following the established patterns
4. Add tests for new functionality
5. Submit a pull request with detailed description

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions