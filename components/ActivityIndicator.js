import React from 'react'
import LottieView from 'lottie-react-native'

const ActivityIndicator = ({ visible = false }) => {
    if (!visible) return null

    return (
        <LottieView
            source={require('../assets/animations/loader.json')}
        />
    )
}


export default ActivityIndicator