import React from 'react'
import {
    StyleSheet,
    Text,
    Alert,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView,
    Pressable
} from 'react-native'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'
import { useFormikContext } from 'formik'

import { useAddNewDriverMutation } from '@/apis/driversApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import { Form, FormField, Textarea, Datepicker, SubmitButton } from '@/components/forms'

const validationSchema = Yup.object().shape({
    firstname: Yup.string().required().label('First name'),
    surname: Yup.string().required().label('Surname'),
    phone: Yup.string().required().label('Phone'),
    priceperday: Yup.number().required().min(1).label('Price per day'),
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

const NewDriver = ({ changeMode }) => {
    const dispatch = useDispatch()
    const [addNewDriver] = useAddNewDriverMutation()

    const handleSubmit = async (data, { resetForm }) => {
        let type = 'Error'
        let text = 'Error adding new record!'
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
            const response = await addNewDriver({
                name,
                gender: data?.gender,
                dob: data?.dob,
                priceperday: data?.priceperday,
                contact,
            })
            const error = response?.error
            if (!error) {
                const { status, message } = response?.data
                if (status === 'SUCCESS') {
                    type = 'Success'
                    text = 'New record added successfully!'
                } else {
                    type = 'Error'
                    text = message
                }
            } else {
                console.error('New Record Error:', error)
                text = error.data?.message
            }
        } catch (error) {
            text = 'New Record Error'
            console.error('New Record Error:', error)
        } finally {
            setTimeout(() => {
                dispatch(setSpinner({ visibility: false }))
                if (type === 'Success') {
                    resetForm()
                    Alert.alert(
                        'New Record',
                        text,
                        [
                            {
                                text: 'OK',
                                onPress: () => {
                                    changeMode('View')
                                },
                            },
                        ],
                        { cancelable: false }
                    )
                } else {
                    Alert.alert('New Record', text)
                }
            }, 3000)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.tagline}>Add a New Driver!</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => changeMode('View')}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                </View>
                <Form
                    initialValues={{
                        firstname: '',
                        surname: '',
                        othername: '',
                        gender: 'Male',
                        phone: '',
                        address: '',
                        priceperday: 0,
                    }}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema}
                >
                    <FormField maxLength={255} name='firstname' icon='account' placeholder='First Name' />
                    <FormField maxLength={255} name='surname' icon='account' placeholder='Surname' />
                    <FormField maxLength={255} name='othername' icon='account' placeholder='Other Name' />
                    <Datepicker
                        autoCorrect={false}
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
                        maxLength={8}
                        name='priceperday'
                        placeholder='Price'
                    />
                    <FormField
                        keyboardType='numeric'
                        name='phone'
                        placeholder='Phone Number'
                    />
                    <Textarea
                        autoCorrect={false}
                        icon='account'
                        name='address'
                        placeholder='Contact address'
                    />
                    <SubmitButton title='Save' color='blueDark' />
                </Form></ScrollView>
        </SafeAreaView>
    )
}

export default NewDriver

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    title: {
        color: 'white',
        fontSize: 14,
    },
    tagline: {
        color: 'white',
        marginVertical: 10,
        textAlign: 'center',
        fontSize: 16,
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomColor: 'white',
        borderBottomWidth: 1,
        paddingBottom: 10,
    },
    button: {
        backgroundColor: 'red',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
    },
    buttonText: {
        color: 'white',
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
})
