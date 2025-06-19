import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

import { URL } from '../constants'
import { setCredentials } from '../store/slices/authSlice'

const baseQuery = fetchBaseQuery({
    baseUrl: URL,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const token = getState().auth.token
        if (token) {
            headers.set('authorization', `Bearer ${token}`)
        }
        return headers
    }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions)

    if (result?.error?.status === 403) {
        // Attempt to refresh the access token
        // For mobile clients, send the stored refresh token in a custom header
        const refreshToken = api.getState().auth.refreshToken
        const refreshResult = await baseQuery(
            {
                url: '/auth/refresh',
                method: 'GET',
                headers: refreshToken ? { 'x-refresh-token': refreshToken } : {},
            },
            api,
            extraOptions
        )

        if (refreshResult?.data) {
            // Update auth state with new tokens
            api.dispatch(setCredentials({ ...refreshResult.data }))

            // Retry original query with new access token
            result = await baseQuery(args, api, extraOptions)
        } else {
            if (refreshResult?.error?.status === 403) {
                refreshResult.error.data.message = 'Your login session has expired'
            }
            return refreshResult
        }
    }

    return result
}

export const apiSlice = createApi({
    reducerPath: 'apis',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Users', 'Customers', 'Cars', 'Drivers', 'Rents', 'Damages', 'Notifications', 'Payments'],
    endpoints: (builder) => ({}),
})
