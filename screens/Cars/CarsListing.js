import React, { useState } from 'react'
import {
    StyleSheet,
    ImageBackground,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { images } from '@/constants'

import Cars from './Cars'
import NewCar from './NewCar'
import Car from './Car'
import EditCar from './EditCar'

const CarsListing = () => {
    const [mode, setMode] = useState('View')
    const [selectedCar, setSelectedCar] = useState(null)

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={images.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                {mode === 'View' && (
                    <Cars
                        selectedCar={selectedCar}
                        onSelectCar={(car) => setSelectedCar(car)}
                        changeMode={(mode) => setMode(mode)}
                    />
                )}
                {mode === 'New' && <NewCar changeMode={(mode) => setMode(mode)} />}
                {mode === 'Details' && <Car car={selectedCar} onBack={(mode) => setMode(mode)} />}
                {mode === 'Edit' && <EditCar selectedCar={selectedCar} changeMode={(mode) => setMode(mode)} />}
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default CarsListing

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 10,
    },
})
