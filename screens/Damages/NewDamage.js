import React from 'react'
import {
    Text,
    Alert,
    View,
    ScrollView,
    StyleSheet
} from 'react-native'
import * as Yup from 'yup'
import { useDispatch } from 'react-redux'
import { useRouter } from 'expo-router'

import { COLORS } from '@/constants'
import { useAddNewDamageMutation } from '@/apis/damagesApi'
import useAuth from '@/hooks/useAuth'
import { setSpinner } from '@/store/slices/spinnerSlice'

import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
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
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Report Damage</Text>
                <Text style={styles.subtitle}>
                    Please provide details and photos of any damage to the vehicle
                </Text>
            </View>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ModernCard style={styles.formCard}>
                    <Form
                        initialValues={{
                            description: '',
                            images: [],
                        }}
                        onSubmit={handleSubmit}
                        validationSchema={validationSchema}
                    >
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Upload Photos</Text>
                            <Text style={styles.sectionSubtitle}>
                                Add photos showing the damage clearly
                            </Text>
                            <FormImagePicker name='images' />
                        </View>
                        
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Damage Description</Text>
                            <Text style={styles.sectionSubtitle}>
                                Describe the damage in detail
                            </Text>
                            <Textarea
                                autoCorrect={false}
                                name='description'
                                placeholder='Please describe the damage, when it occurred, and any relevant circumstances...'
                                numberOfLines={6}
                            />
                        </View>
                        
                        <SubmitButton title='Submit Damage Report' variant='primary' />
                    </Form>
                </ModernCard>
            </ScrollView>
        </View>
    )
}

export default NewDamage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        marginBottom: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: COLORS.neutral.dark,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.neutral.medium,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    formCard: {
        marginBottom: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.neutral.dark,
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: COLORS.neutral.medium,
        marginBottom: 12,
        lineHeight: 20,
    },
})

        fontSize: 16,
    },
})
