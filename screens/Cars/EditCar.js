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

import { useUpdateCarMutation } from '@/apis/carsApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import { Form, FormField, SubmitButton } from '@/components/forms'

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
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.header}>
                    <Text style={styles.tagline}>Edit Car Detials</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => changeMode('View')}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                </View>
                <Form
                    initialValues={{
                        name: selectedCar.name,
                        make: selectedCar.make,
                        model: selectedCar.model,
                        priceperday: selectedCar.priceperday.toString(),
                    }}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema}>
                    <FormField maxLength={255} name='name' placeholder='Car name' />
                    <FormField maxLength={255} name='make' placeholder='Car make' />
                    <FormField maxLength={255} name='model' placeholder='Car model' />
                    <FormField
                        keyboardType='numeric'
                        maxLength={8}
                        name='priceperday'
                        placeholder='Price'
                    />
                    <SubmitButton title='Update' color='blueDark' />
                </Form>
            </ScrollView>
        </SafeAreaView>
    )
}

export default EditCar

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
})
