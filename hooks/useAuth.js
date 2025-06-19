import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import { jwtDecode } from 'jwt-decode'

import { selectCurrentToken } from '@/store/slices/authSlice'
import { useGetCustomersQuery } from '@/apis/customersApi'

const useAuth = () => {
    const token = useSelector(selectCurrentToken)
    const { data: customersData } = useGetCustomersQuery('getCustomers')
    const customers = useMemo(() => Object.values(customersData?.entities || {}), [customersData])

    const user = {
        id: '',
        uid: '',
        email: '',
        status: 'Customer',
        roles: [],
    }

    let isAdmin = false
    let auth = false

    if (token) {
        auth = true
        const decoded = jwtDecode(token)
        const { id, email, roles } = decoded.user

        isAdmin = roles.includes('Admin')

        user.id = id
        user.email = email
        user.roles = roles

        if (isAdmin) {
            user.status = 'Admin'
        }

        if (user.status === 'Customer') {
            const customer = customers?.find(customer => customer?.user?._id === id)
            user.uid = customer?._id
        }
    }

    return { auth, user, isAdmin, }
}

export default useAuth
