import React, { useState, useMemo } from 'react'
import {
    View,
    StyleSheet,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert
} from 'react-native'
import { useDispatch } from 'react-redux'
import moment from 'moment'
import { useRouter } from 'expo-router'

import { useGetDriversQuery, useDeleteDriverMutation, useUpdateDriverMutation } from '@/apis/driversApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import { COLORS } from '@/constants'
import ModernCard from '@/components/ui/ModernCard'
import ModernButton from '@/components/ui/Buttons/ModernButton'
import StatusBadge from '@/components/ui/StatusBadge'
import ActivityIndicator from '@/components/ActivityIndicator'

const Drivers = ({ changeMode, onSelectDriver, selectedDriver }) => {
    const dispatch = useDispatch()
    const router = useRouter()
    const { data: drivers, isLoading } = useGetDriversQuery('Drivers')
    const [searchTerm, setSearchTerm] = useState('')
    const [menuVisible, setMenuVisible] = useState(false)
    const [deleteDriver] = useDeleteDriverMutation()
    const [updateDriver] = useUpdateDriverMutation()

    const newDrivers = useMemo(() => Object.values(drivers?.entities || {}), [drivers])

    const sortedDrivers = useMemo(() => {
        return [...newDrivers].sort((a, b) => {
            const dateA = new Date(a.createdAt)
            const dateB = new Date(b.createdAt)
            return dateB - dateA
        })
    }, [newDrivers])

    const filteredDrivers = useMemo(() => {
        if (!searchTerm) return sortedDrivers
        const lowerSearch = searchTerm.toLowerCase()
        return sortedDrivers.filter((driver) => {
            const { name, gender, contact } = driver
            return (
                (name && name.firstname.toLowerCase().includes(lowerSearch)) ||
                (name && name.surname.toLowerCase().includes(lowerSearch)) ||
                (name && name.othername.toLowerCase().includes(lowerSearch)) ||
                (contact && contact.phone.toLowerCase().includes(lowerSearch)) ||
                (gender && gender.toLowerCase().includes(lowerSearch))
            )
        })
    }, [sortedDrivers, searchTerm])

    const formatPrice = pricePerDay => Number(pricePerDay).toLocaleString()

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

    const handleMenuToggle = (driver) => {
        onSelectDriver(driver)
        setMenuVisible(true)
    }

    const handleMenuClose = () => {
        setMenuVisible(false)
        //onSelectDriver(null)
    }

    const handleView = () => {
        router.push({
            pathname: '/(auths)/driver-details',
            params: { id: selectedDriver?.id }
        })
        handleMenuClose()
    }

    const handleEdit = () => {
        changeMode('Edit')
        handleMenuClose()
    }

    const handleDelete = async () => {
        let type = 'Error'
        let text = 'Failed to delete record!'
        dispatch(setSpinner({ visibility: true }))
        handleMenuClose()
        try {
            const response = await deleteDriver({ id: selectedDriver?.id })
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

    const handleToggleAvailability = async () => {
        let type = 'Error'
        let text = 'Failed to update record'
        dispatch(setSpinner({ visibility: true }))
        handleMenuClose()
        try {
            const response = await updateDriver({ id: selectedDriver?.id, availability: !selectedDriver?.availability })
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

    const renderDriverItem = ({ item }) => (
        <ModernCard style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <Text style={styles.driverName}>
                    {`${item.name?.firstname} ${item.name?.othername} ${item.name?.surname}`}
                </Text>
                <StatusBadge 
                    status={item.availability ? 'Available' : 'Unavailable'} 
                    size="small" 
                />
            </View>
            
            <View style={styles.itemDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Date of Birth</Text>
                    <Text style={styles.value}>{moment(item.dob).format('DD MMM YYYY')}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Gender</Text>
                    <Text style={styles.value}>{item.gender}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Price Per Day</Text>
                    <Text style={styles.priceValue}>₦{formatPrice(item.priceperday)}</Text>
                </View>
            </View>
            
            <TouchableOpacity
                style={styles.ellipsisButton}
                onPress={() => handleMenuToggle(item)}>
                <Text style={styles.ellipsisText}>•••</Text>
            </TouchableOpacity>
        </ModernCard>
    )

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <ModernButton
                    title="Add Driver"
                    onPress={() => changeMode('New')}
                    variant="primary"
                    size="medium"
                />
            </View>
            
            <ModernCard style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder='Search Drivers...'
                    placeholderTextColor={COLORS.neutral.medium}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </ModernCard>
            
            <View style={styles.contentContainer}>
                <ActivityIndicator visible={isLoading} />
                {filteredDrivers?.length > 0 ? (
                    <FlatList
                        data={filteredDrivers}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderDriverItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <ModernCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No Drivers Available</Text>
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
                        <ModernButton
                            title="Edit"
                            onPress={handleEdit}
                            variant="secondary"
                            size="medium"
                        />
                        <ModernButton
                            title={selectedDriver?.availability ? 'Make Unavailable' : 'Make Available'}
                            onPress={handleToggleAvailability}
                            variant="accent"
                            size="medium"
                        />
                        <ModernButton
                            title="Delete"
                            onPress={confirmDelete}
                            variant="danger"
                            size="medium"
                        />
                    </ModernCard>
                </TouchableOpacity>
            </Modal>
        </View>
    )
}

export default Drivers

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 16,
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
    driverName: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.neutral.dark,
    },
    itemDetails: {
        marginBottom: 8,
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
    priceValue: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.primary.solid,
        flex: 2,
        textAlign: 'right',
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
