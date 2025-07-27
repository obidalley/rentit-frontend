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
import * as Yup from 'yup'
import { useFormikContext } from 'formik'
import { useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native'
import { useRoute } from '@react-navigation/native'

import { images, APP_FULL_NAME, COLORS } from '@/constants'
import { useAddNewCustomerMutation } from '@/apis/customersApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import Screen from '@/components/ui/Screen'
import { Form, FormField, SubmitButton, Textarea, Datepicker } from '@/components/forms'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'

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
            <GradientBackground colors={COLORS.background.primary}>
                <Screen style={styles.container}>
                    <View style={styles.header}>
                        <Image style={styles.logo} source={images.logo} />
                        <Text style={styles.appName}>{APP_FULL_NAME}</Text>
                        <Text style={styles.tagline}>Complete Your Profile</Text>
                    </View>
                    
                    <ModernCard style={styles.formCard}>
                        <Form
                            initialValues={{ firstname: '', surname: '', othername: '', gender: 'Male' }}
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
                                placeholder='Other Name (Optional)'
                            />
                            <Datepicker
                                autoCorrect={false}
                                icon='calendar'
                                name='dob'
                                placeholder='Date of Birth'
                            />
                            <View style={styles.genderSection}>
                                <Text style={styles.sectionLabel}>Gender</Text>
                                <RadioButtonGroup
                                    name="gender"
                                    options={[
                                        { label: 'Male', value: 'Male' },
                                        { label: 'Female', value: 'Female' }
                                    ]}
                                />
                            </View>
                            <FormField
                                keyboardType='numeric'
                                icon='phone'
                                name='phone'
                                placeholder='Phone Number'
                            />
                            <Textarea
                                autoCorrect={false}
                                icon='map-marker'
                                name='address'
                                placeholder='Contact Address'
                            />
                            <SubmitButton title='Complete Profile' />
                        </Form>
                    </ModernCard>
                </Screen>
            </GradientBackground>
        </TouchableWithoutFeedback>
    )
}

export default Profile

const styles = StyleSheet.create({
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
    genderSection: {
        marginVertical: 10,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    radioContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    radioOption: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    radioCircle: {
        height: 20,
        width: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLORS.primary.solid,
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioSelected: {
        borderColor: COLORS.primary.solid,
    },
    radioInnerCircle: {
        height: 10,
        width: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary.solid,
    },
    radioLabel: {
        color: '#333',
        marginLeft: 8,
        fontSize: 16,
    },
})
