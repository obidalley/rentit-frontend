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

import { Form, FormField, SubmitButton } from '@/components/forms'
import FormImagePicker from '@/components/forms/FormImagePicker'

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
                <View style={styles.header}>
                    <Text style={styles.tagline}>Add a New Car!</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => changeMode('View')}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                </View>
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
                    <FormImagePicker name="images" />
                    <FormField maxLength={255} name='name' placeholder='Car name' />
                    <FormField maxLength={255} name='make' placeholder='Car make' />
                    <FormField maxLength={255} name='model' placeholder='Car model' />
                    <FormField
                        keyboardType='numeric'
                        maxLength={8}
                        name='priceperday'
                        placeholder='Price'
                    />
                    <SubmitButton title='Save' color='blueDark' />
                </Form></ScrollView>
        </SafeAreaView>
    )
}

export default NewCar

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
})
