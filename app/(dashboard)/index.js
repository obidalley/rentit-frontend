import React, { useEffect, useCallback, useMemo } from 'react'
import {
  View,
  BackHandler,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  FlatList,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { LineChart } from 'react-native-chart-kit'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { APP_FULL_NAME, COLORS } from '@/constants'
import { useGetPaymentsQuery } from '@/apis/paymentsApi'
import { useGetRentsQuery } from '@/apis/rentApi'
import { useGetCarsQuery } from '@/apis/carsApi'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import StatusBadge from '@/components/ui/StatusBadge'

dayjs.extend(relativeTime)

const screenWidth = Dimensions.get('window').width

const getStatusStyle = (status) => {
  switch (status.toLowerCase()) {
    case 'active':
      return { backgroundColor: '#4CAF50' }
    case 'completed':
      return { backgroundColor: '#1E90FF' }
    case 'pending':
      return { backgroundColor: '#FF9800' }
    case 'cancelled':
      return { backgroundColor: '#F44336' }
    default:
      return { backgroundColor: '#9E9E9E' }
  }
}

const Dashboard = () => {
  const navigation = useNavigation()

  const { data: paymentsData } = useGetPaymentsQuery('Payments')
  const { data: rentsData } = useGetRentsQuery('Rents')
  const { data: carsData } = useGetCarsQuery('Cars')

  const payments = useMemo(() => Object.values(paymentsData?.entities || {}), [paymentsData])
  const rents = useMemo(() => Object.values(rentsData?.entities || {}), [rentsData])
  const cars = useMemo(() => Object.values(carsData?.entities || {}), [carsData])

  const totalAmount = useMemo(() => {
    return payments.reduce((sum, payment) => sum + (payment.amount || 0), 0)
  }, [payments])
  const activeRents = rents.filter(item => item.status === 'Active')

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => null,
      gestureEnabled: false,
    })
  }, [navigation])

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => true
      BackHandler.addEventListener('hardwareBackPress', onBackPress)
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress)
    }, [])
  )

  const formatPrice = pricePerDay => Number(pricePerDay).toLocaleString()

  const monthlyData = useMemo(() => {
    const counts = Array(12).fill(0)
    rents.forEach((rent) => {
      if (rent.createdAt) {
        const date = new Date(rent.createdAt)
        const month = date.getMonth()
        counts[month] += 1
      }
    })
    return counts
  }, [rents])

  const formattedRents = rents
    .slice()
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(0, 5)
    .map((rent) => ({
      id: rent.id,
      bookingcode: rent.bookingcode,
      user: `${rent?.customer?.name?.firstname || ''} ${rent?.customer.name?.othername || ''} ${rent?.customer?.name.surname || ''}`.trim(),
      status: rent.status || 'Pending',
      date: rent.createdAt,
    }))

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GradientBackground colors={COLORS.background.light}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appTitle}>{APP_FULL_NAME}</Text>
            <Text style={styles.subtitle}>Admin Dashboard</Text>
          </View>
          
          <Text style={styles.subHeader}>Overview</Text>

          <View style={styles.statsContainer}>
            <ModernCard gradient gradientColors={COLORS.primary.start ? [COLORS.primary.start, COLORS.primary.end] : [COLORS.primary.solid, COLORS.primary.solid]} style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statTitle}>Total Rents</Text>
                <Text style={styles.statValue}>{rents?.length || 0}</Text>
              </View>
            </ModernCard>

            <ModernCard gradient gradientColors={COLORS.secondary.start ? [COLORS.secondary.start, COLORS.secondary.end] : [COLORS.secondary.solid, COLORS.secondary.solid]} style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statTitle}>Active Rents</Text>
                <Text style={styles.statValue}>{activeRents?.length || 0}</Text>
              </View>
            </ModernCard>

            <ModernCard gradient gradientColors={COLORS.accent.start ? [COLORS.accent.start, COLORS.accent.end] : [COLORS.accent.solid, COLORS.accent.solid]} style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statTitle}>Revenue</Text>
                <Text style={styles.statValue}>₦{formatPrice(totalAmount)}</Text>
              </View>
            </ModernCard>

            <ModernCard gradient gradientColors={COLORS.success.start ? [COLORS.success.start, COLORS.success.end] : [COLORS.success.solid, COLORS.success.solid]} style={styles.statCard}>
              <View style={styles.statContent}>
                <Text style={styles.statTitle}>Total Cars</Text>
                <Text style={styles.statValue}>{cars?.length || 0}</Text>
              </View>
            </ModernCard>
          </View>

          <View style={styles.sectionSeparator} />

          <Text style={styles.subHeader}>Rental Trends</Text>
          <ModernCard style={styles.chartCard}>
            <LineChart
              data={{
                labels: ['Ja', 'Fe', 'Ma', 'Ap', 'My', 'Ju', 'Jl', 'Au', 'Se', 'Oc', 'No', 'Dc'],
                datasets: [
                  {
                    data: monthlyData,
                    color: (opacity = 1) => COLORS.primary.solid,
                    strokeWidth: 3,
                  },
                ],
              }}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: COLORS.primary.start || COLORS.primary.solid,
                backgroundGradientTo: COLORS.primary.end || COLORS.primary.solid,
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: "6",
                  strokeWidth: "2",
                  stroke: "#ffffff"
                }
              }}
              style={styles.chart}
            />
          </ModernCard>

          <View style={styles.sectionSeparator} />

          <Text style={styles.subHeader}>Recent Bookings</Text>

          <ModernCard style={styles.bookingList}>
            <FlatList
              data={formattedRents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.bookingItem}>
                  <Text style={styles.bookingText}>{item.bookingcode}</Text>
                  <Text style={styles.bookingSubText}>
                    <Text style={styles.bookingLabel}>By: </Text>{item.user}
                  </Text>
                  <View style={styles.bookingRow}>
                    <Text style={styles.dateText}>{dayjs(item.date).fromNow()}</Text>
                    <StatusBadge status={item.status} size="small" />
                  </View>
                </View>
              )}
              ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
              nestedScrollEnabled={true}
              scrollEnabled={false}
              contentContainerStyle={{ paddingBottom: 16 }}
            />
          </ModernCard>
        </ScrollView>
      </GradientBackground>
    </GestureHandlerRootView>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  scrollContent: {
    padding: 16,
    paddingBottom: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.neutral.medium,
    fontWeight: '500',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary.solid,
    marginTop: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: COLORS.neutral.medium,
    marginTop: 4,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
  },
  statContent: {
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 12,
    color: COLORS.neutral.dark,
  },
  chartCard: {
    padding: 0,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: 16,
  },
  sectionSeparator: {
    height: 1,
    backgroundColor: COLORS.neutral.light,
    marginVertical: 16,
  },
  bookingList: {
    marginBottom: 16,
  },
  bookingItem: {
    paddingVertical: 8,
  },
  bookingText: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.neutral.dark,
  },
  bookingSubText: {
    fontSize: 14,
    color: COLORS.neutral.medium,
    marginTop: 2,
  },
  bookingLabel: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: COLORS.neutral.medium,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: COLORS.neutral.light,
    marginVertical: 4,
  },
})
