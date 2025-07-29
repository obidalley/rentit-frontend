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
import { Paystack } from 'react-native-paystack-webview'
import DateTimePicker from '@react-native-community/datetimepicker'
import moment from 'moment'
import NetInfo from '@react-native-community/netinfo'
import { useRouter } from 'expo-router'

import { PAYMENT_API_KEY, COLORS } from '@/constants'
import { useGetDriversQuery } from '@/apis/driversApi'
import { useAddNewPaymentMutation } from '@/apis/paymentsApi'
import { useAddNewRentMutation } from '@/apis/rentApi'
import { useUpdateCarMutation } from '@/apis/carsApi'
import useAuth from '@/hooks/useAuth'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import ModernButton from '@/components/ui/Buttons/ModernButton'

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
        <GradientBackground colors={COLORS.background.light}>
            <View style={styles.container}>
                <ScrollView 
                    contentContainerStyle={styles.contentContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Car Details Card */}
                    <ModernCard style={styles.detailsCard}>
                        <Text style={styles.sectionTitle}>Vehicle Details</Text>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Car Name</Text>
                            <Text style={styles.value}>{car?.name}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Make</Text>
                            <Text style={styles.value}>{car?.make}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Model</Text>
                            <Text style={styles.value}>{car?.model}</Text>
                        </View>
                        
                        <View style={styles.detailsRow}>
                            <Text style={styles.label}>Price per Day</Text>
                            <Text style={styles.priceValue}>
                                ₦{Number(car?.priceperday).toLocaleString()}
                            </Text>
                        </View>
                    </ModernCard>

                    {/* Date Selection Card */}
                    <ModernCard style={styles.dateCard}>
                        <Text style={styles.sectionTitle}>Rental Period</Text>
                        
                        <View style={styles.dateSection}>
                            <ModernButton
                                title={`Start Date: ${moment(startDate).format('DD MMM YYYY')}`}
                                onPress={() => setShowStartDatePicker(true)}
                                variant="outline"
                                size="medium"
                            />
                            {showStartDatePicker && (
                                <DateTimePicker
                                    value={startDate}
                                    mode='date'
                                    display='default'
                                    onChange={onChangeStartDate}
                                />
                            )}
                            
                            <ModernButton
                                title={`End Date: ${moment(endDate).format('DD MMM YYYY')}`}
                                onPress={() => setShowEndDatePicker(true)}
                                variant="outline"
                                size="medium"
                            />
                            {showEndDatePicker && (
                                <DateTimePicker
                                    value={endDate}
                                    mode='date'
                                    display='default'
                                    onChange={onChangeEndDate}
                                />
                            )}
                        </View>
                    </ModernCard>

                    {/* Driver Selection Card */}
                    <ModernCard style={styles.driverCard}>
                        <Text style={styles.sectionTitle}>Driver Service</Text>
                        
                        <View style={styles.checkboxContainer}>
                            <CheckBox 
                                value={includeDriver} 
                                onValueChange={setIncludeDriver}
                                color={includeDriver ? COLORS.primary.solid : undefined}
                            />
                            <Text style={styles.checkboxLabel}>Include Professional Driver</Text>
                        </View>
                        
                        {includeDriver && (
                            <View style={styles.driverSection}>
                                <Text style={styles.label}>Select Driver</Text>
                                <View style={styles.pickerContainer}>
                                    <Picker
                                        selectedValue={selectedDriver}
                                        onValueChange={(itemValue) => setSelectedDriver(itemValue)}
                                        style={styles.picker}
                                    >
                                        <Picker.Item label='Choose a driver...' value={null} />
                                        {drivers &&
                                            drivers.map((driver) => (
                                                <Picker.Item
                                                    key={driver.id}
                                                    label={`${driver?.name?.firstname} ${driver?.name?.othername} ${driver?.name?.surname} - ₦${Number(
                                                        driver.priceperday
                                                    ).toLocaleString()}/day`}
                                                    value={driver.id}
                                                />
                                            ))}
                                    </Picker>
                                </View>
                            </View>
                        )}
                    </ModernCard>

                    {/* Cost Summary Card */}
                    <ModernCard style={styles.summaryCard}>
                        <Text style={styles.sectionTitle}>Cost Summary</Text>
                        
                        <View style={styles.calculationRow}>
                            <Text style={styles.calculationLabel}>Rental Days</Text>
                            <Text style={styles.calculationValue}>{numberOfDays} days</Text>
                        </View>
                        
                        <View style={styles.calculationRow}>
                            <Text style={styles.calculationLabel}>Car Cost</Text>
                            <Text style={styles.calculationValue}>₦{Number(carAmount).toLocaleString()}</Text>
                        </View>
                        
                        {includeDriver && (
                            <View style={styles.calculationRow}>
                                <Text style={styles.calculationLabel}>Driver Cost</Text>
                                <Text style={styles.calculationValue}>₦{Number(driverAmount).toLocaleString()}</Text>
                            </View>
                        )}
                        
                        <View style={[styles.calculationRow, styles.totalRow]}>
                            <Text style={styles.totalLabel}>Total Amount</Text>
                            <Text style={styles.totalValue}>₦{Number(totalAmount).toLocaleString()}</Text>
                        </View>
                    </ModernCard>

                    {/* Payment Button */}
                    <ModernCard style={styles.actionCard}>
                        <ModernButton
                            title="Proceed to Payment"
                            onPress={handleProceedToPayment}
                            variant="primary"
                            size="large"
                        />
                    </ModernCard>
                </ScrollView>
            </View>

            {/* Payment Modal */}
            <Modal visible={showPaymentModal} animationType='slide'>
                <GradientBackground colors={COLORS.background.primary}>
                    <View style={styles.modalContainer}>
                    <Paystack
                        buttonText='Pay Now'
                        btnStyles={{ 
                            backgroundColor: COLORS.primary.solid,
                            borderRadius: 12,
                            paddingVertical: 16
                        }}
                        paystackKey={PAYMENT_API_KEY}
                        amount={totalAmount}
                        billingEmail={user?.email}
                        currency='NGN'
                        reference={transactionReference}
                        onCancel={handlePaymentCancel}
                        onSuccess={handlePaymentSuccess}
                        autoStart={true}
                    />
                        <ModernButton
                            title="Cancel Payment"
                            onPress={() => setShowPaymentModal(false)}
                            variant="outline"
                            size="large"
                        />
                    </View>
                </GradientBackground>
            </Modal>
        </GradientBackground>
    )
}

export default RentConfirmation

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
    dateCard: {
        marginBottom: 16,
    },
    driverCard: {
        marginBottom: 16,
    },
    summaryCard: {
        marginBottom: 16,
    },
    actionCard: {
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
    dateSection: {
        gap: 12,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    checkboxLabel: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.neutral.dark,
    },
    driverSection: {
        marginTop: 16,
    },
    pickerContainer: {
        backgroundColor: COLORS.neutral.light,
        borderRadius: 12,
        marginTop: 8,
    },
    picker: {
        height: 50,
        width: '100%',
        color: COLORS.neutral.dark,
    },
    calculationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
    },
    calculationLabel: {
        fontSize: 16,
        color: COLORS.neutral.medium,
        fontWeight: '500',
    },
    calculationValue: {
        fontSize: 16,
        color: COLORS.neutral.dark,
        fontWeight: '600',
    },
    totalRow: {
        borderTopWidth: 2,
        borderTopColor: COLORS.primary.solid,
        marginTop: 8,
        paddingTop: 16,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: '700',
        color: COLORS.neutral.dark,
    },
    totalValue: {
        fontSize: 20,
        fontWeight: '800',
        color: COLORS.primary.solid,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
})