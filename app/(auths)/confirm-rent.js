import React from 'react'
import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { images } from '@/constants'
import { useGetCarsQuery } from '@/apis/carsApi'

import RentConfirmation from '@/screens/Rents/ConfirmRent'

const ConfirmRent = () => {
    const { id } = useLocalSearchParams()
    const { car } = useGetCarsQuery('Cars', {
        selectFromResult: ({ data }) => ({
            car: data?.entities[id]
        })
    })
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={images.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <RentConfirmation car={car} />
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default ConfirmRent

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },

})
