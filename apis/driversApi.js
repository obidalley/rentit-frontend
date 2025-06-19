import { createSelector, createEntityAdapter } from '@reduxjs/toolkit'

import { apiSlice } from './apiSlice'

// Create an entity adapter for drivers.
const driversAdapter = createEntityAdapter({})
const initialState = driversAdapter.getInitialState()

export const driversApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDrivers: builder.query({
            query: () => ({
                url: '/drivers',
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

                // Add a sequential number (sn) and copy _id to id for each driver
                let count = 1
                const loadedDrivers = sortedData?.map((driver) => {
                    driver.id = driver._id
                    driver.sn = count++
                    return driver
                })

                // Normalize the data using the entity adapter
                return driversAdapter.setAll(initialState, loadedDrivers)
            },
            providesTags: (result, error, arg) => {
                // Provide a LIST tag and individual tags for each driver id if available
                if (result?.ids) {
                    return [
                        { type: 'Drivers', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Drivers', id })),
                    ]
                }
                return [{ type: 'Drivers', id: 'LIST' }]
            },
        }),
        addNewDriver: builder.mutation({
            query: (initialDriverData) => {
                return {
                    url: '/drivers',
                    method: 'POST',
                    body: { ...initialDriverData },
                }
            },
            // Invalidate the entire list so the new record appears in the next query
            invalidatesTags: () => [{ type: 'Drivers', id: 'LIST' }],
        }),
        updateDriver: builder.mutation({
            query: (initialDriverData) => ({
                url: '/drivers',
                method: 'PATCH',
                body: { ...initialDriverData },
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Drivers', id: arg.id }],
        }),
        deleteDriver: builder.mutation({
            query: ({ id }) => ({
                url: `/drivers/${id}`,
                method: 'DELETE',
            }),
            // Invalidate the list so that the deleted record is removed from the cache
            invalidatesTags: () => [{ type: 'Drivers', id: 'LIST' }],
        }),
        deleteDrivers: builder.mutation({
            query: () => ({
                url: '/drivers',
                method: 'DELETE',
            }),
            invalidatesTags: () => [{ type: 'Drivers', id: 'LIST' }],
        }),
    }),
})

export const {
    useGetDriversQuery,
    useAddNewDriverMutation,
    useUpdateDriverMutation,
    useDeleteDriverMutation,
    useDeleteDriversMutation,
} = driversApiSlice

// Returns the query result object
export const selectDriverResult = apiSlice.endpoints.getDrivers.select()

// Create a memoized selector to extract the normalized drivers state (ids & entities)
const selectDriverData = createSelector(
    selectDriverResult,
    (driverResult) => driverResult.data
)

// Generate entity selectors using the adapter's getSelectors method
export const {
    selectAll: selectAllDrivers,
    selectById: selectDriverById,
    selectIds: selectDriverIds,
} = driversAdapter.getSelectors((state) =>
    selectDriverData(state) ?? initialState
)