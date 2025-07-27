import React, { useState } from 'react'
import {
    StyleSheet,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { COLORS } from '@/constants'

import GradientBackground from '@/components/ui/GradientBackground'
import Cars from './Cars'
import NewCar from './NewCar'
import Car from './Car'
import EditCar from './EditCar'

const CarsListing = () => {
    const [mode, setMode] = useState('View')
    const [selectedCar, setSelectedCar] = useState(null)

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GradientBackground colors={COLORS.background.primary}>
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
            </GradientBackground>
        </GestureHandlerRootView>
    )
}

export default CarsListing

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
})
