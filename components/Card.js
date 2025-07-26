import React from 'react'
import { View, StyleSheet, Image, TouchableWithoutFeedback, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'

import Text from './Text'
import { images, COLORS } from '@/constants'
import { BASE_URL } from '@/constants'
import StatusBadge from './ui/StatusBadge'
import ModernCard from './ui/ModernCard'

const { width } = Dimensions.get('window')

const Card = ({ name, pricePerDay, image, availability, onPress }) => {
  const formattedPrice = Number(pricePerDay).toLocaleString()
  const url = image && image.length > 0 ? `${BASE_URL}/images/uploads/${image[0]}` : null

  return (
    <ModernCard onPress={onPress} style={styles.card}>
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={url ? { uri: url } : images.screen}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.7)']}
          style={styles.imageOverlay}
        />
        <View style={styles.availabilityBadge}>
          <StatusBadge 
            status={availability ? 'Available' : 'Unavailable'} 
            size="small"
          />
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <View style={styles.detailsContainer}>
          <Text style={styles.carName}>{name}</Text>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Price per day</Text>
            <Text style={styles.price}>₦{formattedPrice}</Text>
          </View>
        </View>
        
        <View style={styles.actionContainer}>
          <LinearGradient
            colors={COLORS.primary.start ? [COLORS.primary.start, COLORS.primary.end] : [COLORS.primary.solid, COLORS.primary.solid]}
            style={styles.actionButton}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.actionText}>View Details</Text>
          </LinearGradient>
        </View>
      </View>
    </ModernCard>
  )
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 4,
    marginVertical: 8,
    overflow: 'hidden',
    elevation: 6,
  },
  imageContainer: {
    position: 'relative',
    height: 200,
    width: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  availabilityBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  contentContainer: {
    padding: 16,
  },
  detailsContainer: {
    marginBottom: 12,
  },
  carName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2d3436',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 14,
    color: '#636e72',
    fontWeight: '500',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary.solid,
  },
  actionContainer: {
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
})

export default Card
