import { apiSlice } from './apiSlice'

import { logOut, setCredentials } from '@/store/slices/authSlice'

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        login: builder.mutation({
            query: data => ({
                url: '/auth',
                method: 'POST',
                body: { ...data },
            })
        }),
        forgot: builder.mutation({
            query: data => ({
                url: '/auth/forgot-password',
                method: 'POST',
                body: { ...data },
            })
        }),
        reset: builder.mutation({
            query: data => ({
                url: '/auth/reset-password',
                method: 'POST',
                body: { ...data },
            })
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                await queryFulfilled

                dispatch(logOut())
                setTimeout(() => {
                    dispatch(apiSlice.util.resetApiState())
                }, 1000)
            }
        }),
        refresh: builder.mutation({
            query: () => ({
                url: '/auth/refresh',
                method: 'GET',
            }),
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    const { data } = await queryFulfilled,
                        { accessToken } = data
                    dispatch(setCredentials({ accessToken }))
                } catch (err) {
                    console.log(err)
                }
            }
        })
    })
})

export const {
    useLoginMutation,
    useLogoutMutation,
    useRefreshMutation,
} = authApiSlice