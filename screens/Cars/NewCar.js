import React from 'react'
import {
    StyleSheet,
    Text,
    Alert,
    View,
    TouchableOpacity,
    SafeAreaView,
    ScrollView
} from 'react-native'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'

import { useAddNewCarMutation } from '@/apis/carsApi'
import { setSpinner } from '@/store/slices/spinnerSlice'
import { COLORS } from '@/constants'

import { Form, FormField, SubmitButton } from '@/components/forms'
import FormImagePicker from '@/components/forms/FormImagePicker'
import ModernCard from '@/components/ui/ModernCard'
import ModernButton from '@/components/ui/Buttons/ModernButton'

const validationSchema = Yup.object().shape({
    name: Yup.string().required().label('Name'),
    model: Yup.string().required().label('Model'),
    make: Yup.string().required().label('Make'),
    priceperday: Yup.number().required().min(1).label('Price per day'),
    images: Yup.array().min(1, 'Please select at least one image.'),
})

const NewCar = ({ changeMode }) => {
    const dispatch = useDispatch()
    const [addNewCar] = useAddNewCarMutation()

    const handleSubmit = async (data, { resetForm }) => {
        let type = 'Error'
        let text = 'Error adding new record!'
        dispatch(setSpinner({ visibility: true }))
        try {
            const response = await addNewCar({
                name: data.name,
                make: data.make,
                model: data.model,
                priceperday: data.priceperday,
                images: data.images,
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
                text = error.data.message
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
                <ModernCard style={styles.headerCard}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Add New Car</Text>
                        <ModernButton
                            title="Back"
                            onPress={() => changeMode('View')}
                            variant="outline"
                            size="small"
                        />
                    </View>
                </ModernCard>
                
                <ModernCard style={styles.formCard}>
                    <Form
                        initialValues={{
                            name: '',
                            make: '',
                            model: '',
                            priceperday: '',
                            images: [],
                        }}
                        onSubmit={handleSubmit}
                        validationSchema={validationSchema}
                    >
                        <Text style={styles.sectionTitle}>Car Images</Text>
                        <FormImagePicker name="images" />
                        
                        <Text style={styles.sectionTitle}>Car Details</Text>
                        <FormField 
                            maxLength={255} 
                            name='name' 
                            placeholder='Car Name'
                            icon='car'
                        />
                        <FormField 
                            maxLength={255} 
                            name='make' 
                            placeholder='Car Make (e.g., Toyota, Honda)'
                            icon='factory'
                        />
                        <FormField 
                            maxLength={255} 
                            name='model' 
                            placeholder='Car Model (e.g., Camry, Civic)'
                            icon='car-side'
                        />
                        <FormField
                            keyboardType='numeric'
                            maxLength={8}
                            name='priceperday'
                            placeholder='Price per Day (₦)'
                            icon='currency-ngn'
                        />
                        <SubmitButton title='Add Car' />
                    </Form>
                </ModernCard>
            </ScrollView>
        </SafeAreaView>
    )
}

export default NewCar

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    headerCard: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral.dark,
    },
    formCard: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral.dark,
        marginBottom: 12,
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral.dark,
        marginBottom: 8,
        marginTop: 12,
    },
})
