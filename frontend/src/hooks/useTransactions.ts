import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/services/api'

export function useTransactions(filters?: Record<string, string>) {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => api.getTransactions(filters),
    refetchInterval: 5000,
  })
}

export function useFlagTransaction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ transaction_id, reason }: { transaction_id: string; reason: string }) =>
      api.flagTransaction(transaction_id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
    },
  })
}
