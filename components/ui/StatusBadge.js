import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import colors from '@/config/colors'

const StatusBadge = ({ 
  status, 
  variant = 'default',
  size = 'medium',
  gradient = true 
}) => {
  const getStatusConfig = () => {
    const statusLower = status?.toLowerCase()
    
    switch (statusLower) {
      case 'active':
      case 'available':
      case 'successful':
      case 'completed':
      case 'resolved':
        return {
          colors: colors.successGradient,
          backgroundColor: colors.success,
          textColor: colors.white
        }
      case 'pending':
      case 'processing':
      case 'reviewed':
        return {
          colors: colors.warningGradient,
          backgroundColor: colors.warning,
          textColor: colors.dark
        }
      case 'inactive':
      case 'unavailable':
      case 'failed':
      case 'cancelled':
      case 'rejected':
        return {
          colors: colors.dangerGradient,
          backgroundColor: colors.danger,
          textColor: colors.white
        }
      default:
        return {
          colors: colors.primaryGradient,
          backgroundColor: colors.primary,
          textColor: colors.white
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 4,
          paddingHorizontal: 8,
          fontSize: 10,
          borderRadius: 8
        }
      case 'large':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14,
          borderRadius: 12
        }
      default:
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: 12,
          borderRadius: 10
        }
    }
  }

  const statusConfig = getStatusConfig()
  const sizeStyles = getSizeStyles()

  const BadgeComponent = gradient ? LinearGradient : View

  const badgeProps = gradient ? {
    colors: statusConfig.colors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 }
  } : {}

  return (
    <BadgeComponent
      style={[
        styles.badge,
        {
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          borderRadius: sizeStyles.borderRadius,
        },
        !gradient && {
          backgroundColor: statusConfig.backgroundColor
        }
      ]}
      {...badgeProps}
    >
      <Text 
        style={[
          styles.text,
          {
            color: statusConfig.textColor,
            fontSize: sizeStyles.fontSize
          }
        ]}
      >
        {status}
      </Text>
    </BadgeComponent>
  )
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
})

export default StatusBadge