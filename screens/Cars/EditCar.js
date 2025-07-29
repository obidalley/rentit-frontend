import React from 'react'
import {
    StyleSheet,
    Text,
    Alert,
    View,
    SafeAreaView,
    ScrollView
} from 'react-native'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'

import { COLORS } from '@/constants'
import { useUpdateCarMutation } from '@/apis/carsApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import { Form, FormField, SubmitButton } from '@/components/forms'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import ModernButton from '@/components/ui/Buttons/ModernButton'

const validationSchema = Yup.object().shape({
    name: Yup.string().required().label('Name'),
    model: Yup.string().required().label('Model'),
    make: Yup.string().required().label('Make'),
    priceperday: Yup.number().required().min(1).label('Price per day'),
})

const EditCar = ({ selectedCar, changeMode }) => {
    const dispatch = useDispatch()
    const [updateCar] = useUpdateCarMutation()

    const handleSubmit = async (data) => {
        let type = 'Error'
        let text = 'Error updating record!'
        dispatch(setSpinner({ visibility: true }))
        try {
            const response = await updateCar({
                id: selectedCar.id,
                name: data.name,
                make: data.make,
                model: data.model,
                priceperday: data.priceperday,
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
                Alert.alert('Edit Car', text, [
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
        <GradientBackground colors={COLORS.background.primary}>
            <SafeAreaView style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ModernCard style={styles.headerCard}>
                        <View style={styles.header}>
                            <Text style={styles.title}>Edit Car Details</Text>
                            <ModernButton
                                title="Back"
                                onPress={() => changeMode('View')}
                                variant="outline"
                                size="small"
                            />
                        </View>
                    </ModernCard>
                    
                    <ModernCard style={styles.formCard}>
                        <Text style={styles.sectionTitle}>Vehicle Information</Text>
                        <Form
                            initialValues={{
                                name: selectedCar.name,
                                make: selectedCar.make,
                                model: selectedCar.model,
                                priceperday: selectedCar.priceperday.toString(),
                            }}
                            onSubmit={handleSubmit}
                            validationSchema={validationSchema}
                        >
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
                            <SubmitButton title='Update Car' />
                        </Form>
                    </ModernCard>
                </ScrollView>
            </SafeAreaView>
        </GradientBackground>
    )
}

export default EditCar

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
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral.dark,
        marginBottom: 16,
    },
})
