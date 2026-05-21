import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, FeatureFlag } from '@/services/api'

export function useFeatureFlags() {
  return useQuery({
    queryKey: ['flags'],
    queryFn: () => api.getFlags(),
    refetchInterval: 5000,
  })
}

export function useCreateFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<FeatureFlag>) => api.createFlag(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] })
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
  })
}

export function useToggleFlag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, enable }: { id: number; enable: boolean }) => {
      return enable ? api.enableFlag(id) : api.disableFlag(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] })
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
  })
}

export function useSetFlagRollout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, rollout_percentage }: { id: number; rollout_percentage: number }) =>
      api.setFlagRollout(id, rollout_percentage),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flags'] })
      queryClient.invalidateQueries({ queryKey: ['config'] })
    },
  })
}
