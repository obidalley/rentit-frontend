import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
    Alert,
} from 'react-native'
import { Divider } from 'react-native-paper'
import { useRouter } from 'expo-router'

import { BASE_URL } from '@/constants'
import { useUpdateCarMutation } from '@/apis/carsApi'

import Rating from '@/components/Rating'

const Car = ({ car, onBack, onBook }) => {
    const router = useRouter()
    const [selectedImage, setSelectedImage] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [localCar, setLocalCar] = useState(car)
    const [updateCar] = useUpdateCarMutation()

    useEffect(() => {
        setLocalCar(car)
    }, [car])

    const handleImagePress = (imgUrl) => {
        setSelectedImage(imgUrl)
        setModalVisible(true)
    }

    const closeModal = () => {
        setModalVisible(false)
        setSelectedImage(null)
    }

    const formattedPrice = Number(localCar?.priceperday).toLocaleString()

    const handleRatingChange = async (newRating) => {
        setLocalCar((prev) => ({ ...prev, rating: newRating }))
        let type = 'Success'
        let text = 'Rating updated successfully!'
        try {
            const response = await updateCar({ id: localCar?.id, rating: newRating })
            if (response.error) {
                type = 'Error'
                text = response.error.data?.message || 'Failed to update rating!'
            }
        } catch (error) {
            type = 'Error'
            text = error?.data?.message || 'An error occurred while updating rating!'
        } finally {
            if (type === 'Error') {
                setTimeout(() => {
                    Alert.alert(type, text)
                }, 1000)
            }
        }
    }

    const handleReactionChange = async (reactionType) => {
        setLocalCar((prev) => ({
            ...prev,
            reactions: {
                ...prev.reactions,
                [reactionType]: (prev.reactions?.[reactionType] || 0) + 1,
            },
        }))
        let type = 'Success'
        let text = 'Reaction updated successfully!'
        try {
            const currentCount = localCar?.reactions?.[reactionType] || 0
            const newCount = currentCount + 1
            const updatedReactions = { ...localCar.reactions, [reactionType]: newCount }
            const response = await updateCar({ id: localCar?.id, reactions: updatedReactions })
            if (response.error) {
                type = 'Error'
                text = response.error.data?.message || 'Failed to update reaction!'
            }
        } catch (error) {
            type = 'Error'
            text = error?.data?.message || 'An error occurred while updating reaction!'
        } finally {
            if (type === 'Error') {
                setTimeout(() => {
                    Alert.alert(type, text)
                }, 1000)
            }
        }
    }

    return (
        <View style={styles.container}>
            {/* Header with Back button */}
            {onBack && <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => onBack('View')}>
                    <Text style={styles.backButtonText}>Back</Text>
                </TouchableOpacity>
            }
            </View>}

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Car Details */}
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{localCar?.name}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Make:</Text>
                    <Text style={styles.value}>{localCar?.make}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Model:</Text>
                    <Text style={styles.value}>{localCar?.model}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Price Per Day:</Text>
                    <Text style={styles.value}>₦{formattedPrice}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Availability:</Text>
                    <Text style={[styles.value, localCar?.availability ? styles.available : styles.unavailable]}>
                        {localCar?.availability ? 'Available' : 'Unavailable'}
                    </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Rating:</Text>
                    <Rating rating={localCar?.rating} size={40} onRatingChange={handleRatingChange} />
                </View>
                <Divider style={styles.divider} />
                <View style={styles.reactionsContainer}>
                    <Text style={styles.label}>Reactions:</Text>
                    <View style={styles.reactionsRow}>
                        <TouchableOpacity onPress={() => handleReactionChange('like')}>
                            <Text style={styles.reaction}>👍 {localCar?.reactions?.like}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReactionChange('dislike')}>
                            <Text style={styles.reaction}>👎 {localCar?.reactions?.dislike}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReactionChange('wow')}>
                            <Text style={styles.reaction}>😮 {localCar?.reactions?.wow}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReactionChange('love')}>
                            <Text style={styles.reaction}>❤️ {localCar?.reactions?.love}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReactionChange('sad')}>
                            <Text style={styles.reaction}>😢 {localCar?.reactions?.sad}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Divider style={styles.divider} />

                {/* Image Gallery */}
                <View style={styles.galleryContainer}>
                    <Text style={styles.galleryTitle}>Gallery</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {localCar?.images.map((img, index) => {
                            const imageUrl = `${BASE_URL}/images/uploads/${img}`
                            return (
                                <TouchableOpacity key={index} onPress={() => handleImagePress(imageUrl)}>
                                    <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>

                {/* Book Car Button */}
                <TouchableOpacity
                    style={[styles.bookButton, !localCar?.availability && styles.bookButtonDisabled]}
                    onPress={() => router.push({
                        pathname: '/(auths)/confirm-rent',
                        params: { id: car?.id }
                    })}
                    disabled={!localCar?.availability}>
                    <Text style={styles.bookButtonText}>Rent Car</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Modal for Fullscreen Image */}
            <Modal visible={modalVisible} transparent animationType="fade">
                <TouchableWithoutFeedback onPress={closeModal}>
                    <View style={styles.modalOverlay}>
                        <Image source={{ uri: selectedImage }} style={styles.fullImage} />
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    )
}

export default Car

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(245,245,245,0.8)',
    },
    header: {
        backgroundColor: 'rgba(0, 122, 255, 0.4)',
        padding: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    backButtonText: {
        color: '#007AFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    contentContainer: {
        padding: 20,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    value: {
        fontSize: 16,
        color: '#555',
        marginLeft: 5,
    },
    available: {
        color: 'green',
    },
    unavailable: {
        color: 'red',
    },
    divider: {
        marginVertical: 5,
        backgroundColor: '#9CA3AF',
        height: 1,
    },
    reactionsContainer: {
        marginVertical: 10,
    },
    reactionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 5,
    },
    reaction: {
        fontSize: 18,
        color: '#555',
        marginHorizontal: 5,
    },
    galleryContainer: {
        marginBottom: 20,
    },
    galleryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    galleryImage: {
        width: 100,
        height: 100,
        borderRadius: 10,
        marginRight: 10,
    },
    bookButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    bookButtonDisabled: {
        backgroundColor: 'gray',
    },
    bookButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.9)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullImage: {
        width: '90%',
        height: '70%',
        resizeMode: 'contain',
    },
})
