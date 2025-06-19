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

import { useUpdateDamageMutation } from '@/apis/damagesApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import { Form, Textarea, SubmitButton } from '@/components/forms'

const validationSchema = Yup.object().shape({
    description: Yup.string().required().label('Description'),
})

const EditDamage = ({ selectedDamage, changeMode }) => {
    const dispatch = useDispatch()
    const [updateDamage] = useUpdateDamageMutation()

    const handleSubmit = async (data) => {
        let type = 'Error'
        let text = 'Error updating record!'
        dispatch(setSpinner({ visibility: true }))
        try {
            const response = await updateDamage({
                id: selectedDamage.id,
                description: data.description,
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
                Alert.alert('Edit Damage', text, [
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
                    <Text style={styles.tagline}>Edit Damage Detials</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={() => changeMode('View')}>
                        <Text style={styles.buttonText}>Back</Text>
                    </TouchableOpacity>
                </View>
                <Form
                    initialValues={{
                        description: selectedDamage.description,
                    }}
                    onSubmit={handleSubmit}
                    validationSchema={validationSchema}>
                    <Textarea
                        autoCorrect={false}
                        name='description'
                        placeholder='Damage description'
                    />
                    <SubmitButton title='Update' color='blueDark' />
                </Form>
            </ScrollView>
        </SafeAreaView>
    )
}

export default EditDamage

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
