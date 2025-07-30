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
import moment from 'moment'

import { COLORS } from '@/constants'
import { useDeletePaymentMutation } from '@/apis/paymentsApi'
import { useGetRentsQuery } from '@/apis/rentApi'
import useAuth from '@/hooks/useAuth'
import { setSpinner } from '@/store/slices/spinnerSlice'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import StatusBadge from '@/components/ui/StatusBadge'
import ModernButton from '@/components/ui/Buttons/ModernButton'
import ActivityIndicator from '@/components/ActivityIndicator'

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
        <ModernCard style={styles.itemContainer}>
            <View style={styles.itemHeader}>
                <Text style={styles.bookingCode}>{item.bookingcode}</Text>
                <StatusBadge status={item.payment?.status} size="small" />
            </View>
            
            <View style={styles.itemDetails}>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Amount</Text>
                    <Text style={styles.priceValue}>₦{formatPrice(item.payment?.amount)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Payment Date</Text>
                    <Text style={styles.value}>{moment(item.startdate).format('DD MMM YYYY')}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Transaction ID</Text>
                    <Text style={styles.value}>{item.payment?.transactionid}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Text style={styles.label}>Payment Method</Text>
                    <Text style={styles.value}>{item.payment?.paymentmethod}</Text>
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
        <GradientBackground colors={COLORS.background.light}>
            <View style={styles.container}>
                <ModernCard style={styles.searchContainer}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder='Search Payments...'
                        placeholderTextColor={COLORS.neutral.medium}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                    />
                </ModernCard>
                
                <View style={styles.contentContainer}>
                    <ActivityIndicator visible={isLoading} />
                    {filteredRents.length > 0 ? (
                        <FlatList
                            data={filteredRents}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderPaymentItem}
                            contentContainerStyle={styles.listContainer}
                            showsVerticalScrollIndicator={false}
                        />
                    ) : (
                        <ModernCard style={styles.emptyCard}>
                            <Text style={styles.emptyText}>No Payments Available</Text>
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
                                title="Delete Payment"
                                onPress={confirmDelete}
                                variant="danger"
                                size="medium"
                            />
                        </ModernCard>
                    </TouchableOpacity>
                </Modal>
            </View>
        </GradientBackground>
    )
}

export default Payments

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
    bookingCode: {
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
    },
})
