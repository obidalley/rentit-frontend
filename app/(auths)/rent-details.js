import React from 'react'
import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { images } from '@/constants'
import { useGetRentsQuery } from '@/apis/rentApi'

import Rent from '@/screens/Rents/Rent'

const RentDetails = () => {
    const { id } = useLocalSearchParams()
    const { rent } = useGetRentsQuery('Rents', {
        selectFromResult: ({ data }) => ({
            rent: data?.entities[id]
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
                    <Rent rent={rent} />
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default RentDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },

})
