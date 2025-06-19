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

// Create an entity adapter for cars.
const carsAdapter = createEntityAdapter({})
const initialState = carsAdapter.getInitialState()

export const carsApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCars: builder.query({
            query: () => ({
                url: '/cars',
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

                // Add a sequential number (sn) and copy _id to id for each car
                let count = 1
                const loadedCars = sortedData?.map((car) => {
                    car.id = car._id
                    car.sn = count++
                    return car
                })

                // Normalize the data using the entity adapter
                return carsAdapter.setAll(initialState, loadedCars)
            },
            providesTags: (result, error, arg) => {
                // Provide a LIST tag and individual tags for each car id if available
                if (result?.ids) {
                    return [
                        { type: 'Cars', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Cars', id })),
                    ]
                }
                return [{ type: 'Cars', id: 'LIST' }]
            },
        }),
        addNewCar: builder.mutation({
            query: (initialCarData) => {
                const formData = new FormData()
                formData.append('name', initialCarData?.name)
                formData.append('make', initialCarData?.make)
                formData.append('model', initialCarData?.model)
                formData.append('priceperday', initialCarData?.priceperday)
                initialCarData?.images.forEach(imageUri => {
                    const fileName = generateUniqueFileName(imageUri);
                    formData.append('images', {
                        uri: imageUri,
                        name: fileName,
                        type: 'image/jpeg',
                    })
                })

                return {
                    url: '/cars',
                    method: 'POST',
                    body: formData,
                }
            },
            // Invalidate the entire list so the new record appears in the next query
            invalidatesTags: () => [{ type: 'Cars', id: 'LIST' }],
        }),
        updateCar: builder.mutation({
            query: (initialCarData) => ({
                url: '/cars',
                method: 'PATCH',
                body: { ...initialCarData },
            }),
            invalidatesTags: (result, error, arg) => [{ type: 'Cars', id: arg.id }],
        }),
        deleteCar: builder.mutation({
            query: ({ id }) => ({
                url: `/cars/${id}`,
                method: 'DELETE',
            }),
            // Invalidate the list so that the deleted record is removed from the cache
            invalidatesTags: () => [{ type: 'Cars', id: 'LIST' }],
        }),
        deleteCars: builder.mutation({
            query: () => ({
                url: '/cars',
                method: 'DELETE',
            }),
            invalidatesTags: () => [{ type: 'Cars', id: 'LIST' }],
        }),
    }),
})

export const {
    useGetCarsQuery,
    useAddNewCarMutation,
    useUpdateCarMutation,
    useDeleteCarMutation,
    useDeleteCarsMutation,
} = carsApiSlice

// Returns the query result object
export const selectCarResult = apiSlice.endpoints.getCars.select()

// Create a memoized selector to extract the normalized cars state (ids & entities)
const selectCarData = createSelector(
    selectCarResult,
    (carResult) => carResult.data
)

// Generate entity selectors using the adapter's getSelectors method
export const {
    selectAll: selectAllCars,
    selectById: selectCarById,
    selectIds: selectCarIds,
} = carsAdapter.getSelectors((state) =>
    selectCarData(state) ?? initialState
)