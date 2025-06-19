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
} from 'react-native'
import { Divider } from 'react-native-paper'
import moment from 'moment'

import { BASE_URL } from '@/constants'
import useAuth from '@/hooks/useAuth'

const Damage = ({ damage }) => {
    const [selectedImage, setSelectedImage] = useState(null)
    const [modalVisible, setModalVisible] = useState(false)
    const [localDamage, setLocalDamage] = useState(damage)
    const { user } = useAuth()

    useEffect(() => {
        setLocalDamage(damage)
    }, [damage])

    const handleImagePress = (imgUrl) => {
        setSelectedImage(imgUrl)
        setModalVisible(true)
    }

    const closeModal = () => {
        setModalVisible(false)
        setSelectedImage(null)
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending':
                return styles.pending
            case 'Reviewed':
                return styles.reviewed
            case 'Resolved':
                return styles.resolved
            default:
                return styles.pending
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Damage Details */}
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Description:</Text>
                    <Text style={[styles.value, { paddingHorizontal: 5 }]}>{localDamage?.description}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Status: </Text>
                    <View style={[styles.statusTag, getStatusStyle(damage.status)]}><Text style={styles.statusText}>{damage?.status}</Text></View>
                </View>
                <Divider style={styles.divider} />


                {/* Rent details section */}
                <View style={styles.separatorContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>Rent Details</Text>
                    <View style={styles.line} />
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Booking Code:</Text>
                    <Text style={styles.value}>{damage?.rent?.bookingcode}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Rented on:</Text>
                    <Text style={styles.value}>{moment(damage.rent.startdate).format('DD MMM YYYY')}</Text>
                </View>
                <Divider style={styles.divider} />

                {/* Customer details section */}
                {user?.roles.includes('Admin') && (
                    <>
                        <View style={styles.separatorContainer}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>Customer's Details</Text>
                            <View style={styles.line} />
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Name:</Text>
                            <Text style={styles.value}>{`${damage?.customer?.name.firstname} ${damage?.customer?.name.othername} ${damage?.customer?.name.surname}`}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Gender:</Text>
                            <Text style={styles.value}>{damage?.customer?.gender}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Phone:</Text>
                            <Text style={styles.value}>{damage?.customer?.contact?.phone}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.callButton} onPress={() => handleCall(damage?.customer?.contact?.phone)}>
                                <Text style={styles.buttonText}>Call</Text>
                            </TouchableOpacity>
                        </View>
                        <Divider style={styles.divider} />
                    </>
                )}

                {/* Image Gallery */}
                <View style={styles.galleryContainer}>
                    <Text style={styles.galleryTitle}>Image Gallery</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {localDamage?.images.map((img, index) => {
                            const imageUrl = `${BASE_URL}/images/uploads/${img}`
                            return (
                                <TouchableOpacity key={index} onPress={() => handleImagePress(imageUrl)}>
                                    <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
                                </TouchableOpacity>
                            )
                        })}
                    </ScrollView>
                </View>
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

export default Damage

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
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'black',
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
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
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        width: '100%',
        marginVertical: 5,
    },
    emailButton: {
        backgroundColor: 'blue',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '40%',
    },
    buttonText: {
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
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    pending: {
        backgroundColor: 'orange',
    },
    reviewed: {
        backgroundColor: 'green',
    },
    resolved: {
        backgroundColor: 'blue',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
})
