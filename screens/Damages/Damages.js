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

import { useGetDamagesQuery, useDeleteDamageMutation, useUpdateDamageMutation } from '@/apis/damagesApi'
import useAuth from '@/hooks/useAuth'
import { setSpinner } from '@/store/slices/spinnerSlice'

import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import StatusBadge from '@/components/ui/StatusBadge'
import ModernButton from '@/components/ui/Buttons/ModernButton'
import ActivityIndicator from '@/components/ActivityIndicator'
import { COLORS } from '@/constants'

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
        <ModernCard style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <Text style={styles.rentCode}>{item.rent.bookingcode}</Text>
                <StatusBadge status={item.status} size="small" />
            </View>
            
            <View style={styles.itemDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Customer</Text>
                    <Text style={styles.value}>
                        {`${item.customer.name.firstname} ${item.customer.name.othername} ${item.customer.name.surname}`}
                    </Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.value} numberOfLines={2}>
                        {item.description}
                    </Text>
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
            <ModernCard style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder='Search Damages...'
                    placeholderTextColor={COLORS.neutral.medium}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                />
            </ModernCard>
            
            <View style={styles.contentContainer}>
                <ActivityIndicator visible={isLoading} />
                {filteredDamages.length > 0 ? (
                    <FlatList
                        data={filteredDamages}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderDamageItem}
                        contentContainerStyle={styles.listContainer}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    <ModernCard style={styles.emptyCard}>
                        <Text style={styles.emptyText}>No Damage Reports Available</Text>
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
                        {isAdmin && (
                            <>
                                <ModernButton
                                    title="Mark Reviewed"
                                    onPress={() => handleUpdateStatus('Reviewed')}
                                    variant="success"
                                    size="medium"
                                />
                                <ModernButton
                                    title="Mark Resolved"
                                    onPress={() => handleUpdateStatus('Resolved')}
                                    variant="accent"
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
    )
}

export default Damages

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
    rentCode: {
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
