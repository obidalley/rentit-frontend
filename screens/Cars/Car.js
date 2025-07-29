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
import { useRouter } from 'expo-router'

import { BASE_URL, COLORS } from '@/constants'
import { useUpdateCarMutation } from '@/apis/carsApi'

import Rating from '@/components/Rating'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import ModernButton from '@/components/ui/Buttons/ModernButton'
import StatusBadge from '@/components/ui/StatusBadge'

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
        <GradientBackground colors={COLORS.background.light}>
            <View style={styles.container}>
                {/* Header with Back button */}
                {onBack && (
                    <ModernCard style={styles.headerCard}>
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Car Details</Text>
                            <ModernButton
                                title="Back"
                                onPress={() => onBack('View')}
                                variant="outline"
                                size="small"
                            />
                        </View>
                    </ModernCard>
                )}

                <ScrollView 
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Car Details Card */}
                    <ModernCard style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Vehicle Information</Text>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Name</Text>
                            <Text style={styles.value}>{localCar?.name}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Make</Text>
                            <Text style={styles.value}>{localCar?.make}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Model</Text>
                            <Text style={styles.value}>{localCar?.model}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Price Per Day</Text>
                            <Text style={styles.priceValue}>₦{formattedPrice}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Availability</Text>
                            <StatusBadge 
                                status={localCar?.availability ? 'Available' : 'Unavailable'} 
                                size="small"
                            />
                        </View>
                    </ModernCard>

                    {/* Rating Card */}
                    <ModernCard style={styles.ratingCard}>
                        <Text style={styles.sectionTitle}>Rating & Reviews</Text>
                        <View style={styles.ratingContainer}>
                            <Text style={styles.label}>Your Rating</Text>
                            <Rating rating={localCar?.rating} size={40} onRatingChange={handleRatingChange} />
                        </View>
                        
                        <View style={styles.reactionsContainer}>
                            <Text style={styles.label}>Reactions</Text>
                            <View style={styles.reactionsRow}>
                                <TouchableOpacity 
                                    style={styles.reactionButton}
                                    onPress={() => handleReactionChange('like')}
                                >
                                    <Text style={styles.reaction}>👍</Text>
                                    <Text style={styles.reactionCount}>{localCar?.reactions?.like || 0}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.reactionButton}
                                    onPress={() => handleReactionChange('dislike')}
                                >
                                    <Text style={styles.reaction}>👎</Text>
                                    <Text style={styles.reactionCount}>{localCar?.reactions?.dislike || 0}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.reactionButton}
                                    onPress={() => handleReactionChange('wow')}
                                >
                                    <Text style={styles.reaction}>😮</Text>
                                    <Text style={styles.reactionCount}>{localCar?.reactions?.wow || 0}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.reactionButton}
                                    onPress={() => handleReactionChange('love')}
                                >
                                    <Text style={styles.reaction}>❤️</Text>
                                    <Text style={styles.reactionCount}>{localCar?.reactions?.love || 0}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={styles.reactionButton}
                                    onPress={() => handleReactionChange('sad')}
                                >
                                    <Text style={styles.reaction}>😢</Text>
                                    <Text style={styles.reactionCount}>{localCar?.reactions?.sad || 0}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ModernCard>

                    {/* Image Gallery Card */}
                    <ModernCard style={styles.galleryCard}>
                        <Text style={styles.sectionTitle}>Photo Gallery</Text>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.galleryContent}
                        >
                            {localCar?.images?.map((img, index) => {
                                const imageUrl = `${BASE_URL}/images/uploads/${img}`
                                return (
                                    <TouchableOpacity 
                                        key={index} 
                                        onPress={() => handleImagePress(imageUrl)}
                                        style={styles.galleryImageContainer}
                                    >
                                        <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
                                    </TouchableOpacity>
                                )
                            })}
                        </ScrollView>
                    </ModernCard>

                    {/* Rent Button */}
                    <ModernCard style={styles.actionCard}>
                        <ModernButton
                            title="Rent This Car"
                            onPress={() => router.push({
                                pathname: '/(auths)/confirm-rent',
                                params: { id: car?.id }
                            })}
                            disabled={!localCar?.availability}
                            variant={localCar?.availability ? 'primary' : 'outline'}
                            size="large"
                        />
                        {!localCar?.availability && (
                            <Text style={styles.unavailableText}>
                                This vehicle is currently unavailable
                            </Text>
                        )}
                    </ModernCard>
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
        </GradientBackground>
    )
}

export default Car

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    headerCard: {
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.neutral.dark,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    detailsCard: {
        marginBottom: 16,
    },
    ratingCard: {
        marginBottom: 16,
    },
    galleryCard: {
        marginBottom: 16,
    },
    actionCard: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.neutral.dark,
        marginBottom: 16,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral.light,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral.medium,
        flex: 1,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.neutral.dark,
        flex: 2,
        textAlign: 'right',
    },
    priceValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary.solid,
        flex: 2,
        textAlign: 'right',
    },
    ratingContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral.light,
        marginBottom: 16,
    },
    reactionsContainer: {
        marginTop: 8,
    },
    reactionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 12,
    },
    reactionButton: {
        alignItems: 'center',
        padding: 8,
        borderRadius: 12,
        backgroundColor: COLORS.neutral.light,
        minWidth: 50,
    },
    reaction: {
        fontSize: 24,
        marginBottom: 4,
    },
    reactionCount: {
        fontSize: 12,
        fontWeight: '600',
        color: COLORS.neutral.dark,
    },
    galleryContent: {
        paddingRight: 16,
    },
    galleryImageContainer: {
        marginRight: 12,
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    galleryImage: {
        width: 120,
        height: 120,
        borderRadius: 12,
    },
    unavailableText: {
        textAlign: 'center',
        marginTop: 12,
        fontSize: 14,
        color: COLORS.neutral.medium,
        fontStyle: 'italic',
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