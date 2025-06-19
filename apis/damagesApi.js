import { createSelector, createEntityAdapter } from '@reduxjs/toolkit'
import { apiSlice } from './apiSlice'

const generateUniqueFileName = (uri) => {
    let extension = 'jpg'
    if (uri) {
        const uriParts = uri.split('.')
        if (uriParts.length > 1) {
            extension = uriParts[uriParts.length - 1]
        }
    }
    return `${Date.now()}-${Math.floor(Math.random() * 10000)}.${extension}`
}

// Create an entity adapter for damages.
const damagesAdapter = createEntityAdapter({})
const initialState = damagesAdapter.getInitialState()

export const damagesApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getDamages: builder.query({
            query: () => ({
                url: '/damages',
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

                // Add a sequential number (sn) and copy _id to id for each damage
                let count = 1
                const loadedDamages = sortedData?.map((damage) => {
                    damage.id = damage._id
                    damage.sn = count++
                    return damage
                })

                // Normalize the data using the entity adapter
                return damagesAdapter.setAll(initialState, loadedDamages)
            },
            providesTags: (result, error, arg) => {
                // Provide a LIST tag and individual tags for each damage id if available
                if (result?.ids) {
                    return [
                        { type: 'Damages', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Damages', id })),
                    ]
                }
                return [{ type: 'Damages', id: 'LIST' }]
            },
        }),
        addNewDamage: builder.mutation({
            query: (initialDamageData) => {
                const formData = new FormData()
                formData.append('customer', initialDamageData?.customer)
                formData.append('car', initialDamageData?.car)
                formData.append('rent', initialDamageData?.rent)
                formData.append('description', initialDamageData?.description)
                initialDamageData?.images.forEach(imageUri => {
                    const fileName = generateUniqueFileName(imageUri);
                    formData.append('images', {
                        uri: imageUri,
                        name: fileName,
                        type: 'image/jpeg',
                    })
                })

                return {
                    url: '/damages',
                    method: 'POST',
                    body: formData,
                }
            },
            // Invalidate the entire list so the new record appears in the next query
            invalidatesTags: () => [{ type: 'Damages', id: 'LIST' }],
        }),
        updateDamage: builder.mutation({
            query: (initialDamageData) => ({
                url: '/damages',
                method: 'PATCH',
                body: { ...initialDamageData },
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Damages', id: arg.id }],
        }),
        deleteDamage: builder.mutation({
            query: ({ id }) => ({
                url: `/damages/${id}`,
                method: 'DELETE',
            }),
            // Invalidate the list so that the deleted record is removed from the cache
            invalidatesTags: () => [{ type: 'Damages', id: 'LIST' }],
        }),
        deleteDamages: builder.mutation({
            query: () => ({
                url: '/damages',
                method: 'DELETE',
            }),
            invalidatesTags: () => [{ type: 'Damages', id: 'LIST' }],
        }),
    }),
})

export const {
    useGetDamagesQuery,
    useAddNewDamageMutation,
    useUpdateDamageMutation,
    useDeleteDamageMutation,
    useDeleteDamagesMutation,
} = damagesApiSlice

// Returns the query result object
export const selectDamageResult = apiSlice.endpoints.getDamages.select()

// Create a memoized selector to extract the normalized damages state (ids & entities)
const selectDamageData = createSelector(
    selectDamageResult,
    (damageResult) => damageResult.data
)

// Generate entity selectors using the adapter's getSelectors method
export const {
    selectAll: selectAllDamages,
    selectById: selectDamageById,
    selectIds: selectDamageIds,
} = damagesAdapter.getSelectors((state) =>
    selectDamageData(state) ?? initialState
)