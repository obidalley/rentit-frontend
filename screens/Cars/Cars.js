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

import { useGetCarsQuery, useDeleteCarMutation, useUpdateCarMutation } from '@/apis/carsApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

const Cars = ({ changeMode, onSelectCar, selectedCar }) => {
    const dispatch = useDispatch()
    const { data: cars, isLoading } = useGetCarsQuery('Cars')
    const [searchTerm, setSearchTerm] = useState('')
    const [menuVisible, setMenuVisible] = useState(false)
    const [deleteCar] = useDeleteCarMutation()
    const [updateCar] = useUpdateCarMutation()

    const newCars = useMemo(() => Object.values(cars?.entities || {}), [cars])

    const sortedCars = useMemo(() => {
        return [...newCars].sort((a, b) => {
            const dateA = new Date(a.createdAt)
            const dateB = new Date(b.createdAt)
            return dateB - dateA
        })
    }, [newCars])

    const filteredCars = useMemo(() => {
        if (!searchTerm) return sortedCars
        const lowerSearch = searchTerm.toLowerCase()
        return sortedCars.filter((car) => {
            const { name, make, model, priceperday } = car
            return (
                (name && name.toLowerCase().includes(lowerSearch)) ||
                (make && make.toLowerCase().includes(lowerSearch)) ||
                (model && model.toLowerCase().includes(lowerSearch)) ||
                (priceperday && priceperday.toString().toLowerCase().includes(lowerSearch))
            )
        })
    }, [sortedCars, searchTerm])

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

    const handleMenuToggle = (car) => {
        onSelectCar(car)
        setMenuVisible(true)
    }

    const handleMenuClose = () => {
        setMenuVisible(false)
        //onSelectCar(null)
    }

    const handleView = () => {
        changeMode('Details')
        handleMenuClose()
    }

    const handleEdit = () => {
        //console.log('Edit Car details', selectedCar)
        changeMode('Edit')
        handleMenuClose()
    }

    const handleDelete = async () => {
        let type = 'Error'
        let text = 'Failed to delete record!'
        dispatch(setSpinner({ visibility: true }))
        handleMenuClose()
        try {
            const response = await deleteCar({ id: selectedCar?.id })
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
            const response = await updateCar({ id: selectedCar?.id, availability: !selectedCar?.availability })
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

    const renderCarItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Name:</Text> {item.name}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Make:</Text> {item.make}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Model:</Text> {item.model}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={{ fontWeight: 'bold', fontStyle: 'italic' }}>Price Per Day:</Text> ₦{formatPrice(item.priceperday)}
                </Text>
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
                placeholder='Search Cars...'
                placeholderTextColor='#ccc'
                value={searchTerm}
                onChangeText={setSearchTerm}
            />
            {isLoading ? (
                <ActivityIndicator size='large' color='#fff' />
            ) : (
                filteredCars.length > 0 ? (
                    <FlatList
                        data={filteredCars}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderCarItem}
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
                        <TouchableOpacity style={styles.menuItem} onPress={confirmDelete}>
                            <Text style={styles.menuItemText}>Delete</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={handleToggleAvailability}>
                            <Text style={styles.menuItemText}>
                                {selectedCar?.availability ? 'Make Unavailable' : 'Make Available'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    )
}

export default Cars

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
