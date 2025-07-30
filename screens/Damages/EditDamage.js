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

import { COLORS } from '@/constants'
import { useUpdateDamageMutation } from '@/apis/damagesApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import ModernButton from '@/components/ui/Buttons/ModernButton'
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
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Edit Damage Report</Text>
                <Text style={styles.subtitle}>
                    Update the damage description as needed
                </Text>
                <ModernButton
                    title="Back to List"
                    onPress={() => changeMode('View')}
                    variant="outline"
                    size="medium"
                />
            </View>
            
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <ModernCard style={styles.formCard}>
                    <Form
                        initialValues={{
                            description: selectedDamage.description,
                        }}
                        onSubmit={handleSubmit}
                        validationSchema={validationSchema}
                    >
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Damage Description</Text>
                            <Text style={styles.sectionSubtitle}>
                                Update the damage description with any additional details
                            </Text>
                            <Textarea
                                autoCorrect={false}
                                name='description'
                                placeholder='Please describe the damage in detail...'
                                numberOfLines={6}
                            />
                        </View>
                        
                        <SubmitButton title='Update Damage Report' variant='primary' />
                    </Form>
                </ModernCard>
            </ScrollView>
        </View>
    )
}

export default EditDamage

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
        marginBottom: 16,
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
