import React, { useState } from 'react'
import { StyleSheet, Text, TouchableOpacity, Platform } from 'react-native'
import DateTimePickerAndroid from '@react-native-community/datetimepicker'
import { useFormikContext } from 'formik'

import defaultStyles from '@/config/styles'
import ErrorMessage from './ErrorMessage'

const Datepicker = ({ name, width = '100%', placeholder, ...otherProps }) => {
    const { setFieldTouched, setFieldValue, errors, touched, values } = useFormikContext()
    const [show, setShow] = useState(false)

    const currentDate = values[name] ? new Date(values[name]) : new Date()

    const onChange = (event, selectedDate) => {
        if (Platform.OS === 'android') {
            setShow(false)
        }
        if (selectedDate) {
            setFieldValue(name, selectedDate.toISOString())
        }
    }

    return (
        <>
            <TouchableOpacity
                onPress={() => {
                    setShow(true)
                    setFieldTouched(name)
                }}
                style={[styles.container, { width }]}
            >
                <Text
                    style={[
                        defaultStyles.text,
                        { color: values[name] ? 'black' : defaultStyles.colors.medium }
                    ]}
                >
                    {values[name]
                        ? new Date(values[name]).toLocaleDateString()
                        : placeholder || 'Select Date'}
                </Text>
            </TouchableOpacity>
            {show && (
                <DateTimePickerAndroid
                    value={currentDate}
                    mode='date'
                    display='default'
                    onChange={onChange}
                    maximumDate={new Date()}
                    {...otherProps}
                />
            )}
            <ErrorMessage error={errors[name]} visible={touched[name]} />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: defaultStyles.colors.light,
        borderRadius: 8,
        padding: 15,
        marginVertical: 10,
        justifyContent: 'center',
    },
})

export default Datepicker
