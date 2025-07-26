import React from 'react'
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import colors from '@/config/colors'

const ModernButton = ({ 
  title, 
  onPress, 
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  gradient = true,
  style,
  textStyle,
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          colors: colors.secondaryGradient,
          textColor: colors.white
        }
      case 'accent':
        return {
          colors: colors.accentGradient,
          textColor: colors.white
        }
      case 'success':
        return {
          colors: colors.successGradient,
          textColor: colors.white
        }
      case 'warning':
        return {
          colors: colors.warningGradient,
          textColor: colors.dark
        }
      case 'danger':
        return {
          colors: colors.dangerGradient,
          textColor: colors.white
        }
      case 'outline':
        return {
          colors: ['transparent', 'transparent'],
          textColor: colors.primary,
          borderColor: colors.primary,
          borderWidth: 2
        }
      default:
        return {
          colors: colors.primaryGradient,
          textColor: colors.white
        }
    }
  }

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          paddingVertical: 8,
          paddingHorizontal: 16,
          fontSize: 14
        }
      case 'large':
        return {
          paddingVertical: 16,
          paddingHorizontal: 32,
          fontSize: 18
        }
      default:
        return {
          paddingVertical: 12,
          paddingHorizontal: 24,
          fontSize: 16
        }
    }
  }

  const variantStyles = getVariantStyles()
  const sizeStyles = getSizeStyles()
  const isDisabled = disabled || loading

  const ButtonComponent = gradient && variant !== 'outline' ? LinearGradient : TouchableOpacity

  const buttonProps = gradient && variant !== 'outline' ? {
    colors: variantStyles.colors,
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 }
  } : {}

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.container,
        isDisabled && styles.disabled,
        style
      ]}
      {...props}
    >
      <ButtonComponent
        style={[
          styles.button,
          {
            paddingVertical: sizeStyles.paddingVertical,
            paddingHorizontal: sizeStyles.paddingHorizontal,
          },
          variant === 'outline' && {
            borderColor: variantStyles.borderColor,
            borderWidth: variantStyles.borderWidth,
            backgroundColor: 'transparent'
          },
          !gradient && variant !== 'outline' && {
            backgroundColor: variantStyles.colors[0]
          }
        ]}
        {...buttonProps}
      >
        {loading ? (
          <ActivityIndicator 
            size="small" 
            color={variantStyles.textColor} 
          />
        ) : (
          <Text 
            style={[
              styles.text,
              {
                color: variantStyles.textColor,
                fontSize: sizeStyles.fontSize
              },
              textStyle
            ]}
          >
            {title}
          </Text>
        )}
      </ButtonComponent>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.6,
  },
})

export default ModernButton