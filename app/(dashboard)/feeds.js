import React, { useEffect, useCallback, useMemo, useState } from 'react'
import {
    View,
    SafeAreaView,
    StyleSheet,
    ImageBackground,
    BackHandler,
    FlatList,
    TextInput,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import { useRouter } from 'expo-router'

import colors from '@/config/colors'
import { images } from '@/constants'
import { useGetCarsQuery } from '@/apis/carsApi'

import ActivityIndicator from '@/components/ActivityIndicator'
import Card from '@/components/Card'

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
            <ImageBackground
                source={images.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <View>
                        <ActivityIndicator visible={isLoading} />
                        <TextInput
                            style={styles.searchBar}
                            placeholder='Search Cars...'
                            placeholderTextColor={colors.medium}
                            value={searchTerm}
                            onChangeText={setSearchTerm}
                        />
                        <FlatList
                            data={filteredCars}
                            keyExtractor={(item) => item?.id?.toString()}
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
                        />
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default Feeds

const styles = StyleSheet.create({
    background: {
        height: '100%',
        width: '100%',
    },
    container: {
        padding: 10,
    },
    searchBar: {
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 10,
        marginVertical: 10,
        fontSize: 16,
        backgroundColor: 'rgba(255,255,255,0.6)',
        borderRadius: 5,
        color: 'white',
    },
    flatListContainer: {
        paddingBottom: 100,
    },
    detailsContainer: {
        padding: 20,
    },
    image: {
        width: '100%',
        height: 300,
    },
    price: {
        color: colors.secondary,
        fontWeight: 'bold',
        fontSize: 20,
        marginVertical: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '500',
        color: 'white',
    },
    userContainer: {
        marginVertical: 40,
    },
})
