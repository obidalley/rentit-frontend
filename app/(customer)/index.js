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
import { Card } from 'react-native-paper'
import { LineChart } from 'react-native-chart-kit'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { APP_FULL_NAME, COLORS } from '@/constants'
import { useGetRentsQuery } from '@/apis/rentApi'
import useAuth from '@/hooks/useAuth'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'
import StatusBadge from '@/components/ui/StatusBadge'

dayjs.extend(relativeTime)

const screenWidth = Dimensions.get('window').width

const Dashboard = () => {
    const navigation = useNavigation()
    const { user } = useAuth()

    const { data: rentsData } = useGetRentsQuery('Rents')

    const rents = useMemo(() => Object.values(rentsData?.entities || {}), [rentsData])

    const customerRents = rents.filter(item => item.customer?._id === user?.uid)

    const activeRents = customerRents.filter(item => item.status === 'Active')

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

    const monthlyData = useMemo(() => {
        const counts = Array(12).fill(0)
        customerRents.forEach((rent) => {
            if (rent.createdAt) {
                const date = new Date(rent.createdAt)
                const month = date.getMonth()
                counts[month] += 1
            }
        })
        return counts
    }, [rents])

    const formattedRents = customerRents
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
                    </View>
                    
                    <Text style={styles.subHeader}>Stats</Text>

                    <View style={styles.statsContainer}>
                        <ModernCard gradient gradientColors={COLORS.primary.start ? [COLORS.primary.start, COLORS.primary.end] : [COLORS.primary.solid, COLORS.primary.solid]} style={styles.statCard}>
                            <View style={styles.statContent}>
                                <Text style={styles.statTitle}>Total Rents</Text>
                                <Text style={styles.statValue}>{customerRents?.length || 0}</Text>
                            </View>
                        </ModernCard>

                        <ModernCard gradient gradientColors={COLORS.secondary.start ? [COLORS.secondary.start, COLORS.secondary.end] : [COLORS.secondary.solid, COLORS.secondary.solid]} style={styles.statCard}>
                            <View style={styles.statContent}>
                                <Text style={styles.statTitle}>Active Rents</Text>
                                <Text style={styles.statValue}>{activeRents?.length || 0}</Text>
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
    background: {
        flex: 1,
        width: '100%',
    },
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
    statsContainer: {
        flexDirection: 'row',
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
