import React from 'react'
import { View, Text, StyleSheet, Image } from 'react-native'
import { useNavigation } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'

import { images, APP_FULL_NAME, COLORS } from '@/constants'
import ModernButton from '@/components/ui/Buttons/ModernButton'
import GradientBackground from '@/components/ui/GradientBackground'

const App = () => {
  const navigation = useNavigation()

  const handleLoginPress = () => {
    navigation.navigate('login')
  }

  const handleRegisterPress = () => {
    navigation.navigate('register')
  }

  return (
    <GradientBackground colors={COLORS.background.primary}>
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={images.logo} />
        <Text style={styles.appName}>{APP_FULL_NAME}</Text>
        <Text style={styles.tagline}>
          Drive Your Dreams – Experience the Freedom of the Road!
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        <ModernButton 
          title='Login' 
          onPress={handleLoginPress}
          variant='primary'
          size='large'
        />
        <ModernButton 
          title='Register' 
          onPress={handleRegisterPress}
          variant='outline'
          size='large'
        />
      </View>
    </GradientBackground>
  )
}

export default App

const styles = StyleSheet.create({
  background: {
    height: '100%',
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  buttonsContainer: {
    padding: 20,
    width: '100%',
    gap: 12,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoContainer: {
    position: 'absolute',
    top: 100,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  appName: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    lineHeight: 24,
  },
})
