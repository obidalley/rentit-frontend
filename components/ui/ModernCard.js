import React from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import colors from '@/config/colors'

const ModernCard = ({ 
  children, 
  onPress, 
  style, 
  gradient = false,
  gradientColors = colors.primaryGradient,
  elevation = 4,
  ...props 
}) => {
  const CardComponent = gradient ? LinearGradient : View
  const cardProps = gradient ? {
    colors: gradientColors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 }
  } : {}

  const content = (
    <CardComponent
      style={[
        styles.card,
        { elevation },
        gradient && styles.gradientCard,
        style
      ]}
      {...cardProps}
      {...props}
    >
      {children}
    </CardComponent>
  )

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    )
  }

  return content
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: colors.dark,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gradientCard: {
    backgroundColor: 'transparent',
  },
})

export default ModernCard