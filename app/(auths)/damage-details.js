import React from 'react'
import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
    Text,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { images } from '@/constants'
import { useGetDamagesQuery } from '@/apis/damagesApi'

import Damage from '@/screens/Damages/Damage'

const DamageDetails = () => {
    const { id } = useLocalSearchParams()
    const { damage } = useGetDamagesQuery('Damages', {
        selectFromResult: ({ data }) => ({
            damage: data?.entities[id]
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
                    <Damage damage={damage} />
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default DamageDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },

})
