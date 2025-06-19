import React from 'react'
import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { images } from '@/constants'
import { useGetCustomersQuery } from '@/apis/customersApi'

import Customer from '@/screens/Customers/Customer'

const CustomerDetails = () => {
    const { id } = useLocalSearchParams()
    const { customer } = useGetCustomersQuery('Customers', {
        selectFromResult: ({ data }) => ({
            customer: data?.entities[id]
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
                    <Customer customer={customer} />
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default CustomerDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },
})
