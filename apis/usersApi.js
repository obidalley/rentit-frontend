import { createSelector, createEntityAdapter } from '@reduxjs/toolkit'

import { apiSlice } from './apiSlice'

// Create an entity adapter for users with a sort comparer based on the "createdAt" field
const usersAdapter = createEntityAdapter({
    sortComparer: (a, b) => b.createdAt.localeCompare(a.createdAt),
})

// Initialize state for users using the adapter
const initialState = usersAdapter.getInitialState()

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getUsers: builder.query({
            query: () => ({
                url: '/users',
                validateStatus: (response, result) =>
                    response.status === 200 && !result.isError,
            }),
            transformResponse: (responseData) => {
                // Map over the returned users and copy _id to id for consistency
                const loadedUsers = responseData?.data?.map((user) => {
                    user.id = user._id
                    return user
                })
                // Normalize the users using the entity adapter
                return usersAdapter.setAll(initialState, loadedUsers)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Users', id: 'LIST' },
                        ...result.ids.map((id) => ({ type: 'Users', id })),
                    ]
                }
                return [{ type: 'Users', id: 'LIST' }]
            },
        }),
        addNewUser: builder.mutation({
            query: (initialUserData) => ({
                url: '/users',
                method: 'POST',
                body: { ...initialUserData },
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Users', id: 'LIST' },
            ],
        }),
        registerUser: builder.mutation({
            query: (initialUserData) => ({
                url: '/register',
                method: 'POST',
                body: { ...initialUserData },
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Users', id: 'LIST' },
            ],
        }),
        updateUser: builder.mutation({
            query: (initialUserData) => ({
                url: '/users',
                method: 'PATCH',
                body: { ...initialUserData },
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Users', id: arg.id },
            ],
        }),
        deleteUser: builder.mutation({
            query: ({ id }) => ({
                url: `/users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Users', id: arg.id },
            ],
        }),
        deleteUsers: builder.mutation({
            query: () => ({
                url: '/users',
                method: 'DELETE',
            }),
            invalidatesTags: () => [{ type: 'Users', id: 'LIST' }],
        }),
    }),
})

export const {
    useGetUsersQuery,
    useAddNewUserMutation,
    useRegisterUserMutation,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useDeleteUsersMutation,
} = usersApiSlice

// Returns the query result object for the "getUsers" endpoint
export const selectUserResult = apiSlice.endpoints.getUsers.select()

// Creates a memoized selector to extract normalized user data (ids & entities)
const selectUserData = createSelector(
    selectUserResult,
    (usersResult) => usersResult.data
)

// Generate entity selectors using the adapter's getSelectors method
export const {
    selectAll: selectAllUsers,
    selectById: selectUserById,
    selectIds: selectUserIds,
} = usersAdapter.getSelectors((state) =>
    selectUserData(state) ?? initialState
)
