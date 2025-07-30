import React, { useState } from 'react'
import { StyleSheet } from 'react-native'

import { COLORS } from '@/constants'
import GradientBackground from '@/components/ui/GradientBackground'

import Damages from './Damages'
import EditDamage from './EditDamage'

const DamagesListing = () => {
    const [mode, setMode] = useState('View')
    const [selectedDamage, setSelectedDamage] = useState(null)

    return (
        <GradientBackground colors={COLORS.background.light}>
            {mode === 'View' && (
                <Damages
                    selectedDamage={selectedDamage}
                    onSelectDamage={(damage) => setSelectedDamage(damage)}
                    changeMode={(mode) => setMode(mode)}
                />
            )}
            {mode === 'Edit' && <EditDamage selectedDamage={selectedDamage} changeMode={(mode) => setMode(mode)} />}
        </GradientBackground>
    )
}

export default DamagesListing

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
    },
})
