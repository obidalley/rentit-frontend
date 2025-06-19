import React, { useState, useMemo } from 'react'
import {
    View,
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    Alert,
    Modal,
} from 'react-native'
import CheckBox from 'expo-checkbox'
import { Picker } from '@react-native-picker/picker'
import { Divider } from 'react-native-paper'
import { Paystack } from 'react-native-paystack-webview'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import NetInfo from '@react-native-community/netinfo'
import { useRouter } from 'expo-router'

import { PAYMENT_API_KEY } from '@/constants'
import { useGetDriversQuery } from '@/apis/driversApi'
import { useAddNewPaymentMutation } from '@/apis/paymentsApi'
import { useAddNewRentMutation } from '@/apis/rentApi'
import { useUpdateCarMutation } from '@/apis/carsApi'
import useAuth from '@/hooks/useAuth'

const RentConfirmation = ({ car }) => {
    // Local state variables
    const router = useRouter()
    const [includeDriver, setIncludeDriver] = useState(false)
    const [selectedDriver, setSelectedDriver] = useState(null)
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [startDate, setStartDate] = useState(new Date())
    const [endDate, setEndDate] = useState(new Date())
    const [showStartDatePicker, setShowStartDatePicker] = useState(false)
    const [showEndDatePicker, setShowEndDatePicker] = useState(false)

    // Get current user data and driver list
    const { user } = useAuth()
    const { data: driversData } = useGetDriversQuery('Drivers')
    const drivers = useMemo(() => Object.values(driversData?.entities || {}), [driversData])

    // Mutations for saving payment and rent data
    const [addPayment] = useAddNewPaymentMutation()
    const [addNewRent] = useAddNewRentMutation()
    const [updateCar] = useUpdateCarMutation()

    // Calculate the number of rental days (inclusive)
    let numberOfDays = moment(endDate).diff(moment(startDate), 'days') + 1
    if (numberOfDays < 1) numberOfDays = 0

    // Calculate costs
    const carAmount = car?.priceperday * numberOfDays
    const selectedDriverObj = drivers.find(driver => driver.id === selectedDriver)
    const driverAmount =
        includeDriver && selectedDriverObj ? selectedDriverObj.priceperday * numberOfDays : 0
    const totalAmount = carAmount + driverAmount

    // Generate unique transaction reference
    const generateReference = () => `ref_${new Date().getTime()}`
    const transactionReference = generateReference()

    // Generate unique booking code
    const generateBookingCode = () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
        let randomLetters = ''
        for (let i = 0; i < 4; i++) {
            randomLetters += letters.charAt(Math.floor(Math.random() * letters.length))
        }
        return `BK_${new Date().getTime()}${randomLetters}`
    }

    // Handler: Check dates, driver selection, and internet before proceeding to payment
    const handleProceedToPayment = () => {
        if (numberOfDays === 0) {
            Alert.alert('Error', 'Please select valid start and end dates')
            return
        }
        if (includeDriver && !selectedDriver) {
            Alert.alert('Error', 'Please select a driver')
            return
        }
        // Check internet connectivity
        NetInfo.fetch().then(state => {
            if (!state.isConnected) {
                Alert.alert(
                    'No Internet',
                    'You are not connected to the internet. Please connect and try again.'
                )
                return
            }
            // All validations passed; open payment modal
            setShowPaymentModal(true)
        })
    }

    const handleUpdateAvailability = async (carid) => {
        console.log('Hello sire')
        try {
            const response = await updateCar({ id: carid, availability: false })
            if (!response.error) {
                const { status } = response.data
                if (status === 'SUCCESS') {
                    return true
                } else {
                    return false
                }
            } else {
                console.log('Error:', response.error)
                return false
            }
        } catch (error) {
            return false
        }
    }

    // Handler: Payment success – save payment data then rent data with a unique booking code
    const handlePaymentSuccess = async (response) => {
        let type = 'Error'
        let text = 'Payment processing error!'
        try {
            // Prepare payment payload from response and computed totals
            const paymentPayload = {
                amount: totalAmount,
                status: 'Successful',
                paymentmethod: response?.paymentMethod || 'Card',
                transactionid: response?.transactionRef?.trxref || '',
            }
            // Save payment data to backend
            const paymentResponse = await addPayment(paymentPayload)
            const paymentError = paymentResponse?.error
            if (!paymentError) {
                const { status, message, data } = paymentResponse?.data
                if (status === 'SUCCESS') {
                    const paymentId = data?._id
                    const rentPayload = {
                        customer: user?.uid,
                        car: car?.id,
                        payment: paymentId,
                        driver: selectedDriver,
                        driverincluded: includeDriver,
                        startdate: startDate.toISOString(),
                        enddate: endDate.toISOString(),
                        bookingcode: generateBookingCode(),
                    }
                    const rentResponse = await addNewRent(rentPayload)
                    if (rentResponse?.data) {
                        const { status, message } = rentResponse?.data
                        if (status === 'SUCCESS') {
                            handleUpdateAvailability(car?.id)
                            type = 'Success'
                            text = 'Your rent has been booked successfully!'
                        } else {
                            text = message
                        }
                    } else {
                        console.log('Rent error:', rentResponse?.error)
                        text = rentResponse?.error?.message || 'Failed to save rent data'
                    }

                } else {
                    text = message
                }

            } else {
                console.log('Payment Error:', paymentError)
                text = paymentError?.data.message || 'Failed to save payment data'
            }

        } catch (error) {
            console.error('Error saving payment or rent data:', error)
            text = error.data?.message || 'An error occurred during payment processing!'
        } finally {
            setTimeout(() => {
                Alert.alert('Car Rent', text, [
                    {
                        text: 'OK',
                        onPress: () => {
                            if (type === 'Success') {
                                if (user?.roles.includes('Admin')) {
                                    router.push('/(dashboard)')
                                } else {
                                    router.push('/(customer)/feeds')
                                }
                            }
                        },
                    },
                ])
                setShowPaymentModal(false)
            }, 3000)
        }
    }

    // Handler: Payment cancel
    const handlePaymentCancel = () => {
        Alert.alert('Payment Cancelled', 'Payment was cancelled.')
        setShowPaymentModal(false)
    }

    // Handlers for date pickers
    const onChangeStartDate = (event, selectedDate) => {
        setShowStartDatePicker(false)
        if (selectedDate) {
            setStartDate(selectedDate)
        }
    }

    const onChangeEndDate = (event, selectedDate) => {
        setShowEndDatePicker(false)
        if (selectedDate) {
            setEndDate(selectedDate)
        }
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer}>
                {/* Car Details */}
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Car Name:</Text>
                    <Text style={styles.value}>{car?.name}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Make:</Text>
                    <Text style={styles.value}>{car?.make}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Model:</Text>
                    <Text style={styles.value}>{car?.model}</Text>
                </View>
                <Divider style={styles.divider} />
                <View style={styles.detailsRow}>
                    <Text style={styles.label}>Price per Day:</Text>
                    <Text style={styles.value}>
                        ₦{Number(car?.priceperday).toLocaleString()}
                    </Text>
                </View>
                <Divider style={styles.divider} />

                {/* Date Selection */}
                <View style={styles.dateSection}>
                    <TouchableOpacity
                        onPress={() => setShowStartDatePicker(true)}
                        style={styles.dateButton}
                    >
                        <Text style={styles.dateButtonText}>
                            Select Start Date: {moment(startDate).format('DD MMM YYYY')}
                        </Text>
                    </TouchableOpacity>
                    {showStartDatePicker && (
                        <DateTimePicker
                            value={startDate}
                            mode='date'
                            display='default'
                            onChange={onChangeStartDate}
                        />
                    )}
                    <TouchableOpacity
                        onPress={() => setShowEndDatePicker(true)}
                        style={styles.dateButton}
                    >
                        <Text style={styles.dateButtonText}>
                            Select End Date: {moment(endDate).format('DD MMM YYYY')}
                        </Text>
                    </TouchableOpacity>
                    {showEndDatePicker && (
                        <DateTimePicker
                            value={endDate}
                            mode='date'
                            display='default'
                            onChange={onChangeEndDate}
                        />
                    )}
                </View>
                <Divider style={styles.divider} />

                {/* Cost Calculations */}
                <Text style={styles.calculationText}>
                    Number of Days: {numberOfDays}
                </Text>
                <Text style={styles.calculationText}>
                    Car Cost: ₦{Number(carAmount).toLocaleString()}
                </Text>
                {includeDriver && (
                    <Text style={styles.calculationText}>
                        Driver Cost: ₦{Number(driverAmount).toLocaleString()}
                    </Text>
                )}
                <Text style={styles.totalText}>
                    Total Amount to Pay: ₦{Number(totalAmount).toLocaleString()}
                </Text>

                {/* Driver Option */}
                <View style={styles.checkboxContainer}>
                    <CheckBox value={includeDriver} onValueChange={setIncludeDriver} />
                    <Text style={styles.checkboxLabel}>Include Driver</Text>
                </View>
                {includeDriver && (
                    <View style={styles.driverSection}>
                        <Text style={styles.label}>Select a Driver:</Text>
                        <Picker
                            selectedValue={selectedDriver}
                            onValueChange={(itemValue) => setSelectedDriver(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label='Select a driver' value={null} />
                            {drivers &&
                                drivers.map((driver) => (
                                    <Picker.Item
                                        key={driver.id}
                                        label={`${driver?.name?.firstname} ${driver?.name?.othername} ${driver?.name?.surname} - ₦${Number(
                                            driver.priceperday
                                        ).toLocaleString()}`}
                                        value={driver.id}
                                    />
                                ))}
                        </Picker>
                    </View>
                )}

                {/* Proceed to Payment */}
                <TouchableOpacity
                    style={styles.proceedButton}
                    onPress={handleProceedToPayment}
                >
                    <Text style={styles.proceedButtonText}>Proceed to Payment</Text>
                </TouchableOpacity>
            </ScrollView>

            {/* Payment Modal */}
            <Modal visible={showPaymentModal} animationType='slide'>
                <View style={styles.modalContainer}>
                    <Paystack
                        buttonText='Pay Now'
                        btnStyles={{ backgroundColor: 'green' }}
                        paystackKey={PAYMENT_API_KEY}
                        amount={totalAmount}
                        billingEmail={user?.email}
                        currency='NGN'
                        reference={transactionReference}
                        onCancel={handlePaymentCancel}
                        onSuccess={handlePaymentSuccess}
                        autoStart={true}
                    />
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => setShowPaymentModal(false)}
                    >
                        <Text style={styles.closeButtonText}>Close Payment</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    )
}

export default RentConfirmation

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
    },
    value: {
        fontSize: 16,
        color: '#555',
        marginLeft: 5,
    },
    divider: {
        marginVertical: 5,
        backgroundColor: '#9CA3AF',
        height: 1,
    },
    dateSection: {
        marginVertical: 10,
    },
    dateButton: {
        backgroundColor: '#007AFF',
        padding: 10,
        borderRadius: 5,
        marginVertical: 5,
    },
    dateButtonText: {
        color: '#fff',
        fontSize: 16,
        textAlign: 'center',
    },
    calculationText: {
        fontSize: 16,
        color: '#333',
        marginVertical: 2,
    },
    totalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'green',
        marginVertical: 10,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 16,
        color: '#333',
    },
    driverSection: {
        marginVertical: 10,
    },
    picker: {
        height: 50,
        width: '100%',
        color: '#333',
    },
    proceedButton: {
        backgroundColor: 'green',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    proceedButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    closeButton: {
        marginTop: 20,
        paddingVertical: 15,
        backgroundColor: 'red',
        borderRadius: 10,
        alignItems: 'center',
    },
    closeButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
})
