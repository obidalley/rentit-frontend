import React from 'react'
import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { images as bgimages } from '@/constants'
import { useGetCarsQuery } from '@/apis/carsApi'

import Car from '@/screens/Cars/Car'

const CarDetails = () => {
    const { id } = useLocalSearchParams()
    const { car } = useGetCarsQuery('Cars', {
        selectFromResult: ({ data }) => ({
            car: data?.entities[id]
        })
    })
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={bgimages.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <Car car={car} />
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default CarDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
})
