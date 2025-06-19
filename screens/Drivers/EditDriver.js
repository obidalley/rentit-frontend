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
import moment from 'moment'

import { useUpdateDriverMutation } from '@/apis/driversApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import { Form, FormField, Textarea, Datepicker, SubmitButton } from '@/components/forms'

const validationSchema = Yup.object().shape({
    firstname: Yup.string().required().label('First name'),
    surname: Yup.string().required().label('Surname'),
    priceperday: Yup.number().required().min(1).label('Price per day'),
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

const EditDriver = ({ selectedDriver, changeMode }) => {
    const dispatch = useDispatch()
    const [updateDriver] = useUpdateDriverMutation()

    const handleSubmit = async (data) => {
        let type = 'Error'
        let text = 'Error updating record!'
        dispatch(setSpinner({ visibility: true }))
        try {
            const response = await updateDriver({
                id: selectedDriver.id,
                name: {
                    firstname: data.firstname,
                    surname: data.surname,
                    othername: data.othername,
                },
                gender: data.gender,
                dob: data.dob,
                priceperday: data.priceperday,
                contact: {
                    phone: data.phone,
                    address: data.address,
                },
            })
            const error = response?.error
            if (!error) {
                const { status, message } = response?.data
                if (status === 'SUCCESS') {
                    type = 'Success'
                    text = 'Record updated successfully!'
                } else {
                    type = 'Error'
                    text = message
                }
            } else {
                console.error('Update Record Error:', error)
                text = error.data.message
            }
        } catch (error) {
            text = 'Update Record Error'
            console.error('Update Record Error:', error)
        } finally {
            setTimeout(() => {
                dispatch(setSpinner({ visibility: false }))
                Alert.alert('Edit Driver', text, [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (type === 'Success') {
                                changeMode('View')
                            }
                        },
                    },
                ])
            }, 3000)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.tagline}>Edit Driver Details</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => changeMode('View')}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                </View>
                <Form
                    initialValues={{
                        firstname: selectedDriver?.name?.firstname,
                        surname: selectedDriver?.name?.surname,
                        othername: selectedDriver?.name?.othername,
                        gender: selectedDriver?.gender,
                        priceperday: selectedDriver.priceperday?.toString(),
                        phone: selectedDriver?.contact?.phone,
                        address: selectedDriver?.contact?.address,
                        dob: moment(selectedDriver?.dob).format('YYYY-MM-DD'),
                    }}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema}
                >
                    <FormField maxLength={255} name='firstname' placeholder='First Name' />
                    <FormField maxLength={255} name='surname' placeholder='Surname' />
                    <FormField maxLength={255} name='othername' placeholder='Other Name' />
                    <Datepicker name='dob' placeholder='Date of Birth' />
                    <RadioButtonGroup
                        name='gender'
                        options={[
                            { label: 'Male', value: 'Male' },
                            { label: 'Female', value: 'Female' }
                        ]}
                    />
                    <FormField
                        keyboardType='numeric'
                        maxLength={8}
                        name='priceperday'
                        placeholder='Price per day'
                    />
                    <FormField keyboardType='numeric' name='phone' placeholder='Phone Number' />
                    <Textarea name='address' placeholder='Contact address' />
                    <SubmitButton title='Update' color='blueDark' />
                </Form>
            </ScrollView>
        </SafeAreaView>
    )
}

export default EditDriver

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
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
