import { createSelector, createEntityAdapter } from '@reduxjs/toolkit'

import { apiSlice } from './apiSlice'

// Create an entity adapter for notifications.
const notificationsAdapter = createEntityAdapter({})
const initialState = notificationsAdapter.getInitialState()

export const notificationsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getNotifications: builder.query({
            query: () => ({
                url: '/notifications',
                validateStatus: (response, result) =>
                    response.status === 200 && !result.isError,
            }),
            transformResponse: (responseData) => {
                // Extract and sort the data (descending based on parsed hexadecimal _id)
                const sortedData = responseData?.data
                sortedData?.sort((a, b) => {
                    const idA = parseInt(a._id, 16)
                    const idB = parseInt(b._id, 16)
                    return idB - idA
                })

                // Add a sequential number (sn) and copy _id to id for each notification
                let count = 1
                const loadedNotifications = sortedData?.map((notification) => {
                    notification.id = notification._id
                    notification.sn = count++
                    return notification
                })

                // Normalize the data using the entity adapter
                return notificationsAdapter.setAll(initialState, loadedNotifications)
            },
            providesTags: (result, error, arg) => {
                // Provide a LIST tag and individual tags for each notification id if available
                if (result?.ids) {
                    return [
                        { type: 'Notifications', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Notifications', id })),
                    ]
                }
                return [{ type: 'Notifications', id: 'LIST' }]
            },
        }),
        addNewNotification: builder.mutation({
            query: (initialNotificationData) => {
                return {
                    url: '/notifications',
                    method: 'POST',
                    body: { ...initialNotificationData },
                }
            },
            // Invalidate the entire list so the new record appears in the next query
            invalidatesTags: () => [{ type: 'Notifications', id: 'LIST' }],
        }),
        deleteNotification: builder.mutation({
            query: ({ id }) => ({
                url: `/notifications/${id}`,
                method: 'DELETE',
            }),
            // Invalidate the list so that the deleted record is removed from the cache
            invalidatesTags: () => [{ type: 'Notifications', id: 'LIST' }],
        }),
        deleteNotifications: builder.mutation({
            query: () => ({
                url: '/notifications',
                method: 'DELETE',
            }),
            invalidatesTags: () => [{ type: 'Notifications', id: 'LIST' }],
        }),
    }),
})

export const {
    useGetNotificationsQuery,
    useAddNewNotificationMutation,
    useDeleteNotificationMutation,
    useDeleteNotificationsMutation,
} = notificationsApiSlice

// Returns the query result object
export const selectNotificationResult = apiSlice.endpoints.getNotifications.select()

// Create a memoized selector to extract the normalized notifications state (ids & entities)
const selectNotificationData = createSelector(
    selectNotificationResult,
    (notificationResult) => notificationResult.data
)

// Generate entity selectors using the adapter's getSelectors method
export const {
    selectAll: selectAllNotifications,
    selectById: selectNotificationById,
    selectIds: selectNotificationIds,
} = notificationsAdapter.getSelectors((state) =>
    selectNotificationData(state) ?? initialState
)