import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const Rating = ({ rating, maxRating = 5, size = 30, onRatingChange }) => {
    const roundedRating = Math.round(rating)
    let stars = []
    for (let i = 0; i < maxRating; i++) {
        const star = (
            <Text
                style={{
                    fontSize: size,
                    color: i < roundedRating ? 'gold' : '#9CA3AF',
                    marginRight: 0.5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                }}>
                ★
            </Text>
        )
        if (onRatingChange) {
            stars.push(
                <TouchableOpacity key={i} onPress={() => onRatingChange(i + 1)}>
                    {star}
                </TouchableOpacity>
            )
        } else {
            stars.push(<View key={i}>{star}</View>)
        }
    }
    return <View style={{ flexDirection: 'row' }}>{stars}</View>
}

export default Rating