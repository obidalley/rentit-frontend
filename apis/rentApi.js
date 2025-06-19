import { createSelector, createEntityAdapter } from '@reduxjs/toolkit'

import { apiSlice } from './apiSlice'

// Create an entity adapter for rents.
const rentsAdapter = createEntityAdapter({})
const initialState = rentsAdapter.getInitialState()

export const rentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getRents: builder.query({
            query: () => ({
                url: '/rents',
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

                // Add a sequential number (sn) and copy _id to id for each rent
                let count = 1
                const loadedRents = sortedData?.map((rent) => {
                    rent.id = rent._id
                    rent.sn = count++
                    return rent
                })

                // Normalize the data using the entity adapter
                return rentsAdapter.setAll(initialState, loadedRents)
            },
            providesTags: (result, error, arg) => {
                // Provide a LIST tag and individual tags for each rent id if available
                if (result?.ids) {
                    return [
                        { type: 'Rents', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Rents', id })),
                    ]
                }
                return [{ type: 'Rents', id: 'LIST' }]
            },
        }),
        addNewRent: builder.mutation({
            query: (initialRentData) => {
                return {
                    url: '/rents',
                    method: 'POST',
                    body: { ...initialRentData },
                }
            },
            // Invalidate the entire list so the new record appears in the next query
            invalidatesTags: () => [{ type: 'Rents', id: 'LIST' }],
        }),
        updateRent: builder.mutation({
            query: (initialRentData) => ({
                url: '/rents',
                method: 'PATCH',
                body: { ...initialRentData },
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Rents', id: arg.id }],
        }),
        deleteRent: builder.mutation({
            query: ({ id }) => ({
                url: `/rents/${id}`,
                method: 'DELETE',
            }),
            // Invalidate the list so that the deleted record is removed from the cache
            invalidatesTags: () => [{ type: 'Rents', id: 'LIST' }],
        }),
        deleteRents: builder.mutation({
            query: () => ({
                url: '/rents',
                method: 'DELETE',
            }),
            invalidatesTags: () => [{ type: 'Rents', id: 'LIST' }],
        }),
    }),
})

export const {
    useGetRentsQuery,
    useAddNewRentMutation,
    useUpdateRentMutation,
    useDeleteRentMutation,
    useDeleteRentsMutation,
} = rentsApiSlice

// Returns the query result object
export const selectRentResult = apiSlice.endpoints.getRents.select()

// Create a memoized selector to extract the normalized rents state (ids & entities)
const selectRentData = createSelector(
    selectRentResult,
    (rentResult) => rentResult.data
)

// Generate entity selectors using the adapter's getSelectors method
export const {
    selectAll: selectAllRents,
    selectById: selectRentById,
    selectIds: selectRentIds,
} = rentsAdapter.getSelectors((state) =>
    selectRentData(state) ?? initialState
)