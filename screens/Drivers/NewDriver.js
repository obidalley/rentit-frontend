import React from 'react'
import {
    StyleSheet,
    Text,
    Alert,
    View,
    ScrollView,
    Pressable
} from 'react-native'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'
import { useFormikContext } from 'formik'

import { useAddNewDriverMutation } from '@/apis/driversApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import { COLORS } from '@/constants'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import ModernButton from '@/components/ui/Buttons/ModernButton'
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
            <Text style={styles.sectionLabel}>Gender</Text>
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
        <GradientBackground colors={COLORS.background.light}>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Add New Driver</Text>
                    <ModernButton
                        title="Back"
                        onPress={() => changeMode('View')}
                        variant="outline"
                        size="medium"
                    />
                </View>
                
                <ModernCard style={styles.formCard}>
            <ScrollView>
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
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        <FormField maxLength={255} name='firstname' icon='account' placeholder='First Name' />
                        <FormField maxLength={255} name='surname' icon='account' placeholder='Surname' />
                        <FormField maxLength={255} name='othername' icon='account' placeholder='Other Name (Optional)' />
                    <Datepicker
                        autoCorrect={false}
                            icon='calendar'
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
                        
                        <Text style={styles.sectionTitle}>Professional Details</Text>
                    <FormField
                        keyboardType='numeric'
                        maxLength={8}
                        name='priceperday'
                            icon='currency-usd'
                            placeholder='Price Per Day'
                    />
                        
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                    <FormField
                        keyboardType='numeric'
                        name='phone'
                            icon='phone'
                        placeholder='Phone Number'
                    />
                    <Textarea
                        autoCorrect={false}
                            icon='map-marker'
                        name='address'
                        placeholder='Contact address'
                    />
                        <SubmitButton title='Save Driver' />
                </Form>
                </ScrollView>
                </ModernCard>
            </View>
        </GradientBackground>
    )
}

export default NewDriver

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.neutral.dark,
    },
    formCard: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral.dark,
        marginTop: 16,
        marginBottom: 8,
    },
    sectionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral.dark,
        marginBottom: 8,
    },
    radioContainer: {
        marginVertical: 10,
    },
    radioRow: {
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
        color: COLORS.neutral.dark,
        marginLeft: 8,
        fontSize: 16,
    },
})
