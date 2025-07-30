import React, { useState, useMemo } from 'react'
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert,
    StyleSheet
} from 'react-native'
import { useDispatch } from 'react-redux'
import { useRouter } from 'expo-router'
import moment from 'moment'

import { COLORS } from '@/constants'
import { useGetRentsQuery, useDeleteRentMutation, useUpdateRentMutation } from '@/apis/rentApi'
import useAuth from '@/hooks/useAuth'
import { setSpinner } from '@/store/slices/spinnerSlice'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import StatusBadge from '@/components/ui/StatusBadge'
import ModernButton from '@/components/ui/Buttons/ModernButton'
import ActivityIndicator from '@/components/ActivityIndicator'

const Rents = () => {
    const [selectedRent, setSelectedRent] = useState(null)
    const { user } = useAuth()
    const dispatch = useDispatch()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [menuVisible, setMenuVisible] = useState(false)

    const { data: rentsData, isLoading } = useGetRentsQuery('Rents')
    const [deleteRent] = useDeleteRentMutation()
    const [updateRent] = useUpdateRentMutation()

    const newRents = useMemo(
        () => Object.values(rentsData?.entities || {}),
        [rentsData]
    );

    const isAdmin = user?.roles.includes('Admin')

    const roleFilteredRents = useMemo(() => {
        return !isAdmin
            ? newRents.filter(item => item.customer._id === user?.uid)
            : newRents;
    }, [user, newRents]);

    const sortedRents = useMemo(() => {
        return [...roleFilteredRents].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }, [roleFilteredRents]);

    const filteredRents = useMemo(() => {
        if (!searchTerm) return sortedRents;
        const lowerSearch = searchTerm.toLowerCase();
        return sortedRents.filter(({ bookingcode, status, car }) => {
            return (
                (bookingcode && bookingcode.toLowerCase().includes(lowerSearch)) ||
                (status && status.toLowerCase().includes(lowerSearch)) ||
                (car.name && car.name.toLowerCase().includes(lowerSearch)) ||
                (car.model && car.model.toLowerCase().includes(lowerSearch)) ||
                (car.make && car.make.toLowerCase().includes(lowerSearch))
            );
        });
    }, [sortedRents, searchTerm]);


    const confirmDelete = () => {
        Alert.alert(
            'Confirm Delete',
            'Are you sure you want to delete this record?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes', onPress: () => {
                        handleDelete()
                    }
                },
            ]
        )
    }

    const handleMenuToggle = (rent) => {
        setSelectedRent(rent)
        setMenuVisible(true)
    }

    const handleMenuClose = () => {
        setMenuVisible(false)
        //setSelectedRent(null)
    }

    const handleView = () => {
        router.push({
            pathname: '/(auths)/rent-details',
            params: { id: selectedRent?.id }
        })
        handleMenuClose()
    }

    const handleDelete = async () => {
        let type = 'Error'
        let text = 'Failed to delete record!'
        dispatch(setSpinner({ visibility: true }))
        handleMenuClose()
        try {
            const response = await deleteRent({ id: selectedRent?.id })
            if (!response.error) {
                const { status, message } = response.data
                if (status === 'SUCCESS') {
                    type = 'Success'
                    text = 'Record has been deleted successfully!'
                } else {
                    text = message || 'Failed to delete record!'
                }
            } else {
                text = response.error.data?.message || 'Failed to delete record!'
            }
        } catch (error) {
            text = `An error occured while deleting record: ${error?.message}`
        } finally {
            setTimeout(() => {
                dispatch(setSpinner({ visibility: false }))
                Alert.alert(type, text)
            }, 1000)
        }
    }

    const handleUdpateStatus = async (status) => {
        let type = 'Error'
        let text = 'Failed to update record'
        dispatch(setSpinner({ visibility: true }))
        handleMenuClose()
        try {
            const response = await updateRent({ id: selectedRent?.id, status: status })
            if (!response.error) {
                const { status, message } = response.data
                if (status === 'SUCCESS') {
                    type = 'Success'
                    text = 'Status has been updated successfully!'
                } else {
                    text = message || 'Failed to update record!'
                }
            } else {
                text = response.error.data?.message || 'Failed to update record!'
            }
        } catch (error) {
            text = error?.data?.message || 'An error occured while updating record!'
        } finally {
            setTimeout(() => {
                dispatch(setSpinner({ visibility: false }))
                Alert.alert(type, text)
            }, 1000)
        }
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending':
                return styles.pending
            case 'Active':
                return styles.active
            case 'Completed':
                return styles.completed
            case 'Cancelled':
                return styles.cancelled
            default:
                return {}
        }
    }

    const renderRentItem = ({ item }) => (
        <ModernCard style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <Text style={styles.bookingCode}>{item.bookingcode}</Text>
                <StatusBadge status={item.status} size="small" />
            </View>
            
            <View style={styles.itemDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Start Date</Text>
                    <Text style={styles.value}>{moment(item.startdate).format('DD MMM YYYY')}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>End Date</Text>
                    <Text style={styles.value}>{moment(item.enddate).format('DD MMM YYYY')}</Text>
                </View>
            </View>
            
            <View style={styles.itemActions}>
                {!isAdmin && (
                    <ModernButton
                        title="Report Damage"
                        onPress={() => router.push({
                            pathname: '/(auths)/new-damage',
                            params: { rent: item?.id }
                        })}
                        variant="warning"
                        size="small"
                    />
                )}
            </View>
            
            <TouchableOpacity
                style={styles.ellipsisButton}
                onPress={() => handleMenuToggle(item)}>
                <Text style={styles.ellipsisText}>•••</Text>
            </TouchableOpacity>
        </ModernCard>
    )

    return (
        <GradientBackground colors={COLORS.background.light}>
            <View style={styles.container}>
                <ModernCard style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Search Rents...'
                        placeholderTextColor={COLORS.neutral.medium}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </ModernCard>
                
                <View style={styles.contentContainer}>
                    <ActivityIndicator visible={isLoading} />
                    {filteredRents.length > 0 ? (
                        <FlatList
                            data={filteredRents}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderRentItem}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <ModernCard style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No Rentals Available</Text>
                        </ModernCard>
                    )}
                </View>

                <Modal
                    transparent={true}
                    animationType='fade'
                    visible={menuVisible}
                    onRequestClose={handleMenuClose}>
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        onPress={handleMenuClose}>
                        <ModernCard style={styles.menu}>
                            <ModernButton
                                title="View Details"
                                onPress={handleView}
                                variant="primary"
                                size="medium"
                            />
                            {user?.roles.includes('Admin') && (
                                <>
                                    <ModernButton
                                        title="Mark Active"
                                        onPress={() => handleUdpateStatus('Active')}
                                        variant="success"
                                        size="medium"
                                    />
                                    <ModernButton
                                        title="Mark Completed"
                                        onPress={() => handleUdpateStatus('Completed')}
                                        variant="accent"
                                        size="medium"
                                    />
                                    <ModernButton
                                        title="Cancel Rental"
                                        onPress={() => handleUdpateStatus('Cancelled')}
                                        variant="warning"
                                        size="medium"
                                    />
                                    <ModernButton
                                        title="Delete"
                                        onPress={confirmDelete}
                                        variant="danger"
                                        size="medium"
                                    />
                                </>
                            )}
                        </ModernCard>
                    </TouchableOpacity>
                </Modal>
            </View>
        </GradientBackground>
    )
}

export default Rents

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    searchContainer: {
        marginBottom: 16,
        padding: 0,
    },
    searchInput: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.neutral.dark,
    },
    contentContainer: {
        flex: 1,
    },
    listContainer: {
        paddingBottom: 20,
    },
    emptyCard: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.neutral.medium,
        fontSize: 16,
        fontWeight: '500',
    },
    itemContainer: {
        marginBottom: 12,
        position: 'relative',
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    bookingCode: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.neutral.dark,
    },
    itemDetails: {
        marginBottom: 12,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 4,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.neutral.medium,
        flex: 1,
    },
    value: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.neutral.dark,
        flex: 2,
        textAlign: 'right',
    },
    itemActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    ellipsisButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        padding: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    ellipsisText: {
        color: COLORS.neutral.dark,
        fontSize: 16,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    menu: {
        width: '80%',
        maxWidth: 300,
        gap: 8,
    },
})

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menu: {
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 10,
        width: 200,
    },
    menuItem: {
        paddingVertical: 10,
    },
    menuItemText: {
        fontSize: 16,
        color: 'black',
    },
    statusTag: {
        display: 'flex',
        flexDirection: 'row',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    pending: {
        backgroundColor: 'orange',
    },
    active: {
        backgroundColor: 'green',
    },
    completed: {
        backgroundColor: 'blue',
    },
    cancelled: {
        backgroundColor: 'red',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
})
