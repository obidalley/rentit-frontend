import { COLORS } from '../constants'

export default {
  // Modern gradient-based colors
  primary: COLORS.primary.solid,
  primaryGradient: [COLORS.primary.start, COLORS.primary.end],
  secondary: COLORS.secondary.solid,
  secondaryGradient: [COLORS.secondary.start, COLORS.secondary.end],
  accent: COLORS.accent.solid,
  accentGradient: [COLORS.accent.start, COLORS.accent.end],
  
  // Status colors with gradients
  success: COLORS.success.solid,
  successGradient: [COLORS.success.start, COLORS.success.end],
  warning: COLORS.warning.solid,
  warningGradient: [COLORS.warning.start, COLORS.warning.end],
  danger: COLORS.error.solid,
  dangerGradient: [COLORS.error.start, COLORS.error.end],
  
  // Neutral colors
  black: '#000',
  white: '#fff',
  medium: '#6e6969',
  light: '#f8f4f4',
  dark: '#0c0c0c',

  // Blue family
  blue: '#3498db',
  blueLight: '#85c1e9',
  blueDark: '#21618c',
  skyBlue: '#87ceeb',

  // Teal family
  teal: '#008080',
  tealLight: '#20b2aa',
  tealDark: '#006666',
  tealSky: '#0abde3',
  
  // Background gradients
  backgroundPrimary: COLORS.background.primary,
  backgroundSecondary: COLORS.background.secondary,
  backgroundLight: COLORS.background.light,
  backgroundDark: COLORS.background.dark,
}
