import React from 'react'
import { Image, View, StyleSheet, TouchableOpacity, Alert, Text, ScrollView } from 'react-native'
import { useFormikContext } from 'formik'
import * as ImagePicker from 'expo-image-picker'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { COLORS } from '@/constants'
import ModernButton from '@/components/ui/Buttons/ModernButton'

const FormImagePicker = ({ name }) => {
    const { setFieldValue, values } = useFormikContext()

    const pickImages = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                aspect: [4, 3],
                quality: 1,
            })

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const uris = result.assets.map(asset => asset.uri)
                setFieldValue(name, [...(values[name] || []), ...uris])
            }
        } catch (error) {
            console.error("Error picking images:", error)
            Alert.alert('Error', 'Could not pick the images.')
        }
    }

    const removeImage = (uri) => {
        Alert.alert('Delete', 'Are you sure you want to delete this image?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: () =>
                    setFieldValue(
                        name,
                        values[name].filter(imageUri => imageUri !== uri)
                    ),
            },
        ])
    }

    return (
        <View style={styles.container}>
            <ModernButton
                title="Select Images"
                onPress={pickImages}
                variant="outline"
                size="medium"
            />
            
            {values[name]?.length > 0 && (
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.imageScrollView}
                    contentContainerStyle={styles.imageContainer}
                >
                    {values[name]?.map((uri, index) => (
                        <View key={index} style={styles.imageWrapper}>
                            <Image source={{ uri }} style={styles.image} />
                            <TouchableOpacity 
                                style={styles.removeButton}
                                onPress={() => removeImage(uri)}
                            >
                                <MaterialCommunityIcons 
                                    name="close-circle" 
                                    size={24} 
                                    color={COLORS.error.solid} 
                                />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
            
            {values[name]?.length === 0 && (
                <View style={styles.emptyState}>
                    <MaterialCommunityIcons 
                        name="image-plus" 
                        size={48} 
                        color={COLORS.neutral.medium} 
                    />
                    <Text style={styles.emptyText}>No images selected</Text>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 10,
    },
    imageScrollView: {
        marginTop: 16,
    },
    imageContainer: {
        paddingRight: 16,
    },
    imageWrapper: {
        position: 'relative',
        marginRight: 12,
    },
    image: {
        width: 120,
        height: 120,
        borderRadius: 12,
        backgroundColor: COLORS.neutral.light,
    },
    removeButton: {
        position: 'absolute',
        top: -8,
        right: -8,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        borderWidth: 2,
        borderColor: COLORS.neutral.light,
        borderStyle: 'dashed',
        borderRadius: 12,
        marginTop: 16,
    },
    emptyText: {
        marginTop: 8,
        fontSize: 14,
        color: COLORS.neutral.medium,
        textAlign: 'center',
    },
})

export default FormImagePicker
