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
import { useRouter } from 'expo-router'

import { useAddNewDamageMutation } from '@/apis/damagesApi'
import useAuth from '@/hooks/useAuth'
import { setSpinner } from '@/store/slices/spinnerSlice'

import { Form, Textarea, SubmitButton } from '@/components/forms'
import FormImagePicker from '@/components/forms/FormImagePicker'

const validationSchema = Yup.object().shape({
    description: Yup.string().required().label('Description'),
    images: Yup.array().min(1, 'Please select at least one image.'),
})

const NewDamage = ({ rent }) => {
    const { user } = useAuth()
    const router = useRouter()
    const dispatch = useDispatch()
    const [addNewDamage] = useAddNewDamageMutation()

    const handleSubmit = async (data, { resetForm }) => {
        let type = 'Error'
        let text = 'Error adding new record!'
        dispatch(setSpinner({ visibility: true }))
        try {
            const response = await addNewDamage({
                customer: user?.uid || '',
                rent: rent || '',
                description: data.description,
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
                                    if (user?.roles.includes('Admin')) {
                                        router.push('/(dashboard)')
                                    } else {
                                        router.push('/(customer)')
                                    }
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
                <Form
                    initialValues={{
                        description: '',
                        images: [],
                    }}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema}
                >
                    <FormImagePicker name='images' />
                    <Textarea
                        autoCorrect={false}
                        name='description'
                        placeholder='Damage description'
                    />
                    <SubmitButton title='Save' color='blueDark' />
                </Form>
            </ScrollView>
        </SafeAreaView>
    )
}

export default NewDamage

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
