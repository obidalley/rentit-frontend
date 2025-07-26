import React from 'react'
import { View, TextInput, StyleSheet, Platform } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'

import colors from '../config/colors'

const AppTextInput = ({ icon, width = '100%', ...otherProps }) => {
  return (
    <View style={[styles.container, { width }]}>
      {icon && (
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={colors.medium}
          style={styles.icon}
        />
      )}
      <TextInput
        placeholderTextColor={colors.medium}
        style={[styles.text, { width: '100%' }]}
        {...otherProps}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    borderRadius: 12,
    flexDirection: 'row',
    paddingVertical: Platform.OS === 'web' ? 15 : 12,
    paddingHorizontal: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    marginRight: 10,
    marginVertical: 'auto',
  },
  text: {
    color: colors.dark,
    fontSize: 16,
    fontFamily: Platform.OS === 'android' ? 'Roboto' : 'System',
  },
})

export default AppTextInput
