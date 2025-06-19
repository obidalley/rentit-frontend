import React from 'react'
import { View, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native'

import Text from './Text'
import { images } from '@/constants'
import { BASE_URL } from '@/constants'

const Card = ({ name, pricePerDay, image, availability, onPress }) => {
  const formattedPrice = Number(pricePerDay).toLocaleString()
  const url = image && image.length > 0 ? `${BASE_URL}/images/uploads/${image[0]}` : null

  return (
    <TouchableWithoutFeedback onPress={onPress}>
      <View style={styles.card}>
        <View style={styles.detailsContainer}>
          <Text style={styles.itemText}>
            <Text style={styles.label}>Name:</Text> {name}
          </Text>
          <Text style={styles.itemText}>
            <Text style={styles.label}>Price Per Day:</Text> ₦{formattedPrice}
          </Text>
          <Text style={styles.itemText}>
            <Text style={styles.label}>Availability:</Text>
          </Text>
          <View
            style={[
              styles.availabilityTag,
              availability ? styles.available : styles.unavailable
            ]}
          >
            <Text style={styles.availabilityText}>
              {availability ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={url ? { uri: url } : images.screen}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 15,
    borderColor: 'white',
    borderWidth: 0.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginBottom: 20,
    overflow: 'hidden',
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 6,
    paddingLeft: 10,
    paddingVertical: 4
  },
  imageContainer: {
    flex: 4,
    height: '100%',
    width: '100%',
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15
  },
  itemText: {
    fontSize: 14,
    color: 'black',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
  availabilityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
  },
  available: {
    backgroundColor: 'green',
  },
  unavailable: {
    backgroundColor: 'red',
  },
  availabilityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  image: {
    width: '100%',
    height: 140,
    borderTopRightRadius: 15,
    borderBottomRightRadius: 15
  },
})

export default Card
