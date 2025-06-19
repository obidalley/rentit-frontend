import React, { useEffect } from 'react'
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'

import colors from '../config/colors'

const ImageInput = ({ imageUris = [], onChangeImages }) => {
  useEffect(() => {
    requestPermission()
  }, [])

  // Request permission to access the media library
  const requestPermission = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!granted) alert('You need to enable permission to access the gallery.')
  }

  // Open the image library with multi-selection enabled
  const handleAddImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.5,
        allowsMultipleSelection: true,
      })
      if (!result.canceled) {
        // When multi-selection is enabled, result.selected is an array of assets.
        let selectedUris = []
        if (result.selected && result.selected.length > 0) {
          selectedUris = result.selected.map((asset) => asset.uri)
        } else if (result.uri) {
          selectedUris = [result.uri]
        }
        // Append new images while avoiding duplicates
        const newUris = [...imageUris]
        selectedUris.forEach((uri) => {
          if (!newUris.includes(uri)) {
            newUris.push(uri)
          }
        })
        onChangeImages(newUris)
      }
    } catch (error) {
      console.log('Error reading images', error)
    }
  }

  // Prompt user to confirm removal of an image
  const handleRemoveImage = (uri) => {
    Alert.alert('Delete', 'Are you sure you want to delete this image?', [
      { text: 'Yes', onPress: () => onChangeImages(imageUris.filter((imageUri) => imageUri !== uri)) },
      { text: 'No' },
    ])
  }

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {imageUris.map((uri, index) => (
          <View key={`${uri}-${index}`} style={styles.imageContainer}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.deleteIcon}
              onPress={() => handleRemoveImage(uri)}
            >
              <MaterialCommunityIcons name='delete' size={24} color='red' />
            </TouchableOpacity>
          </View>
        ))}
        <TouchableOpacity style={styles.addButton} onPress={handleAddImages}>
          <MaterialCommunityIcons name='plus' size={40} color={colors.medium} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 15,
  },
  deleteIcon: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 12,
    padding: 2,
  },
  addButton: {
    width: 100,
    height: 100,
    backgroundColor: colors.light,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
})

export default ImageInput
