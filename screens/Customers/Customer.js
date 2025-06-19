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
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Customer Details */}
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Name:</Text>
                    <Text style={styles.value}>{`${customer?.name?.firstname} ${customer?.name?.othername} ${customer?.name?.surname}`}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Date of Birth:</Text>
                    <Text style={styles.value}>{moment(customer.dob).format('DD MMM YYYY')}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Phone:</Text>
                    <Text style={styles.value}>{customer?.contact?.phone}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Address:</Text>
                    <Text style={styles.value}>{customer?.contact?.address}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Email Address:</Text>
                    <Text style={styles.value}>{customer?.user?.email}</Text>
                </View>

                {/* Separator */}
                <View style={styles.separatorContainer}>
                    <View style={styles.line} />
                    <Text style={styles.orText}>Contact Customer</Text>
                    <View style={styles.line} />
                </View>

                {/* Contact Buttons */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity style={styles.callButton} onPress={handleCall}>
                        <Text style={styles.buttonText}>Call</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.emailButton} onPress={handleEmail}>
                        <Text style={styles.buttonText}>Email</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    )
}

export default Customer

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
        marginTop: 60,
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
})
