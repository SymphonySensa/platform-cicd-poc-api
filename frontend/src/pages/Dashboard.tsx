import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useTransactions, useFlagTransaction } from '@/hooks/useTransactions'
import { useDeployments } from '@/hooks/useDeployments'
import TransactionTable from '@/components/TransactionTable'
import DeploymentStatus from '@/components/DeploymentStatus'
import '../styles/dashboard.css'

export default function Dashboard() {
  const { data: config, isLoading: configLoading } = useQuery({
    queryKey: ['config'],
    queryFn: () => api.getConfig(),
  })

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['metrics'],
    queryFn: () => api.getMetrics(),
  })

  const { data: transactions, isLoading: transactionsLoading } = useTransactions()
  const { data: deployments } = useDeployments()
  const flagTransaction = useFlagTransaction()

  if (configLoading || metricsLoading || transactionsLoading) {
    return <div className="loading">Loading dashboard...</div>
  }

  const latestDeployment = deployments?.[0]
  const highRiskTransactions = transactions?.filter(t => t.risk_level === 'high') || []

  return (
    <div className="dashboard">
      <h1 className="page-title">Dashboard</h1>

      <div className="grid">
        <div className="metric-card">
          <div className="metric-label">Current Version</div>
          <div className="metric-value">{config?.version || 'N/A'}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Total Transactions</div>
          <div className="metric-value">{metrics?.total_transactions || 0}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Flagged Transactions</div>
          <div className="metric-value">{metrics?.flagged_transactions || 0}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Active Feature Flags</div>
          <div className="metric-value">{metrics?.active_feature_flags || 0}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Active A/B Tests</div>
          <div className="metric-value">{metrics?.active_ab_tests || 0}</div>
        </div>

        <div className="metric-card">
          <div className="metric-label">Successful Deployments</div>
          <div className="metric-value">{metrics?.successful_deployments || 0}</div>
        </div>
      </div>

      {latestDeployment && <DeploymentStatus deployment={latestDeployment} />}

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Active Feature Flags</h2>
        </div>
        {config?.feature_flags && config.feature_flags.length > 0 ? (
          <div className="flags-list">
            {config.feature_flags.map(flag => (
              <div key={flag.id} className="flag-item">
                <div className="flag-name">{flag.name}</div>
                <div className="flag-status">
                  <span className="badge badge-info">{flag.status}</span>
                  {flag.status === 'rolling_out' && (
                    <span className="rollout-percent">{flag.rollout_percentage}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No active feature flags</p>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">High Risk Transactions</h2>
        </div>
        {highRiskTransactions.length > 0 ? (
          <TransactionTable
            transactions={highRiskTransactions}
            onFlagTransaction={flagTransaction.mutate}
          />
        ) : (
          <p>No high-risk transactions</p>
        )}
      </div>

      <TransactionTable
        transactions={transactions || []}
        onFlagTransaction={flagTransaction.mutate}
      />
    </div>
  )
}
