import React, { useState } from 'react'
import {
    StyleSheet
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { COLORS } from '@/constants'

import GradientBackground from '@/components/ui/GradientBackground'
import Drivers from './Drivers'
import NewDriver from './NewDriver'
import EditDriver from './EditDriver'

const DriversListing = () => {
    const [mode, setMode] = useState('View')
    const [selectedDriver, setSelectedDriver] = useState(null)

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <GradientBackground colors={COLORS.background.primary}>
                {mode === 'View' && (
                    <Drivers
                        selectedDriver={selectedDriver}
                        onSelectDriver={(driver) => setSelectedDriver(driver)}
                        changeMode={(mode) => setMode(mode)}
                    />
                )}
                {mode === 'New' && <NewDriver changeMode={(mode) => setMode(mode)} />}
                {mode === 'Edit' && <EditDriver selectedDriver={selectedDriver} changeMode={(mode) => setMode(mode)} />}
            </GradientBackground>
        </GestureHandlerRootView>
    )
}

export default DriversListing

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
})
