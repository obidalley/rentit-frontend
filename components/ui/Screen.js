import React from 'react'
import Constants from 'expo-constants'
import { StyleSheet, SafeAreaView, ScrollView } from 'react-native'

const Screen = ({ children, style }) => {
  return (
    <SafeAreaView style={[styles.screen, style]}>
      <ScrollView contentContainerStyle={[styles.container, style]}>
        {children}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Constants.statusBarHeight,
    flex: 1,
  },
  container: {
    flexGrow: 1,
  },
})

export default Screen
