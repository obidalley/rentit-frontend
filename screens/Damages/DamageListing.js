import React, { useState } from 'react'
import {
    StyleSheet,
    ImageBackground,
} from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { images } from '@/constants'

import Damages from './Damages'
import EditDamage from './EditDamage'

const DamagesListing = () => {
    const [mode, setMode] = useState('View')
    const [selectedDamage, setSelectedDamage] = useState(null)

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ImageBackground
                source={images.screen}
                blurRadius={30}
                resizeMode='cover'
                style={styles.background}>
                {mode === 'View' && (
                    <Damages
                        selectedDamage={selectedDamage}
                        onSelectDamage={(damage) => setSelectedDamage(damage)}
                        changeMode={(mode) => setMode(mode)}
                    />
                )}
                {mode === 'Edit' && <EditDamage selectedDamage={selectedDamage} changeMode={(mode) => setMode(mode)} />}
            </ImageBackground>
        </GestureHandlerRootView>
    )
}

export default DamagesListing

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    container: {
        flex: 1,
        padding: 10,
    },
})
