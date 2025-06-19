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
import { useGetNotificationsQuery } from '@/apis/notificationsApi'

//import Notification from '@/screens/Notifications/Notification'

const NotificationDetails = () => {
    /* const { id } = useLocalSearchParams()
    const { notification } = useGetNotificationsQuery('Notifications', {
        selectFromResult: ({ data }) => ({
            notification: data?.entities[id]
        })
    }) */
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={images.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                <SafeAreaView style={styles.container}>
                    {/* <Notification notification={notification} /> */}
                    <Text style={{ color: 'white' }}>Welcome to the notifications screen</Text>
                </SafeAreaView>
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default NotificationDetails

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
    },

})
