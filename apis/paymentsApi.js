import { createSelector, createEntityAdapter } from '@reduxjs/toolkit'

import { apiSlice } from './apiSlice'

// Create an entity adapter for payments.
const paymentsAdapter = createEntityAdapter({})
const initialState = paymentsAdapter.getInitialState()

export const paymentsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPayments: builder.query({
            query: () => ({
                url: '/payments',
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

                // Add a sequential number (sn) and copy _id to id for each payment
                let count = 1
                const loadedPayments = sortedData?.map((payment) => {
                    payment.id = payment._id
                    payment.sn = count++
                    return payment
                })

                // Normalize the data using the entity adapter
                return paymentsAdapter.setAll(initialState, loadedPayments)
            },
            providesTags: (result, error, arg) => {
                // Provide a LIST tag and individual tags for each payment id if available
                if (result?.ids) {
                    return [
                        { type: 'Payments', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Payments', id })),
                    ]
                }
                return [{ type: 'Payments', id: 'LIST' }]
            },
        }),
        addNewPayment: builder.mutation({
            query: (initialPaymentData) => {
                return {
                    url: '/payments',
                    method: 'POST',
                    body: { ...initialPaymentData },
                }
            },
            // Invalidate the entire list so the new record appears in the next query
            invalidatesTags: () => [{ type: 'Payments', id: 'LIST' }],
        }),
        deletePayment: builder.mutation({
            query: ({ id }) => ({
                url: `/payments/${id}`,
                method: 'DELETE',
            }),
            // Invalidate the list so that the deleted record is removed from the cache
            invalidatesTags: () => [{ type: 'Payments', id: 'LIST' }],
        }),
        deletePayments: builder.mutation({
            query: () => ({
                url: '/payments',
                method: 'DELETE',
            }),
            invalidatesTags: () => [{ type: 'Payments', id: 'LIST' }],
        }),
    }),
})

export const {
    useGetPaymentsQuery,
    useAddNewPaymentMutation,
    useDeletePaymentMutation,
    useDeletePaymentsMutation,
} = paymentsApiSlice

// Returns the query result object
export const selectPaymentResult = apiSlice.endpoints.getPayments.select()

// Create a memoized selector to extract the normalized payments state (ids & entities)
const selectPaymentData = createSelector(
    selectPaymentResult,
    (paymentResult) => paymentResult.data
)

// Generate entity selectors using the adapter's getSelectors method
export const {
    selectAll: selectAllPayments,
    selectById: selectPaymentById,
    selectIds: selectPaymentIds,
} = paymentsAdapter.getSelectors((state) =>
    selectPaymentData(state) ?? initialState
)