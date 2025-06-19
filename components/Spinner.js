import React from 'react'
import { View, ActivityIndicator, StyleSheet } from 'react-native'

const Spinner = ({ color = '#fff', size = 'large' }) => {
    return (
        <View style={styles.backdrop}>
            <ActivityIndicator size={size} color={color} />
        </View>
    )
}

const styles = StyleSheet.create({
    backdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
})

export default Spinner
