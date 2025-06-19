import { Stack } from 'expo-router'
import React from 'react'
import { Platform } from 'react-native'

import { useColorScheme } from '@/hooks/useColorScheme'
import { Colors } from '@/constants/Colors'

const StackLayout = () => {
  const colorScheme = useColorScheme()

  return (
    <Stack
      screenOptions={{
        headerTintColor: Colors[colorScheme ?? 'light'].tint,
        headerStyle: {
          backgroundColor: Platform.select({
            ios: 'transparent',
            default: Colors[colorScheme ?? 'light'].background,
          }),
        },
        headerTransparent: Platform.OS === 'ios',
      }}
    >
      <Stack.Screen
        name='index'
        options={{
          title: 'Landing',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='login'
        options={{
          title: 'Login',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='register'
        options={{
          title: 'Register',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='profile'
        options={{
          title: 'Profile',
          headerShown: false
        }}
      />
      <Stack.Screen
        name='car-details'
        options={{
          title: 'Car Details',
          headerShown: true
        }}
      />
      <Stack.Screen
        name='customer-details'
        options={{
          title: 'Customer Details',
          headerShown: true
        }}
      />
      <Stack.Screen
        name='driver-details'
        options={{
          title: 'Driver Details',
          headerShown: true
        }}
      />
      <Stack.Screen
        name='confirm-rent'
        options={{
          title: 'Rent Confirmation',
          headerShown: true
        }}
      />
      <Stack.Screen
        name='rent-details'
        options={{
          title: 'Rent Details',
          headerShown: true
        }}
      />
      <Stack.Screen
        name='damage-details'
        options={{
          title: 'Damage Details',
          headerShown: true
        }}
      />
      <Stack.Screen
        name='new-damage'
        options={{
          title: 'New Damage',
          headerShown: true
        }}
      />
      <Stack.Screen
        name='notification-details'
        options={{
          title: 'Notification Details',
          headerShown: true
        }}
      />
    </Stack>
  )
}

export default StackLayout
