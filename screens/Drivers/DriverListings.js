import React, { useState } from 'react'
import {
    StyleSheet,
    ImageBackground,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { images } from '@/constants'

import Drivers from './Drivers'
import NewDriver from './NewDriver'
import EditDriver from './EditDriver'

const DriversListing = () => {
    const [mode, setMode] = useState('View')
    const [selectedDriver, setSelectedDriver] = useState(null)

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={images.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                {mode === 'View' && (
                    <Drivers
                        selectedDriver={selectedDriver}
                        onSelectDriver={(driver) => setSelectedDriver(driver)}
                        changeMode={(mode) => setMode(mode)}
                    />
                )}
                {mode === 'New' && <NewDriver changeMode={(mode) => setMode(mode)} />}
                {mode === 'Edit' && <EditDriver selectedDriver={selectedDriver} changeMode={(mode) => setMode(mode)} />}
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default DriversListing

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 10,
    },
})
