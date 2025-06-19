import React from 'react'
import { Image, View, StyleSheet, TouchableOpacity, Alert, Text } from 'react-native'
import { useFormikContext } from 'formik'
import * as ImagePicker from 'expo-image-picker'

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
            <View style={styles.header}>
                <TouchableOpacity onPress={pickImages} style={styles.button}>
                    <Text style={styles.buttonText}>Select Image</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.imageContainer}>
                {values[name]?.map((uri, index) => (
                    <TouchableOpacity key={index} onPress={() => removeImage(uri)}>
                        <Image source={{ uri }} style={styles.image} />
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        marginVertical: 10,
        alignItems: 'center',
    },
    header: {
        height: 40,
        width: '100%'
    },
    imageContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 2,
        marginTop: 10,
        justifyContent: 'flex-start',
    },
    image: {
        width: 100,
        height: 100,
        margin: 5,
        borderRadius: 10,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'blue',
        color: 'white',
        borderRadius: 10,
        marginRight: 10,
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold'
    },
    addButton: {
        width: 100,
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 10,
        marginRight: 10,
        marginBottom: 10,
    },
})

export default FormImagePicker
