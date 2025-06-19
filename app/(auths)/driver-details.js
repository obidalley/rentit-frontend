import React from 'react'
import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { images } from '@/constants'
import { useGetDriversQuery } from '@/apis/driversApi'

import Driver from '@/screens/Drivers/Driver'

const DriverDetails = () => {
    const { id } = useLocalSearchParams()
    const { driver } = useGetDriversQuery('Drivers', {
        selectFromResult: ({ data }) => ({
            driver: data?.entities[id]
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
                    <Driver driver={driver} />
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default DriverDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
})
