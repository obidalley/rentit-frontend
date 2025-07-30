import React, { useState, useEffect } from 'react'
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
    StyleSheet,
    Linking
} from 'react-native'
import moment from 'moment'

import { BASE_URL, COLORS } from '@/constants'
import useAuth from '@/hooks/useAuth'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import StatusBadge from '@/components/ui/StatusBadge'
import ModernButton from '@/components/ui/Buttons/ModernButton'

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

    const handleCall = (phone) => {
        if (phone) {
            Linking.openURL(`tel:${phone}`)
        }
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
        <GradientBackground colors={COLORS.background.light}>
            <View style={styles.container}>
                <ScrollView 
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Damage Details Card */}
                    <ModernCard style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Damage Report</Text>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Status</Text>
                            <StatusBadge status={damage?.status} size="small" />
                        </View>
                        
                        <View style={styles.descriptionContainer}>
                            <Text style={styles.label}>Description</Text>
                            <Text style={styles.description}>{localDamage?.description}</Text>
                        </View>
                    </ModernCard>

                    {/* Rental Details Card */}
                    <ModernCard style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Rental Information</Text>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Booking Code</Text>
                            <Text style={styles.value}>{damage?.rent?.bookingcode}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Rental Date</Text>
                            <Text style={styles.value}>{moment(damage?.rent?.startdate).format('DD MMM YYYY')}</Text>
                        </View>
                    </ModernCard>

                    {/* Customer Details Card (Admin Only) */}
                    {user?.roles.includes('Admin') && (
                        <ModernCard style={styles.detailsCard}>
                            <Text style={styles.sectionTitle}>Customer Information</Text>
                            
                            <View style={styles.detailsRow}>
                                <Text style={styles.label}>Customer Name</Text>
                                <Text style={styles.value}>
                                    {`${damage?.customer?.name.firstname} ${damage?.customer?.name.othername} ${damage?.customer?.name.surname}`}
                                </Text>
                            </View>
                            
                            <View style={styles.detailsRow}>
                                <Text style={styles.label}>Gender</Text>
                                <Text style={styles.value}>{damage?.customer?.gender}</Text>
                            </View>
                            
                            <View style={styles.detailsRow}>
                                <Text style={styles.label}>Phone Number</Text>
                                <Text style={styles.value}>{damage?.customer?.contact?.phone}</Text>
                            </View>
                            
                            <View style={styles.actionContainer}>
                                <ModernButton
                                    title="Call Customer"
                                    onPress={() => handleCall(damage?.customer?.contact?.phone)}
                                    variant="success"
                                    size="medium"
                                />
                            </View>
                        </ModernCard>
                    )}

                    {/* Image Gallery Card */}
                    <ModernCard style={styles.galleryCard}>
                        <Text style={styles.sectionTitle}>Damage Photos</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            <View style={styles.galleryContainer}>
                                {localDamage?.images.map((img, index) => {
                                    const imageUrl = `${BASE_URL}/images/uploads/${img}`
                                    return (
                                        <TouchableOpacity key={index} onPress={() => handleImagePress(imageUrl)}>
                                            <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
                                        </TouchableOpacity>
                                    )
                                })}
                            </View>
                        </ScrollView>
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

export default Damage

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    detailsCard: {
        marginBottom: 16,
    },
    galleryCard: {
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
    descriptionContainer: {
        paddingVertical: 12,
    },
    description: {
        fontSize: 16,
        color: COLORS.neutral.dark,
        lineHeight: 24,
        marginTop: 8,
    },
    actionContainer: {
        alignItems: 'center',
        marginTop: 16,
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
    galleryContainer: {
        flexDirection: 'row',
        gap: 12,
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
})
