import React, { useEffect, useCallback, useMemo, useState } from 'react'
import {
    View,
    SafeAreaView,
    StyleSheet,
    BackHandler,
    FlatList,
    TextInput,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useRouter } from 'expo-router'

import { COLORS } from '@/constants'
import { useGetCarsQuery } from '@/apis/carsApi'

import ActivityIndicator from '@/components/ActivityIndicator'
import Card from '@/components/Card'
import GradientBackground from '@/components/ui/GradientBackground'
import ModernCard from '@/components/ui/ModernCard'

const Feeds = () => {
    const navigation = useNavigation()
    const router = useRouter()
    const { data: cars, isLoading } = useGetCarsQuery('Cars')
    const [searchTerm, setSearchTerm] = useState('')

    const newCars = useMemo(
        () => Object.values(cars?.entities || {}),
        [cars]
    )

    const sortedCars = useMemo(() => {
        return [...newCars].sort((a, b) => {
            const dateA = new Date(a.createdAt)
            const dateB = new Date(b.createdAt)
            return dateB - dateA
        })
    }, [newCars])

    const filteredCars = useMemo(() => {
        if (!searchTerm) return sortedCars
        const lowerSearch = searchTerm.toLowerCase()
        return sortedCars.filter((car) => {
            const { name, make, model, priceperday } = car
            return (
                (name && name.toLowerCase().includes(lowerSearch)) ||
                (make && make.toLowerCase().includes(lowerSearch)) ||
                (model && model.toLowerCase().includes(lowerSearch)) ||
                (priceperday &&
                    priceperday.toString().toLowerCase().includes(lowerSearch))
            )
        })
    }, [sortedCars, searchTerm])

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
            return () =>
                BackHandler.removeEventListener('hardwareBackPress', onBackPress)
        }, [])
    )

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GradientBackground colors={COLORS.background.light}>
                <SafeAreaView style={styles.container}>
                    <ModernCard style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchBar}
                            placeholder='Search cars by name, make, model...'
                            placeholderTextColor={COLORS.neutral.medium}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                    </ModernCard>
                    
                    <View style={styles.contentContainer}>
                        <ActivityIndicator visible={isLoading} />
                        <FlatList
                            data={filteredCars}
                            keyExtractor={(item) => item?.id?.toString()}
                            numColumns={1}
                            renderItem={({ item }) => (
                                <Card
                                    name={item?.name || ''}
                                    pricePerDay={item?.priceperday || 0}
                                    availability={item?.availability}
                                    image={item?.images}
                                    onPress={() => router.push({
                                        pathname: '/(auths)/car-details',
                                        params: {
                                            id: item?.id
                                        }
                                    })}
                                />
                            )}
                            contentContainerStyle={styles.flatListContainer}
                            showsVerticalScrollIndicator={false}
                        />
                    </View>
                </SafeAreaView>
            </GradientBackground>
        </GestureHandlerRootView>
    )
}

export default Feeds

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    searchContainer: {
        marginBottom: 16,
        padding: 0,
    },
    searchBar: {
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        color: COLORS.neutral.dark,
    },
    contentContainer: {
        flex: 1,
    },
    flatListContainer: {
        paddingBottom: 20,
    },
    detailsContainer: {
        padding: 20,
    },
    image: {
        width: '100%',
        height: 300,
    },
    price: {
        color: COLORS.secondary.solid,
        fontWeight: 'bold',
        fontSize: 20,
        marginVertical: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '500',
        color: COLORS.neutral.dark,
    },
    userContainer: {
        marginVertical: 40,
    },
})
