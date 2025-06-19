import { createSlice } from '@reduxjs/toolkit'

const messageSlice = createSlice({
    name: 'message',
    initialState: {
        status: false,
        type: null,
        text: '',
        title: ''
    },
    reducers: {
        setMessage: (state, action) => {
            const { status, type, text, title } = action.payload
            state.status = status
            state.type = type
            state.text = text
            state.title = title
        },
        resetMessage: (state, action) => {
            state.status = false
            state.type = null
            state.text = ''
            state.title = ''
        },
    }
})

export const { setMessage, resetMessage } = messageSlice.actions

export default messageSlice.reducer

export const selectCurrentMessage = state => state.message