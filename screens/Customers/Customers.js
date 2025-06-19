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
import { useGetCustomersQuery, useDeleteCustomerMutation } from '@/apis/customersApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

const Custormers = () => {
    const [selectedCustomer, setSelectedCustomer] = useState(null)
    const dispatch = useDispatch()
    const router = useRouter()
    const { data: customers, isLoading } = useGetCustomersQuery('Customers')
    const [searchTerm, setSearchTerm] = useState('')
    const [menuVisible, setMenuVisible] = useState(false)
    const [deleteCustomer] = useDeleteCustomerMutation()

    const newCustomers = useMemo(() => Object.values(customers?.entities || {}), [customers])

    const sortedCustomers = useMemo(() => {
        return [...newCustomers].sort((a, b) => {
            const dateA = new Date(a.createdAt)
            const dateB = new Date(b.createdAt)
            return dateB - dateA
        })
    }, [newCustomers])

    const filteredCustomers = useMemo(() => {
        if (!searchTerm) return sortedCustomers
        const lowerSearch = searchTerm.toLowerCase()
        return sortedCustomers.filter((customer) => {
            const { name, gender, contact } = customer
            return (
                (name && name.firstname.toLowerCase().includes(lowerSearch)) ||
                (name && name.surname.toLowerCase().includes(lowerSearch)) ||
                (name && name.othername.toLowerCase().includes(lowerSearch)) ||
                (contact && contact.phone.toLowerCase().includes(lowerSearch)) ||
                (gender && gender.toLowerCase().includes(lowerSearch))
            )
        })
    }, [sortedCustomers, searchTerm])

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

    const handleMenuToggle = (customer) => {
        setSelectedCustomer(customer)
        setMenuVisible(true)
    }

    const handleMenuClose = () => {
        setMenuVisible(false)
        setSelectedCustomer(null)
    }

    const handleView = () => {
        router.push({
            pathname: '/(auths)/customer-details',
            params: { id: selectedCustomer?.id }
        })
        handleMenuClose()
    }

    const handleDelete = async () => {
        let type = 'Error'
        let text = 'Failed to delete record!'
        dispatch(setSpinner({ visibility: true }))
        handleMenuClose()
        try {
            const response = await deleteCustomer({ id: selectedCustomer?.id })
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

    const renderCustomerItem = ({ item }) => (
        <View style={styles.itemContainer}>
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
                        placeholder='Search Customers...'
                        placeholderTextColor='#ccc'
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                    {isLoading ? (
                        <ActivityIndicator size='large' color='blue' />
                    ) : (
                        filteredCustomers.length > 0 ? (
                            <FlatList
                                data={filteredCustomers}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderCustomerItem}
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
                                <TouchableOpacity style={styles.menuItem} onPress={confirmDelete}>
                                    <Text style={styles.menuItemText}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </Modal>
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default Custormers

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
