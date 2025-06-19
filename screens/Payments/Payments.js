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
import moment from 'moment'

import { images } from '@/constants'
import { useDeletePaymentMutation } from '@/apis/paymentsApi'
import { useGetRentsQuery } from '@/apis/rentApi'
import useAuth from '@/hooks/useAuth'
import { setSpinner } from '@/store/slices/spinnerSlice'

const Payments = () => {
    const [selectedRent, setSelectedRent] = useState(null)
    const { user } = useAuth()
    const dispatch = useDispatch()
    const [searchTerm, setSearchTerm] = useState('')
    const [menuVisible, setMenuVisible] = useState(false)

    const { data: rentsData, isLoading } = useGetRentsQuery('Rents')
    const [deletePayment] = useDeletePaymentMutation()

    const newRents = useMemo(
        () => Object.values(rentsData?.entities || {}),
        [rentsData]
    )

    const isAdmin = user?.roles.includes('Admin')

    const roleFilteredRents = useMemo(() => {
        return !isAdmin
            ? newRents.filter(item => item.customer._id === user?.uid)
            : newRents
    }, [user, newRents])

    const sortedRents = useMemo(() => {
        return [...roleFilteredRents].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
    }, [roleFilteredRents])

    const filteredRents = useMemo(() => {
        if (!searchTerm) return sortedRents
        const lowerSearch = searchTerm.toLowerCase()
        return sortedRents.filter(({ payment }) => {
            return (
                (payment && payment.amount.toLowerCase().includes(lowerSearch)) ||
                (payment && payment.status.toLowerCase().includes(lowerSearch)) ||
                (payment && payment.transactionid.toLowerCase().includes(lowerSearch)) ||
                (payment && payment.rentmethod.toLowerCase().includes(lowerSearch))
            )
        })
    }, [sortedRents, searchTerm])

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

    const handleMenuToggle = (rent) => {
        setSelectedRent(rent)
        setMenuVisible(true)
    }

    const handleMenuClose = () => {
        setMenuVisible(false)
        //setSelectedRent(null)
    }

    const handleDelete = async () => {
        let type = 'Error'
        let text = 'Failed to delete record!'
        dispatch(setSpinner({ visibility: true }))
        handleMenuClose()
        try {
            const response = await deletePayment({ id: selectedRent?.payment?.id })
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

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending':
                return styles.pending
            case 'Successful':
                return styles.successful
            case 'Failed':
                return styles.failed
            default:
                return {}
        }
    }

    const renderPaymentItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Booking Code:</Text> {item.bookingcode}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Payment Date:</Text> {moment(item.startdate).format('DD MMM YYYY')}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Amount:</Text>₦{formatPrice(item.payment?.amount)}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Transaction ID:</Text> {item.payment?.transactionid}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Payment Method:</Text> {item.payment?.paymentmethod}
                </Text>
                <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
                    <Text style={styles.itemText}>
                        <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Status:</Text>
                    </Text>
                    <View style={[styles.statusTag, getStatusStyle(item.payment.status)]}>
                        <Text style={styles.statusText}>
                            {item.payment.status}
                        </Text>
                    </View>
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={images.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Search Payments...'
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
                                renderItem={renderPaymentItem}
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

export default Payments

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
    successful: {
        backgroundColor: 'green',
    },
    failed: {
        backgroundColor: 'red',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
})
