import { useQuery } from '@tanstack/react-query'
import { userService } from '@/services/userService'

export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: userService.getStats,
  })
}
