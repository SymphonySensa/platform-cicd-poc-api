const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

export interface Transaction {
  id: number
  transaction_id: string
  amount: string
  currency: string
  originator: string
  beneficiary: string
  risk_level: 'low' | 'medium' | 'high'
  flagged: boolean
  flagged_reason: string
  created_at: string
  updated_at: string
}

export interface DeploymentEvent {
  id: number
  version: string
  strategy: 'blue_green' | 'canary' | 'feature_flag' | 'ab_test'
  status: 'pending' | 'in_progress' | 'succeeded' | 'failed' | 'rolled_back'
  canary_percentage: number
  error_rate: number
  created_at: string
  updated_at: string
  metadata: Record<string, unknown>
}

export interface FeatureFlag {
  id: number
  name: string
  description: string
  status: 'disabled' | 'enabled' | 'rolling_out'
  rollout_percentage: number
  created_at: string
  updated_at: string
}

export interface ABTest {
  id: number
  name: string
  description: string
  status: 'draft' | 'active' | 'completed' | 'cancelled'
  variant_a_name: string
  variant_b_name: string
  split_percentage: number
  variant_a_conversions: number
  variant_a_views: number
  variant_a_conversion_rate: number
  variant_b_conversions: number
  variant_b_views: number
  variant_b_conversion_rate: number
  created_at: string
  updated_at: string
  started_at: string | null
  ended_at: string | null
}

export interface Config {
  version: string
  deployment_strategy: string | null
  deployment_status: string | null
  feature_flags: FeatureFlag[]
  active_ab_tests: ABTest[]
}

export interface Metrics {
  total_deployments: number
  successful_deployments: number
  failed_deployments: number
  rollback_count: number
  flagged_transactions: number
  total_transactions: number
  active_feature_flags: number
  active_ab_tests: number
  recent_deployments: DeploymentEvent[]
}

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_URL}${endpoint}`
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`)
  }

  return response.json()
}

export const api = {
  // Transactions
  getTransactions: (filters?: Record<string, string>) => {
    const params = new URLSearchParams(filters)
    return request<Transaction[]>(`/transactions/?${params}`)
  },
  flagTransaction: (transaction_id: string, reason: string) =>
    request<Transaction>('/transactions/flag/', {
      method: 'POST',
      body: JSON.stringify({ transaction_id, reason }),
    }),

  // Deployments
  getDeployments: () => request<DeploymentEvent[]>('/deployments/'),
  createDeployment: (data: Partial<DeploymentEvent>) =>
    request<DeploymentEvent>('/deployments/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  rollbackDeployment: (id: number) =>
    request<DeploymentEvent>(`/deployments/${id}/rollback/`, {
      method: 'POST',
    }),
  abortDeployment: (id: number) =>
    request<DeploymentEvent>(`/deployments/${id}/abort/`, {
      method: 'POST',
    }),

  // Feature Flags
  getFlags: () => request<FeatureFlag[]>('/flags/'),
  createFlag: (data: Partial<FeatureFlag>) =>
    request<FeatureFlag>('/flags/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  enableFlag: (id: number) =>
    request<FeatureFlag>(`/flags/${id}/enable/`, {
      method: 'POST',
    }),
  disableFlag: (id: number) =>
    request<FeatureFlag>(`/flags/${id}/disable/`, {
      method: 'POST',
    }),
  setFlagRollout: (id: number, rollout_percentage: number) =>
    request<FeatureFlag>(`/flags/${id}/set_rollout/`, {
      method: 'PATCH',
      body: JSON.stringify({ rollout_percentage }),
    }),

  // A/B Tests
  getABTests: () => request<ABTest[]>('/ab-tests/'),
  createABTest: (data: Partial<ABTest>) =>
    request<ABTest>('/ab-tests/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getABTestStats: (id: number) =>
    request<ABTest>(`/ab-tests/${id}/stats/`),

  // Config & Metrics
  getConfig: () => request<Config>('/config/'),
  getMetrics: () => request<Metrics>('/metrics/'),
}
