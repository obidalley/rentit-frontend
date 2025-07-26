import React from 'react'
import { StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import colors from '@/config/colors'

const GradientBackground = ({ 
  children, 
  colors: gradientColors = colors.primaryGradient,
  style,
  ...props 
}) => {
  return (
    <LinearGradient
      colors={gradientColors}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      {...props}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
})

export default GradientBackground