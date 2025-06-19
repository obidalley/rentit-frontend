import React, { useState, useEffect } from 'react'
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Linking,
} from 'react-native'
import { Divider } from 'react-native-paper'
import moment from 'moment'

import { useUpdateDriverMutation } from '@/apis/driversApi'

import Rating from '@/components/Rating'

const Driver = ({ driver, onBack }) => {
    const [localDriver, setLocalDriver] = useState(driver)
    const [updateDriver] = useUpdateDriverMutation()

    useEffect(() => {
        setLocalDriver(driver)
    }, [driver])

    const handleCall = () => {
        if (localDriver?.contact?.phone) {
            Linking.openURL(`tel:${localDriver.contact.phone}`);
        }
    }

    const formattedPrice = Number(localDriver?.priceperday).toLocaleString()

    const handleRatingChange = async (newRating) => {
        setLocalDriver((prev) => ({ ...prev, rating: newRating }))
        let type = 'Success'
        let text = 'Rating updated successfully!'
        try {
            const response = await updateDriver({ id: localDriver?.id, rating: newRating })
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
        setLocalDriver((prev) => ({
            ...prev,
            reactions: {
                ...prev.reactions,
                [reactionType]: (prev.reactions?.[reactionType] || 0) + 1,
            },
        }))
        let type = 'Success'
        let text = 'Reaction updated successfully!'
        try {
            const currentCount = localDriver?.reactions?.[reactionType] || 0
            const newCount = currentCount + 1
            const updatedReactions = { ...localDriver.reactions, [reactionType]: newCount }
            const response = await updateDriver({ id: localDriver?.id, reactions: updatedReactions })
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
            </View>}

            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Driver Details */}
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{`${localDriver?.name?.firstname} ${localDriver?.name?.othername} ${localDriver?.name?.surname}`}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Date of Birth:</Text>
                    <Text style={styles.value}>{moment(localDriver.dob).format('DD MMM YYYY')}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Gender:</Text>
                    <Text style={styles.value}>{localDriver?.gender}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Price Per Day:</Text>
                    <Text style={styles.value}>₦{formattedPrice}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>{localDriver?.contact?.phone}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{localDriver?.contact?.address}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Availability:</Text>
                    <Text style={[styles.value, localDriver?.availability ? styles.available : styles.unavailable]}>
                        {localDriver?.availability ? 'Available' : 'Unavailable'}
                    </Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Rating:</Text>
                    <Rating rating={localDriver?.rating} size={40} onRatingChange={handleRatingChange} />
                </View>
                <Divider style={styles.divider} />
                <View style={styles.reactionsContainer}>
                    <Text style={styles.label}>Reactions:</Text>
                    <View style={styles.reactionsRow}>
                        <TouchableOpacity onPress={() => handleReactionChange('like')}>
                            <Text style={styles.reaction}>👍 {localDriver?.reactions?.like}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReactionChange('dislike')}>
                            <Text style={styles.reaction}>👎 {localDriver?.reactions?.dislike}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReactionChange('wow')}>
                            <Text style={styles.reaction}>😮 {localDriver?.reactions?.wow}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReactionChange('love')}>
                            <Text style={styles.reaction}>❤️ {localDriver?.reactions?.love}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleReactionChange('sad')}>
                            <Text style={styles.reaction}>😢 {localDriver?.reactions?.sad}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <Divider style={styles.divider} />
                {/* Separator */}
                <View style={styles.separatorContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>Contact Driver</Text>
                    <View style={styles.line} />
                </View>

                {/* Contact Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                        <Text style={styles.buttonText}>Call</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default Driver

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
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 60,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'black',
    },
    orText: {
        marginHorizontal: 10,
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
        fontStyle: 'italic'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    callButton: {
        backgroundColor: 'green',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
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
