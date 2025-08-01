import React, { useState, useMemo } from 'react'
import {
    StyleSheet,
    View,
    Text,
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

import { COLORS } from '@/constants'
import { useGetCustomersQuery, useDeleteCustomerMutation } from '@/apis/customersApi'
import { setSpinner } from '@/store/slices/spinnerSlice'

import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import ModernButton from '@/components/ui/Buttons/ModernButton'
import ActivityIndicator from '@/components/ActivityIndicator'

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
        <ModernCard style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <Text style={styles.customerName}>
                    {`${item.name?.firstname} ${item.name?.othername} ${item.name?.surname}`}
                </Text>
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
                    <Text style={styles.label}>Phone</Text>
                    <Text style={styles.value}>{item.contact?.phone}</Text>
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
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GradientBackground colors={COLORS.background.light}>
                <View style={styles.container}>
                    <ModernCard style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                        placeholder='Search Customers...'
                            placeholderTextColor={COLORS.neutral.medium}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        />
                    </ModernCard>
                    
                    <View style={styles.contentContainer}>
                        <ActivityIndicator visible={isLoading} />
                        {filteredCustomers.length > 0 ? (
                            <FlatList
                                data={filteredCustomers}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={renderCustomerItem}
                                contentContainerStyle={styles.listContainer}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <ModernCard style={styles.emptyCard}>
                                <Text style={styles.emptyText}>No Customers Available</Text>
                            </ModernCard>
                        )
                    }
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
                                    title="Delete"
                                    onPress={confirmDelete}
                                    variant="danger"
                                    size="medium"
                                />
                            </ModernCard>
                        </TouchableOpacity>
                    </Modal>
                </View>
            </GradientBackground>
        </GestureHandlerRootView>
    )
}

export default Custormers

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
    customerName: {
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
