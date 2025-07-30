import React from 'react'
import { useFormikContext } from 'formik'

import ImageInput from '../ImageInput'
import ErrorMessage from './ErrorMessage'

const FormImagePicker = ({ name }) => {
  const { errors, setFieldValue, touched, values } = useFormikContext()

  const imageUris = values[name] || []

  const handleAdd = (uri) => {
    setFieldValue(name, [...imageUris, uri])
  }

  const handleRemove = (uri) => {
    setFieldValue(name, imageUris.filter((imageUri) => imageUri !== uri))
  }

  return (
    <>
      <ImageInput
        imageUris={imageUris}
        onChangeImages={(uris) => setFieldValue(name, uris)}
      />
      <ErrorMessage error={errors[name]} visible={touched[name]} />
    </>
  )
}

export default FormImagePicker