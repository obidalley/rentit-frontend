import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'

import { apiSlice } from '../apis/apiSlice'
import authSlice from '../store/slices/authSlice'
import messageSlice from '../store/slices/messageSlice'
import spinnerSlice from '../store/slices/spinnerSlice'

export const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authSlice,
        message: messageSlice,
        spinner: spinnerSlice,
    },
    middleware: getDefaultMiddleware => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true,
})

setupListeners(store.dispatch)