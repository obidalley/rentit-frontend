import React, { useEffect, useCallback, useMemo } from 'react'
import {
    View,
    BackHandler,
    Text,
    StyleSheet,
    ImageBackground,
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

import { images } from '@/constants'
import { useGetRentsQuery } from '@/apis/rentApi'
import useAuth from '@/hooks/useAuth'

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
            <ImageBackground
                source={images.screen}
                blurRadius={80}
                resizeMode="cover"
                style={styles.background}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.subHeader}>Stats</Text>

                    <View style={styles.statsContainer}>
                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.statTitle}>Total Rents</Text>
                                <Text style={styles.statValue}>{customerRents?.length || 0}</Text>
                            </Card.Content>
                        </Card>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Text style={styles.statTitle}>Active Rents</Text>
                                <Text style={styles.statValue}>{activeRents?.length || 0}</Text>
                            </Card.Content>
                        </Card>
                    </View>

                    <View style={styles.sectionSeparator} />

                    <Text style={styles.subHeader}>Rental Trends</Text>
                    <LineChart
                        data={{
                            labels: ['Ja', 'Fe', 'Ma', 'Ap', 'My', 'Ju', 'Jl', 'Au', 'Se', 'Oc', 'No', 'Dc'],
                            datasets: [
                                {
                                    data: monthlyData,
                                },
                            ],
                        }}
                        width={screenWidth - 32}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#e26a00',
                            backgroundGradientFrom: '#fb8c00',
                            backgroundGradientTo: '#ffa726',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                            style: {
                                borderRadius: 16,
                            },
                        }}
                        style={{
                            marginVertical: 8,
                            borderRadius: 16,
                            alignSelf: 'center',
                        }}
                    />

                    <View style={styles.sectionSeparator} />

                    <Text style={styles.subHeader}>Recent Bookings</Text>

                    <View style={styles.bookingList}>
                        <FlatList
                            data={formattedRents}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <View style={styles.bookingItem}>
                                    <Text style={styles.bookingText}>{item.bookingcode}</Text>
                                    <View style={styles.bookingRow}>
                                        <Text style={styles.dateText}>{dayjs(item.date).fromNow()}</Text>
                                        <View style={[styles.statusTag, getStatusStyle(item.status)]}>
                                            <Text style={styles.statusText}>{item.status}</Text>
                                        </View>
                                    </View>
                                </View>
                            )}
                            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
                            nestedScrollEnabled={true}
                            scrollEnabled={false}
                            contentContainerStyle={{ paddingBottom: 16 }}
                        />
                    </View>
                </ScrollView>
            </ImageBackground>
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
        fontSize: 26,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
        color: 'white',
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        marginBottom: 16,
        elevation: 4,
        backgroundColor: '#fff',
    },
    statTitle: {
        fontSize: 16,
        color: '#555',
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 4,
    },
    subHeader: {
        fontSize: 20,
        fontWeight: '600',
        marginVertical: 12,
        color: 'white',
    },
    sectionSeparator: {
        height: 1,
        backgroundColor: 'white'
    },
    bookingList: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        elevation: 2,
        marginBottom: 16,
    },
    bookingItem: {
        paddingVertical: 8,
    },
    bookingText: {
        fontSize: 16,
        fontWeight: '500',
    },
    bookingSubText: {
        fontSize: 14,
        color: '#777',
        marginTop: 2,
    },
    bookingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    statusTag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        fontSize: 12,
        color: '#777',
    },
    itemSeparator: {
        height: 1,
        backgroundColor: '#eee',
        marginVertical: 4,
    },
})
