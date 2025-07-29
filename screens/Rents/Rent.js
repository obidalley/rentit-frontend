import React from 'react'
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    Linking
} from 'react-native'
import moment from 'moment'

import { COLORS } from '@/constants'
import useAuth from '@/hooks/useAuth'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import ModernButton from '@/components/ui/Buttons/ModernButton'
import StatusBadge from '@/components/ui/StatusBadge'

const Rent = ({ rent }) => {
    const { user } = useAuth()

    const handleCall = (phone) => {
        if (phone) {
            Linking.openURL(`tel:${phone}`)
        }
    }

    const formatPrice = pricePerDay => Number(pricePerDay).toLocaleString()

    return (
        <GradientBackground colors={COLORS.background.light}>
            <View style={styles.container}>
                <ScrollView 
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Booking Details Card */}
                    <ModernCard style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Booking Information</Text>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Booking Code</Text>
                            <Text style={styles.value}>{rent.bookingcode}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Start Date</Text>
                            <Text style={styles.value}>{moment(rent.startdate).format('DD MMM YYYY')}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>End Date</Text>
                            <Text style={styles.value}>{moment(rent.enddate).format('DD MMM YYYY')}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Status</Text>
                            <StatusBadge status={rent?.status} size="small" />
                        </View>
                    </ModernCard>

                    {/* Car Details Card */}
                    <ModernCard style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Vehicle Details</Text>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Car Name</Text>
                            <Text style={styles.value}>{rent?.car?.name}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Make</Text>
                            <Text style={styles.value}>{rent?.car?.make}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Model</Text>
                            <Text style={styles.value}>{rent?.car?.model}</Text>
                        </View>
                    </ModernCard>

                    {/* Driver Details Card */}
                    {rent?.driverincluded && (
                        <ModernCard style={styles.detailsCard}>
                            <Text style={styles.sectionTitle}>Driver Information</Text>
                            
                            <View style={styles.detailsRow}>
                                <Text style={styles.label}>Driver Name</Text>
                                <Text style={styles.value}>
                                    {`${rent?.driver?.name.firstname} ${rent?.driver?.name.othername} ${rent?.driver?.name.surname}`}
                                </Text>
                            </View>
                            
                            <View style={styles.detailsRow}>
                                <Text style={styles.label}>Phone Number</Text>
                                <Text style={styles.value}>{rent?.driver?.contact?.phone}</Text>
                            </View>
                            
                            <View style={styles.actionContainer}>
                                <ModernButton
                                    title="Call Driver"
                                    onPress={() => handleCall(rent?.driver?.contact?.phone)}
                                    variant="success"
                                    size="medium"
                                />
                            </View>
                        </ModernCard>
                    )}

                    {/* Customer Details Card (Admin Only) */}
                    {user?.roles.includes('Admin') && (
                        <ModernCard style={styles.detailsCard}>
                            <Text style={styles.sectionTitle}>Customer Information</Text>
                            
                            <View style={styles.detailsRow}>
                                <Text style={styles.label}>Customer Name</Text>
                                <Text style={styles.value}>
                                    {`${rent?.customer?.name.firstname} ${rent?.customer?.name.othername} ${rent?.customer?.name.surname}`}
                                </Text>
                            </View>
                            
                            <View style={styles.detailsRow}>
                                <Text style={styles.label}>Phone Number</Text>
                                <Text style={styles.value}>{rent?.customer?.contact?.phone}</Text>
                            </View>
                            
                            <View style={styles.actionContainer}>
                                <ModernButton
                                    title="Call Customer"
                                    onPress={() => handleCall(rent?.customer?.contact?.phone)}
                                    variant="success"
                                    size="medium"
                                />
                            </View>
                        </ModernCard>
                    )}

                    {/* Payment Details Card */}
                    <ModernCard style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Payment Information</Text>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Total Amount</Text>
                            <Text style={styles.priceValue}>₦{formatPrice(rent?.payment?.amount)}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Payment Method</Text>
                            <Text style={styles.value}>{rent?.payment?.paymentmethod}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Payment Status</Text>
                            <StatusBadge status={rent?.payment?.status} size="small" />
                        </View>
                    </ModernCard>
                </ScrollView>
            </View>
        </GradientBackground>
    )
}

export default Rent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    contentContainer: {
        paddingBottom: 20,
    },
    detailsCard: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.neutral.dark,
        marginBottom: 16,
    },
    detailsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.neutral.light,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.neutral.medium,
        flex: 1,
    },
    value: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.neutral.dark,
        flex: 2,
        textAlign: 'right',
    },
    priceValue: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.primary.solid,
        flex: 2,
        textAlign: 'right',
    },
    actionContainer: {
        alignItems: 'center',
        marginTop: 16,
    },
})