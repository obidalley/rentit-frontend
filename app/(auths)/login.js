import React from 'react'
import {
  StyleSheet,
  ImageBackground,
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

import { images, } from '@/constants'
import { setCredentials } from '@/store/slices/authSlice'
import { useLoginMutation } from '@/apis/authApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import Screen from '@/components/ui/Screen'
import { Form, FormField, SubmitButton } from '@/components/forms'

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
        text = 'Welcome to Rentit car rental system!'
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
      <ImageBackground
        blurRadius={30}
        style={styles.background}
        source={images.screen}
      >
        <Screen style={styles.container}>
          <Image style={styles.logo} source={images.logo} />
          <Text style={styles.tagline}>Welcome Back!</Text>
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
            <Link href={`/register`} style={{ marginHorizontal: 'auto' }} asChild>
              <Pressable style={styles.button}>
                <Text style={styles.buttonText}>Sign up</Text>
              </Pressable>
            </Link>
            <Link href={`/forgot-password`} style={{ marginHorizontal: 'auto' }} asChild>
              <Pressable style={styles.button} disabled>
                <Text style={styles.buttonText}>Forgot Password</Text>
              </Pressable>
            </Link>
          </View>
        </Screen>
      </ImageBackground>
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
    padding: 10,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginVertical: 50,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: 'white',
  },
  tagline: {
    color: 'white',
    marginVertical: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'white',
  },
  orText: {
    marginHorizontal: 10,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  linkContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10
  },
  link: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  buttonText: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  button: {
    height: 40,
    width: 150,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    justifyContent: 'center',
  },
})
