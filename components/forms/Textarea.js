import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'
import { useFormikContext } from 'formik'

import defaultStyles from '@/config/styles'
import ErrorMessage from './ErrorMessage'

const Textarea = ({ name, width = '100%', numberOfLines = 4, placeholder, ...otherProps }) => {
    const { setFieldTouched, setFieldValue, errors, touched, values } = useFormikContext()
    return (
        <>
            <View style={[styles.container, { width }]}>
                <TextInput
                    onBlur={() => setFieldTouched(name)}
                    onChangeText={text => setFieldValue(name, text)}
                    value={values[name]}
                    placeholder={placeholder}
                    placeholderTextColor={defaultStyles.colors.medium}
                    style={[defaultStyles.text, styles.textArea]}
                    multiline
                    numberOfLines={numberOfLines}
                    {...otherProps}
                />

            </View>
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
    },
    textArea: {
        height: 60,
        textAlignVertical: 'top',
    },
})

export default Textarea
