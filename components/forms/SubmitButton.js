import React from 'react'
import { useFormikContext } from 'formik'

import ModernButton from '../ui/Buttons/ModernButton'

function SubmitButton({ title, variant = 'primary', size = 'large', ...props }) {
  const { handleSubmit, isSubmitting } = useFormikContext()

  return (
    <ModernButton 
      title={title} 
      variant={variant}
      size={size}
      loading={isSubmitting}
      onPress={handleSubmit}
      {...props}
    />
  )
}

export default SubmitButton
