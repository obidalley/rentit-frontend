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
import { COLORS } from '@/constants'
import ModernCard from '@/components/ui/ModernCard'
import StatusBadge from '@/components/ui/StatusBadge'
import ModernButton from '@/components/ui/Buttons/ModernButton'

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
        <ModernCard style={styles.itemContainer}>
            <View style={styles.itemDetails}>
                <Text style={styles.itemText}>
                    <Text style={styles.itemLabel}>Name:</Text> {item.name}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={styles.itemLabel}>Make:</Text> {item.make}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={styles.itemLabel}>Model:</Text> {item.model}
                </Text>
                <Text style={styles.itemText}>
                    <Text style={styles.itemLabel}>Price Per Day:</Text> ₦{formatPrice(item.priceperday)}
                </Text>
                <View style={styles.availabilityContainer}>
                    <Text style={styles.itemLabel}>Status:</Text>
                    <StatusBadge 
                        status={item.availability ? 'Available' : 'Unavailable'} 
                        size="small"
                    />
                </View>
            </View>
            <TouchableOpacity
                style={styles.ellipsisButton}
                onPress={() => handleMenuToggle(item)}>
                <Text style={styles.ellipsisText}>⋮</Text>
            </TouchableOpacity>
        </ModernCard>
    )

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <ModernButton
                    title="Add Car"
                    onPress={() => changeMode('New')}
                    size="small"
                />
            </View>
            <ModernCard style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder='Search Cars...'
                    placeholderTextColor={COLORS.neutral.medium}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </ModernCard>
            {isLoading ? (
                <ActivityIndicator size='large' color={COLORS.primary.solid} />
            ) : (
                filteredCars.length > 0 ? (
                    <FlatList
                        data={filteredCars}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderCarItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <ModernCard style={styles.emptyState}>
                        <Text style={styles.emptyText}>No cars available</Text>
                    </ModernCard>
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
                    <ModernCard style={styles.menu}>
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
                    </ModernCard>
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
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.neutral.medium,
        textAlign: 'center',
    },
    listContainer: {
        paddingBottom: 20,
    },
    itemContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    itemDetails: {
        flex: 1,
    },
    itemText: {
        color: COLORS.neutral.dark,
        fontSize: 14,
        marginBottom: 4,
    },
    itemLabel: {
        fontWeight: 'bold',
        fontStyle: 'italic',
    },
    availabilityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginTop: 4,
    },
    ellipsisButton: {
        padding: 10,
    },
    ellipsisText: {
        color: COLORS.neutral.medium,
        fontSize: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    menu: {
        width: 200,
        padding: 0,
    },
    menuItem: {
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral.light,
    },
    menuItemText: {
        fontSize: 16,
        color: COLORS.neutral.dark,
        fontWeight: '500',
    },
})
