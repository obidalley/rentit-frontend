import React, { useState, useMemo } from 'react'
import {
    View,
    SafeAreaView,
    StyleSheet,
    Text,
    ActivityIndicator,
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
        <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
                <View style={styles.itemDetails}>
                    <Text style={styles.itemText}>
                        <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Name:</Text> {`${item.name?.firstname} ${item.name?.othername} ${item.name?.surname}`}
                    </Text>
                    <Text style={styles.itemText}>
                        <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Date of Birth:</Text> {moment(item.dob).format('DD MMM YYYY')}
                    </Text>
                    <Text style={styles.itemText}>
                        <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Gender:</Text> {item.gender}
                    </Text>
                    <Text style={styles.itemText}>
                        <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Price Per Day:</Text> ₦{formatPrice(item.priceperday)}
                    </Text>
                </View>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Availability:</Text>
                </Text>
                <View
                    style={[
                        styles.availabilityTag,
                        item.availability ? styles.available : styles.unavailable
                    ]}>
                    <Text style={styles.availabilityText}>
                        {item.availability ? 'Available' : 'Unavailable'}
                    </Text>
                </View>
            </View>
            <TouchableOpacity
                style={styles.ellipsisButton}
                onPress={() => handleMenuToggle(item)}>
                <Text style={styles.ellipsisText}>⋮</Text>
            </TouchableOpacity>
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => changeMode('New')}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>
            </View>
            <TextInput
                style={styles.searchInput}
                placeholder='Search Drivers...'
                placeholderTextColor='#ccc'
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            {isLoading ? (
                <ActivityIndicator size='large' color='#fff' />
            ) : (
                filteredDrivers?.length > 0 ? (<FlatList
                    data={filteredDrivers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderDriverItem}
                    contentContainerStyle={styles.listContainer}
                />) : (
                    <View style={styles.msg}>
                        <Text style={{ color: 'white', fontSize: 14, textAlign: 'center' }}>No Record Available</Text>
                    </View>
                )
            )}

            <Modal
                transparent={true}
                animationType='fade'
                visible={menuVisible}
                onRequestClose={handleMenuClose}>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    onPress={handleMenuClose}>
                    <View style={styles.menu}>
                        <TouchableOpacity style={styles.menuItem} onPress={handleView}>
                            <Text style={styles.menuItemText}>View</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                            <Text style={styles.menuItemText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.menuItem} onPress={confirmDelete}>
                            <Text style={styles.menuItemText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleToggleAvailability}>
                            <Text style={styles.menuItemText}>
                                {selectedDriver?.availability ? 'Make Unavailable' : 'Make Available'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    )
}

export default Drivers

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '500',
        color: 'white',
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
    },
    searchInput: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        padding: 10,
        borderRadius: 5,
        color: 'white',
        marginBottom: 10,
    },
    listContainer: {
        paddingBottom: 20,
    },
    msg: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 10,
        borderRadius: 5,
        borderColor: 'white',
        borderWidth: 0.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemContainer: {
        backgroundColor: 'rgba(255,255,255,0.5)',
        padding: 10,
        borderRadius: 5,
        borderColor: 'white',
        borderWidth: 0.5,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemDetails: {
        flex: 1,
    },
    itemText: {
        color: 'black',
        fontSize: 14,
    },
    ellipsisButton: {
        padding: 10,
    },
    ellipsisText: {
        color: 'white',
        fontSize: 24,
    },
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
    availabilityTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 5,
    },
    available: {
        backgroundColor: 'green',
    },
    unavailable: {
        backgroundColor: 'red',
    },
    availabilityText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
})
