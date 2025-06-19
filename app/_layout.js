import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import 'react-native-reanimated'
import { Provider, useSelector } from 'react-redux'

import { store } from '../store/store'
import { useColorScheme } from '@/hooks/useColorScheme'
import { selectCurrentSpinner } from '@/store/slices/spinnerSlice'

import Spinner from '@/components/Spinner'

SplashScreen.preventAutoHideAsync()

const AppContent = () => {
  const spinner = useSelector(selectCurrentSpinner)
  return (
    <>
      {spinner && <Spinner size='large' color='#0000ff' />}
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name='(auths)' options={{ headerShown: false }} />
      </Stack>
    </>
  )
}

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync()
    }
  }, [loaded])

  if (!loaded) {
    return null
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Provider store={store}>
        <AppContent />
      </Provider>
      <StatusBar style='auto' />
    </ThemeProvider>
  )
}
