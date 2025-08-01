import React from 'react'
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    Linking
} from 'react-native'
import moment from 'moment'

import { COLORS } from '@/constants'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import ModernButton from '@/components/ui/Buttons/ModernButton'

const Customer = ({ customer }) => {
    const handleCall = () => {
        if (customer?.contact?.phone) {
            Linking.openURL(`tel:${customer.contact.phone}`)
        }
    }

    const handleEmail = () => {
        if (customer?.user?.email) {
            Linking.openURL(`mailto:${customer.user.email}`)
        }
    }

    return (
        <GradientBackground colors={COLORS.background.light}>
            <View style={styles.container}>
                <ScrollView 
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Customer Details Card */}
                    <ModernCard style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Customer Information</Text>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Full Name</Text>
                            <Text style={styles.value}>
                                {`${customer?.name?.firstname} ${customer?.name?.othername} ${customer?.name?.surname}`}
                            </Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Date of Birth</Text>
                            <Text style={styles.value}>{moment(customer.dob).format('DD MMM YYYY')}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Gender</Text>
                            <Text style={styles.value}>{customer?.gender}</Text>
                        </View>
                    </ModernCard>

                    {/* Contact Details Card */}
                    <ModernCard style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Contact Information</Text>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Phone Number</Text>
                            <Text style={styles.value}>{customer?.contact?.phone}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Email Address</Text>
                            <Text style={styles.value}>{customer?.user?.email}</Text>
                        </View>
                        
                        <View style={styles.addressContainer}>
                            <Text style={styles.label}>Address</Text>
                            <Text style={styles.addressValue}>{customer?.contact?.address}</Text>
                        </View>
                    </ModernCard>

                    {/* Contact Actions Card */}
                    <ModernCard style={styles.actionsCard}>
                        <Text style={styles.sectionTitle}>Contact Customer</Text>
                        
                        <View style={styles.actionContainer}>
                            <ModernButton
                                title="Call Customer"
                                onPress={handleCall}
                                variant="success"
                                size="medium"
                            />
                            <ModernButton
                                title="Send Email"
                                onPress={handleEmail}
                                variant="primary"
                                size="medium"
                            />
                        </View>
                    </ModernCard>
                </ScrollView>
            </View>
        </GradientBackground>
    )
}

export default Customer

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
    actionsCard: {
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
    addressContainer: {
        paddingVertical: 12,
    },
    addressValue: {
        fontSize: 16,
        color: COLORS.neutral.dark,
        lineHeight: 24,
        marginTop: 8,
    },
    actionContainer: {
        flex: 1,
        gap: 12,
    },
})
