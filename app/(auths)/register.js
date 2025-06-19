import React, { useState } from 'react'
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

import { images } from '@/constants'
import { useRegisterUserMutation } from '@/apis/usersApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import Screen from '@/components/ui/Screen'
import { Form, FormField, SubmitButton } from '@/components/forms'

const validationSchema = Yup.object().shape({
    email: Yup.string().required().email().label('Email'),
    password: Yup.string().required().min(4).label('Password'),
    confirmpassword: Yup.string()
        .required()
        .min(4)
        .label('Confirm Password')
        .oneOf([Yup.ref('password'), null], 'Passwords mismatch!!'),
})

const RegisterScreen = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const [registerUser] = useRegisterUserMutation()

    const handleSubmit = async (data) => {
        let type = 'Error'
        let text = 'Authentication error!'
        let userData = null

        dispatch(setSpinner({ visibility: true }))
        try {
            const response = await registerUser({
                email: data.email,
                password: data.password,
                confirmpassword: data.confirmpassword,
                roles: data.roles,
            })

            const error = response?.error
            if (!error) {
                const { status, message, data: returnedData } = response?.data
                if (status === 'SUCCESS') {
                    type = 'Success'
                    text = 'Authentication Success!'
                    userData = returnedData
                } else {
                    type = 'Error'
                    text = message
                }
            } else {
                //console.error('Authentication error:', error)
                text = error.data.message
            }
        } catch (error) {
            //console.error('Authentication Error:', error)
            if (error?.status === 'FETCH_ERROR') {
                text = 'Network error, please check your network and try again'
            } else {
                text = error.data?.message || 'An authentication error has occurred!'
            }
        } finally {
            setTimeout(() => {
                dispatch(setSpinner({ visibility: false }))
                if (type === 'Success') {
                    Alert.alert(
                        'Authentication',
                        text,
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    navigation.navigate('profile', { user: userData?.id })
                                },
                            },
                        ],
                        { cancelable: false }
                    )
                } else {
                    Alert.alert('Authentication', text)
                }
            }, 3000)
        }
    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <ImageBackground blurRadius={30} style={styles.background} source={images.screen}>
                <Screen style={styles.container}>
                    <Image style={styles.logo} source={images.logo} />
                    <Text style={styles.tagline}>Create an Account!</Text>
                    <Form
                        initialValues={{ email: '', password: '', roles: ['Customer'] }}
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
                        <FormField
                            autoCapitalize='none'
                            autoCorrect={false}
                            icon='lock'
                            name='confirmpassword'
                            placeholder='Confirm Password'
                            secureTextEntry
                            textContentType='password'
                        />
                        <SubmitButton title='Sign up' color='blueDark' />
                    </Form>

                    <View style={styles.separatorContainer}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>Or</Text>
                        <View style={styles.line} />
                    </View>

                    <View style={styles.linkContainer}>
                        <Link href={`/login`} style={{ marginHorizontal: 'auto' }} asChild>
                            <Pressable style={styles.button}>
                                <Text style={styles.buttonText}>Login</Text>
                            </Pressable>
                        </Link>
                    </View>
                </Screen>
            </ImageBackground>
        </TouchableWithoutFeedback>
    )
}

export default RegisterScreen

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
        marginVertical: 10,
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
        width: '100%',
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
        justifyContent: 'center',
    },
})
