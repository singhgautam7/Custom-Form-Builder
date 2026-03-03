import { useQuery } from '@tanstack/react-query'
import { fetchWithAuth, endpoints } from '@/lib/api'

export interface User {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
}

export function useAuth() {
    const { data: user, isLoading, error, refetch } = useQuery<User>({
        queryKey: ['auth-user'],
        queryFn: () => fetchWithAuth(endpoints.me),
        retry: false,
    })

    const getInitials = () => {
        if (!user) return ''
        if (user.first_name && user.last_name) {
            return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
        }
        if (user.email) {
            return user.email.substring(0, 2).toUpperCase()
        }
        return user.username?.substring(0, 2).toUpperCase() || 'U'
    }

    return { user, isLoading, error, getInitials, refetch }
}
