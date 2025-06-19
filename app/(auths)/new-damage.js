import React from 'react'
import {
    ImageBackground,
    SafeAreaView,
    StyleSheet,
} from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { images } from '@/constants'
import NewDamage from '@/screens/Damages/NewDamage'

const NewDamageScreen = () => {
    const { rent } = useLocalSearchParams()
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={images.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <NewDamage rent={rent} />
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default NewDamageScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },

})
