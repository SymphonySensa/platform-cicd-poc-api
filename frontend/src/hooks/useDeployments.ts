import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api, DeploymentEvent } from '@/services/api'

export function useDeployments() {
  return useQuery({
    queryKey: ['deployments'],
    queryFn: () => api.getDeployments(),
    refetchInterval: 3000,
  })
}

export function useCreateDeployment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Partial<DeploymentEvent>) => api.createDeployment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      queryClient.invalidateQueries({ queryKey: ['config'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
    },
  })
}

export function useRollbackDeployment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.rollbackDeployment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
    },
  })
}

export function useAbortDeployment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => api.abortDeployment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deployments'] })
      queryClient.invalidateQueries({ queryKey: ['metrics'] })
    },
  })
}
