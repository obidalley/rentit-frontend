import React from 'react'
import {
    View,
    StyleSheet,
    Text,
    ScrollView,
    TouchableOpacity,
    Linking
} from 'react-native'
import { Divider } from 'react-native-paper'
import moment from 'moment'

import useAuth from '@/hooks/useAuth'

const Rent = ({ rent }) => {
    const { user } = useAuth()

    const handleCall = (phone) => {
        if (phone) {
            Linking.openURL(`tel:${phone}`)
        }
    }

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Pending':
                return styles.pending
            case 'Active':
                return styles.active
            case 'Completed':
                return styles.completed
            case 'Cancelled':
                return styles.cancelled
            default:
                return {}
        }
    }

    const formatPrice = pricePerDay => Number(pricePerDay).toLocaleString()

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Rent Details */}
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Booking Code:</Text>
                    <Text style={styles.value}>{rent.bookingcode}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Rent Date:</Text>
                    <Text style={styles.value}>{moment(rent.startdate).format('DD MMM YYYY')}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>End On:</Text>
                    <Text style={styles.value}>{moment(rent.enddate).format('DD MMM YYYY')}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Status:</Text>
                    <View style={[styles.statusTag, getStatusStyle(rent.status)]}><Text style={styles.statusText}>{rent?.status}</Text></View>
                </View>
                <Divider style={styles.divider} />

                {/* Car details section */}
                <View style={styles.separatorContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>Car Details</Text>
                    <View style={styles.line} />
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{rent?.car?.name}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Make:</Text>
                    <Text style={styles.value}>{rent?.car?.make}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Model:</Text>
                    <Text style={styles.value}>{rent?.car?.model}</Text>
                </View>
                <Divider style={styles.divider} />

                {/* Car driver details section */}
                {rent?.driverincluded && (
                    <>
                        <View style={styles.separatorContainer}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>Driver's Details</Text>
                            <View style={styles.line} />
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Name:</Text>
                            <Text style={styles.value}>{`${rent?.driver?.name.firstname} ${rent?.driver?.name.othername} ${rent?.driver?.name.surname}`}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Phone:</Text>
                            <Text style={styles.value}>{rent?.driver?.contact?.phone}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.callButton} onPress={() => handleCall(rent?.driver?.contact?.phone)}>
                                <Text style={styles.buttonText}>Call</Text>
                            </TouchableOpacity>
                        </View>
                        <Divider style={styles.divider} />
                    </>
                )}

                {/* Car customer details section */}
                {user?.roles.includes('Admin') && (
                    <>
                        <View style={styles.separatorContainer}>
                            <View style={styles.line} />
                            <Text style={styles.orText}>Customer's Details</Text>
                            <View style={styles.line} />
                        </View>
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Name:</Text>
                            <Text style={styles.value}>{`${rent?.customer?.name.firstname} ${rent?.customer?.name.othername} ${rent?.customer?.name.surname}`}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Phone:</Text>
                            <Text style={styles.value}>{rent?.customer?.contact?.phone}</Text>
                        </View>
                        <Divider style={styles.divider} />
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={styles.callButton} onPress={() => handleCall(rent?.customer?.contact?.phone)}>
                                <Text style={styles.buttonText}>Call</Text>
                            </TouchableOpacity>
                        </View>
                        <Divider style={styles.divider} />
                    </>
                )}

                {/* Payment details section */}
                <View style={styles.separatorContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>Payments Details</Text>
                    <View style={styles.line} />
                </View>
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Amount:</Text>
                    <Text style={styles.value}>₦{formatPrice(rent?.payment?.amount)}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Payment Method:</Text>
                    <Text style={styles.value}>{rent?.payment?.paymentmethod}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Status:</Text>
                    <Text style={styles.value}>{rent?.payment?.status}</Text>
                </View>
                <Divider style={styles.divider} />
            </ScrollView>
        </View>
    )
}

export default Rent

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(245,245,245,0.8)',
    },
    contentContainer: {
        padding: 20,
    },
    detailsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 5,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        fontStyle: 'italic'
    },
    value: {
        fontSize: 16,
        color: '#555',
        marginLeft: 5,
    },
    divider: {
        marginVertical: 8,
        backgroundColor: '#9CA3AF',
        height: 1,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'black',
    },
    orText: {
        marginHorizontal: 10,
        color: 'black',
        fontSize: 16,
        fontWeight: '600',
        fontStyle: 'italic'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 10,
    },
    callButton: {
        backgroundColor: 'green',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '40%',
    },
    emailButton: {
        backgroundColor: 'blue',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        width: '40%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    statusTag: {
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
    completed: {
        backgroundColor: 'blue',
    },
    cancelled: {
        backgroundColor: 'red',
    },
    statusText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
})
