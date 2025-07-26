import React from 'react'
import {
  StyleSheet,
  Image,
  Keyboard,
  TouchableWithoutFeedback,
  View,
  Text,
  Pressable,
  Alert
} from 'react-native'
import { Link } from 'expo-router'
import { useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import * as Yup from 'yup'

import { images, APP_FULL_NAME, COLORS } from '@/constants'
import { setCredentials } from '@/store/slices/authSlice'
import { useLoginMutation } from '@/apis/authApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import Screen from '@/components/ui/Screen'
import { Form, FormField, SubmitButton } from '@/components/forms'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'

const validationSchema = Yup.object().shape({
  email: Yup.string().required().email().label('Email'),
  password: Yup.string().required().min(4).label('Password'),
})

const Login = () => {
  const [login] = useLoginMutation()
  const navigation = useNavigation()
  const dispatch = useDispatch()

  const handleSubmit = async (data) => {
    let type = 'Error'
    let text = 'Authentication error!'
    let isAdmin = false
    dispatch(setSpinner({ visibility: true }))
    try {
      const response = await login({ password: data.password, email: data.email }).unwrap()
      const { status, accessToken, roles } = response
      if (status === 'SUCCESS') {
        dispatch(setCredentials({ accessToken }))
        type = 'Success'
        text = `Welcome to ${APP_FULL_NAME}!`
        isAdmin = roles.includes('Admin')
      } else {
        //console.error('An error occured', response.error)
        text = 'An error occured during authentication'
      }
    } catch (error) {
      //console.error('Authentication Error:', error)
      if (error?.status === 'FETCH_ERROR') {
        text = 'Network error, please check your network and try again'
      } else {
        text = error.data?.message || 'An authentication error has occured!'
      }
    } finally {
      setTimeout(() => {
        dispatch(setSpinner({ visibility: false }))
        if (type === 'Success') {
          Alert.alert(
            'Account Login',
            text,
            [
              {
                text: 'OK',
                onPress: () => {
                  if (isAdmin) {
                    navigation.navigate('(dashboard)')
                  } else {
                    navigation.navigate('(customer)')
                  }
                },
              },
            ],
            { cancelable: false }
          )
        } else {
          Alert.alert('Account Login', text)
        }
      }, 3000)
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <GradientBackground colors={COLORS.background.primary}>
        <Screen style={styles.container}>
          <View style={styles.header}>
            <Image style={styles.logo} source={images.logo} />
            <Text style={styles.appName}>{APP_FULL_NAME}</Text>
            <Text style={styles.tagline}>Welcome Back!</Text>
          </View>
          
          <ModernCard style={styles.formCard}>
            <Form
              initialValues={{ email: '', password: '' }}
              onSubmit={(values) => handleSubmit(values)}
              validationSchema={validationSchema}
            >
              <FormField
                autoCapitalize='none'
                autoCorrect={false}
                icon='email'
                keyboardType='email-address'
                name='email'
                placeholder='Email'
                textContentType='emailAddress'
              />
              <FormField
                autoCapitalize='none'
                autoCorrect={false}
                icon='lock'
                name='password'
                placeholder='Password'
                secureTextEntry
                textContentType='password'
              />
              <SubmitButton title='Login' />
            </Form>
            
            <View style={styles.separatorContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>Or</Text>
              <View style={styles.line} />
            </View>
            
            <View style={styles.linkContainer}>
              <Link href={`/register`} style={{ flex: 1 }} asChild>
                <Pressable style={styles.button}>
                  <Text style={styles.buttonText}>Sign up</Text>
                </Pressable>
              </Link>
              <Link href={`/forgot-password`} style={{ flex: 1 }} asChild>
                <Pressable style={[styles.button, styles.disabledButton]} disabled>
                  <Text style={[styles.buttonText, styles.disabledText]}>Forgot Password</Text>
                </Pressable>
              </Link>
            </View>
          </ModernCard>
        </Screen>
      </GradientBackground>
    </TouchableWithoutFeedback>
  )
}

export default Login

const styles = StyleSheet.create({
  background: {
    height: '100%',
    width: '100%',
  },
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: 'white',
    marginTop: 8,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  orText: {
    marginHorizontal: 10,
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.primary.solid,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  disabledText: {
    color: '#666',
  },
})
