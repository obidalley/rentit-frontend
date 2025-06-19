import React, { useState, useMemo } from 'react'
import {
    StyleSheet,
    ImageBackground,
    View,
    SafeAreaView,
    Text,
    ActivityIndicator,
    FlatList,
    TextInput,
    TouchableOpacity,
    Modal,
    Alert
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'
import { useRouter } from 'expo-router'
import moment from 'moment'

import { images } from '@/constants'
import { useGetRentsQuery, useDeleteRentMutation, useUpdateRentMutation } from '@/apis/rentApi'
import useAuth from '@/hooks/useAuth'
import { setSpinner } from '@/store/slices/spinnerSlice'

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
        <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Booking Code:</Text> {item.bookingcode}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Rent Date:</Text> {moment(item.startdate).format('DD MMM YYYY')}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Ends On:</Text> {moment(item.enddate).format('DD MMM YYYY')}
                </Text>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                    <Text style={styles.itemText}>
                        <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Status:</Text>
                    </Text>
                    <View style={[styles.statusTag, getStatusStyle(item.status)]}>
                        <Text style={styles.statusText}>
                            {item.status}
                        </Text>
                    </View>
                </View>
                {!isAdmin && <View style={styles.itemText}>
                    <TouchableOpacity
                        style={styles.addButton}
                        onPress={() => router.push({
                            pathname: '/(auths)/new-damage',
                            params: { rent: item?.id }
                        })}>
                        <Text style={styles.addButtonText}>Report Damage</Text>
                    </TouchableOpacity>
                </View>}
            </View>
            <TouchableOpacity
                style={styles.ellipsisButton}
                onPress={() => handleMenuToggle(item)}>
                <Text style={styles.ellipsisText}>⋮</Text>
            </TouchableOpacity>
        </View>
    )

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={images.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Search Rents...'
                        placeholderTextColor='#ccc'
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {isLoading ? (
                        <ActivityIndicator size='large' color='blue' />
                    ) : (
                        filteredRents.length > 0 ? (
                            <FlatList
                                data={filteredRents}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderRentItem}
                                contentContainerStyle={styles.listContainer}
                            />
                        ) : (
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
                                {user?.roles.includes('Admin') &&
                                    (
                                        <>
                                            <TouchableOpacity
                                                style={styles.menuItem}
                                                onPress={() => handleUdpateStatus('Active')}>
                                                <Text style={styles.menuItemText}>
                                                    Mark Active
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.menuItem}
                                                onPress={() => handleUdpateStatus('Completed')}>
                                                <Text style={styles.menuItemText}>
                                                    Mark Completed
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.menuItem}
                                                onPress={() => handleUdpateStatus('Cancelled')}>
                                                <Text style={styles.menuItemText}>
                                                    Cancel
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.menuItem} onPress={confirmDelete}>
                                                <Text style={styles.menuItemText}>Delete</Text>
                                            </TouchableOpacity>
                                        </>

                                    )
                                }
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default Rents

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
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
        backgroundColor: 'rgba(255, 0, 0, 0.7)',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 5,
        marginVertical: 4
    },
    addButtonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center'
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
    itemText: {
        color: 'black',
        fontSize: 14,
        marginVertical: 5
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
