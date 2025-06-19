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
import * as Yup from 'yup'
import { useFormikContext } from 'formik'
import { useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'

import { images } from '@/constants'
import { useAddNewCustomerMutation } from '@/apis/customersApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import Screen from '@/components/ui/Screen'
import { Form, FormField, SubmitButton, Textarea, Datepicker } from '@/components/forms'

const validationSchema = Yup.object().shape({
    firstname: Yup.string().required().label('First name'),
    surname: Yup.string().required().label('Surname'),
    phone: Yup.string().required().label('Phone'),
    address: Yup.string().required().label('Address'),
    dob: Yup.date().required().label('Date of Birth'),
    gender: Yup.string().required().label('Gender'),
})

const RadioButtonGroup = ({ name, options }) => {
    const { values, setFieldValue } = useFormikContext()
    return (
        <View style={styles.radioContainer}>
            {options.map((option) => {
                const selected = values[name] === option.value
                return (
                    <Pressable
                        key={option.value}
                        onPress={() => setFieldValue(name, option.value)}
                        style={styles.radioOption}
                    >
                        <View style={[styles.radioCircle, selected && styles.radioSelected]}>
                            {selected && <View style={styles.radioInnerCircle} />}
                        </View>
                        <Text style={styles.radioLabel}>{option.label}</Text>
                    </Pressable>
                )
            })}
        </View>
    )
}

const Profile = () => {
    const dispatch = useDispatch()
    const navigation = useNavigation()
    const route = useRoute()
    const { user } = route.params
    const [addNewCustomer] = useAddNewCustomerMutation()

    const handleSubmit = async (data) => {
        let type = 'Error'
        let text = 'Profile setup error!'
        dispatch(setSpinner({ visibility: true }))
        const name = {
            firstname: data?.firstname,
            surname: data?.surname,
            othername: data?.othername
        }
        const contact = {
            phone: data?.phone,
            address: data?.address
        }
        try {
            const response = await addNewCustomer({
                name,
                gender: data.gender,
                dob: data.dob,
                contact,
                user: user
            })
            const error = response?.error
            if (!error) {
                const { status, message } = response?.data
                if (status === 'SUCCESS') {
                    type = 'Success'
                    text = 'Your profile has been saved successfully, Please proceed to login!'
                } else {
                    type = 'Error'
                    text = message
                }
            } else {
                //console.error('Profile Setup Error:', error)
                text = error.data.message
            }
        } catch (error) {
            text = `Profile Setup Error`
            //console.error('Profile Setup Error:', error)
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
                                    navigation.navigate('login')
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
            <ImageBackground
                blurRadius={30}
                style={styles.background}
                source={images.screen}
            >
                <Screen style={styles.container}>
                    <Image style={styles.logo} source={images.logo} />
                    <Text style={styles.tagline}>Profile Setup!</Text>
                    <Form
                        initialValues={{ firstname: '', surname: '', othername: '', gender: 'male' }}
                        onSubmit={(values) => handleSubmit(values)}
                        validationSchema={validationSchema}
                    >
                        <FormField
                            icon='account'
                            name='firstname'
                            placeholder='First Name'
                        />
                        <FormField
                            icon='account'
                            name='surname'
                            placeholder='Surname'
                        />
                        <FormField
                            icon='account'
                            name='othername'
                            placeholder='Other Name'
                        />
                        <Datepicker
                            autoCorrect={false}
                            icon='account'
                            name='dob'
                            placeholder='Date of Birth'
                        />
                        <RadioButtonGroup
                            name="gender"
                            options={[
                                { label: 'Male', value: 'Male' },
                                { label: 'Female', value: 'Female' }
                            ]}
                        />
                        <FormField
                            keyboardType='numeric'
                            icon='account'
                            name='phone'
                            placeholder='Phone Number'
                        />
                        <Textarea
                            autoCorrect={false}
                            icon='account'
                            name='address'
                            placeholder='Contact address'
                        />
                        <SubmitButton title='Save Profile' color='blueDark' />
                    </Form>
                </Screen>
            </ImageBackground>
        </TouchableWithoutFeedback>
    )
}

export default Profile

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
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: 'blue',
    },
    radioInnerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: 'blue',
    },
    radioLabel: {
        color: 'white',
        marginLeft: 8,
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
