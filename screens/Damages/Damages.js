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
import { useRouter } from 'expo-router'

import { useGetDamagesQuery, useDeleteDamageMutation, useUpdateDamageMutation } from '@/apis/damagesApi'
import useAuth from '@/hooks/useAuth'
import { setSpinner } from '@/store/slices/spinnerSlice'

const Damages = ({ changeMode, onSelectDamage, selectedDamage }) => {
    const { user } = useAuth()
    const dispatch = useDispatch()
    const router = useRouter()
    const { data: damages, isLoading } = useGetDamagesQuery('Damages')
    const [searchTerm, setSearchTerm] = useState('')
    const [menuVisible, setMenuVisible] = useState(false)
    const [deleteDamage] = useDeleteDamageMutation()
    const [updateDamage] = useUpdateDamageMutation()

    const newDamages = useMemo(() => Object.values(damages?.entities || {}), [damages])

    const isAdmin = user?.roles.includes('Admin')

    const roleFilteredDamages = useMemo(() => {
        return !isAdmin
            ? newDamages.filter(item => item.customer._id === user?.uid)
            : newDamages
    }, [user, newDamages])

    const sortedDamages = useMemo(() => {
        return [...roleFilteredDamages].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
    }, [roleFilteredDamages])

    const filteredDamages = useMemo(() => {
        if (!searchTerm) return sortedDamages
        const lowerSearch = searchTerm.toLowerCase()
        return sortedDamages.filter(({ status, rent, customer }) => {
            return (
                (status && status.toLowerCase().includes(lowerSearch)) ||
                (rent && rent.bookingcode.toLowerCase().includes(lowerSearch)) ||
                (customer && customer.name.firstname.toLowerCase().includes(lowerSearch)) ||
                (customer && customer.name.surname.toLowerCase().includes(lowerSearch)) ||
                (customer && customer.name.othername.toLowerCase().includes(lowerSearch)) ||
                (customer && customer.gender.toLowerCase().includes(lowerSearch)) ||
                (customer && customer.contact.phone.toLowerCase().includes(lowerSearch))
            )
        })
    }, [sortedDamages, searchTerm])

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending':
                return styles.pending
            case 'Active':
                return styles.reviewed
            case 'Completed':
                return styles.resolved
            default:
                return {}
        }
    }

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

    const handleMenuToggle = (damage) => {
        onSelectDamage(damage)
        setMenuVisible(true)
    }

    const handleMenuClose = () => {
        setMenuVisible(false)
        //onSelectDamage(null)
    }

    const handleView = () => {
        router.push({
            pathname: '/(auths)/damage-details',
            params: { id: selectedDamage?.id }
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
            const response = await deleteDamage({ id: selectedDamage?.id })
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

    const handleUpdateStatus = async (status) => {
        let type = 'Error'
        let text = 'Failed to update record'
        dispatch(setSpinner({ visibility: true }))
        handleMenuClose()
        try {
            const response = await updateDamage({ id: selectedDamage?.id, status: status })
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

    const renderDamageItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Rent:</Text> {item.rent.bookingcode}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Customer:</Text> {`${item.customer.name.firstname} ${item.customer.name.othername} ${item.customer.name.surname}`}
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
            <TextInput
                style={styles.searchInput}
                placeholder='Search Damages...'
                placeholderTextColor='#ccc'
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            {isLoading ? (
                <ActivityIndicator size='large' color='#fff' />
            ) : (
                filteredDamages.length > 0 ? (
                    <FlatList
                        data={filteredDamages}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderDamageItem}
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
                        <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                            <Text style={styles.menuItemText}>Edit</Text>
                        </TouchableOpacity>
                        {isAdmin && (
                            <>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleUpdateStatus('Reviewed')}>
                                    <Text style={styles.menuItemText}>
                                        Mark Review
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.menuItem}
                                    onPress={() => handleUpdateStatus('Resolved')}>
                                    <Text style={styles.menuItemText}>
                                        Mark Resolved
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.menuItem} onPress={confirmDelete}>
                                    <Text style={styles.menuItemText}>Delete</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    )
}

export default Damages

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
