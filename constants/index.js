export const PORT = 5000
export const URL = `http://192.168.100.199:${PORT}/api`
export const BASE_URL = `http://192.168.100.199:${PORT}`
export const URL_AUTH = `http://192.168.100.199:${PORT}/api/auth`
export const PAYMENT_API_KEY = 'pk_test_340ca76dd262b6d620fac1f8c494a59212093fb1'

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
});
