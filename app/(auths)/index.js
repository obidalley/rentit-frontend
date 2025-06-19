import React from 'react'
import { View, Text, StyleSheet, ImageBackground, Image } from 'react-native'
import { useNavigation } from 'expo-router'

import { images } from '@/constants'
import Button from '@/components/ui/Buttons/Button'

const App = () => {
  const navigation = useNavigation()

  const handleLoginPress = () => {
    navigation.navigate('login')
  }

  const handleRegisterPress = () => {
    navigation.navigate('register')
  }

  return (
    <ImageBackground
      blurRadius={10}
      style={styles.background}
      source={images.screen}
    >
      <View style={styles.logoContainer}>
        <Image style={styles.logo} source={images.logo} />
        <Text style={styles.tagline}>
          Drive Your Dreams – Experience the Freedom of the Road!
        </Text>
      </View>
      <View style={styles.buttonsContainer}>
        <Button title='Login' onPress={handleLoginPress} />
        <Button title='Register' color='secondary' onPress={handleRegisterPress} />
      </View>
    </ImageBackground>
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
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
  },
  logoContainer: {
    position: 'absolute',
    top: 70,
    alignItems: 'center',
  },
  tagline: {
    color: 'white',
    fontSize: 30,
    fontWeight: '700',
    paddingVertical: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
})
