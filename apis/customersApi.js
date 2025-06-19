import { createSelector, createEntityAdapter } from '@reduxjs/toolkit'

import { apiSlice } from './apiSlice'

// Create an entity adapter for customers.
const customersAdapter = createEntityAdapter({})
const initialState = customersAdapter.getInitialState()

export const customersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCustomers: builder.query({
            query: () => ({
                url: '/customers',
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

                // Add a sequential number (sn) and copy _id to id for each customer
                let count = 1
                const loadedCustomers = sortedData?.map((customer) => {
                    customer.id = customer._id
                    customer.sn = count++
                    return customer
                })

                // Normalize the data using the entity adapter
                return customersAdapter.setAll(initialState, loadedCustomers)
            },
            providesTags: (result, error, arg) => {
                // Provide a LIST tag and individual tags for each customer id if available
                if (result?.ids) {
                    return [
                        { type: 'Customers', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Customers', id })),
                    ]
                }
                return [{ type: 'Customers', id: 'LIST' }]
            },
        }),
        addNewCustomer: builder.mutation({
            query: (initialCustomerData) => ({
                url: '/customers',
                method: 'POST',
                body: { ...initialCustomerData },
            }),
            // Invalidate the entire list so the new record appears in the next query
            invalidatesTags: () => [{ type: 'Customers', id: 'LIST' }],
        }),
        updateCustomer: builder.mutation({
            query: (initialCustomerData) => ({
                url: '/customers',
                method: 'PATCH',
                body: { ...initialCustomerData },
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Customers', id: arg.id }],
        }),
        deleteCustomer: builder.mutation({
            query: ({ id }) => ({
                url: `/customers/${id}`,
                method: 'DELETE',
            }),
            // Invalidate the list so that the deleted record is removed from the cache
            invalidatesTags: () => [{ type: 'Customers', id: 'LIST' }],
        }),
        deleteCustomers: builder.mutation({
            query: () => ({
                url: '/customers',
                method: 'DELETE',
            }),
            invalidatesTags: () => [{ type: 'Customers', id: 'LIST' }],
        }),
    }),
})

export const {
    useGetCustomersQuery,
    useAddNewCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation,
    useDeleteCustomersMutation,
} = customersApiSlice

// Returns the query result object
export const selectCustomerResult = apiSlice.endpoints.getCustomers.select()

// Create a memoized selector to extract the normalized customers state (ids & entities)
const selectCustomerData = createSelector(
    selectCustomerResult,
    (customerResult) => customerResult.data
)

// Generate entity selectors using the adapter's getSelectors method
export const {
    selectAll: selectAllCustomers,
    selectById: selectCustomerById,
    selectIds: selectCustomerIds,
} = customersAdapter.getSelectors((state) =>
    selectCustomerData(state) ?? initialState
)
