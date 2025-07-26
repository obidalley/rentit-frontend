export const PORT = 5000
export const URL = `http://192.168.100.199:${PORT}/api`
export const BASE_URL = `http://192.168.100.199:${PORT}`
export const URL_AUTH = `http://192.168.100.199:${PORT}/api/auth`
export const PAYMENT_API_KEY = 'pk_test_340ca76dd262b6d620fac1f8c494a59212093fb1'

// App Branding
export const APP_NAME = 'Noorain Car Services'
export const APP_LOCATION = 'Lafia Nasarawa'
export const APP_FULL_NAME = `${APP_NAME} ${APP_LOCATION}`

// Modern Color Scheme - Gradient-based
export const COLORS = {
  // Primary gradient colors
  primary: {
    start: '#667eea',
    end: '#764ba2',
    solid: '#6c5ce7'
  },
  // Secondary gradient colors
  secondary: {
    start: '#f093fb',
    end: '#f5576c',
    solid: '#fd79a8'
  },
  // Accent gradient colors
  accent: {
    start: '#4facfe',
    end: '#00f2fe',
    solid: '#00b894'
  },
  // Success gradient
  success: {
    start: '#56ab2f',
    end: '#a8e6cf',
    solid: '#00b894'
  },
  // Warning gradient
  warning: {
    start: '#f7971e',
    end: '#ffd200',
    solid: '#fdcb6e'
  },
  // Error gradient
  error: {
    start: '#ff416c',
    end: '#ff4757',
    solid: '#e84393'
  },
  // Neutral colors
  neutral: {
    white: '#ffffff',
    light: '#f8f9fa',
    medium: '#6c757d',
    dark: '#343a40',
    black: '#000000'
  },
  // Background gradients
  background: {
    primary: ['#667eea', '#764ba2'],
    secondary: ['#f093fb', '#f5576c'],
    light: ['#ffffff', '#f8f9fa'],
    dark: ['#2d3436', '#636e72']
  }
}

export const images = {
    screen: require('../assets/images/splash2.jpg'),
    logo: require('../assets/images/logo.png')
}

export const routes = Object.freeze({
    LISTING_DETAILS: 'ListingDetails',
    LISTING_EDIT: 'ListingEdit',
    LOGIN: 'Login',
    MESSAGES: 'Messages',
    REGISTER: 'Register',
})
