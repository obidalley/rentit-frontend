import React from 'react'
import { useFormikContext } from 'formik'

import Button from '../ui/Buttons/Button'

function SubmitButton({ title, color }) {
  const { handleSubmit } = useFormikContext()

  return <Button title={title} color={color} onPress={handleSubmit} />
}

export default SubmitButton
