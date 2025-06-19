import React from 'react'
import {
    View,
    SafeAreaView,
    StyleSheet,
    ImageBackground,
    Text,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import { images } from '@/constants'

const RentsScreen = () => {

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={images.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                <SafeAreaView style={styles.container}>
                    <View>
                        <Text style={styles.title}>Welcome to rents screen</Text>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default RentsScreen

const styles = StyleSheet.create({
    background: {
        height: '100%',
        width: '100%',
    },
    container: {
        padding: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: '500',
        color: 'white',
    },
})
