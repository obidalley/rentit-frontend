import { createSlice } from '@reduxjs/toolkit'

const spinnerSlice = createSlice({
    name: 'spinner',
    initialState: {
        visible: false
    },
    reducers: {
        setSpinner: (state, action) => {
            const { visibility } = action.payload
            state.visible = visibility
        },
    }
})

export const { setSpinner } = spinnerSlice.actions

export default spinnerSlice.reducer

export const selectCurrentSpinner = state => state.spinner.visible