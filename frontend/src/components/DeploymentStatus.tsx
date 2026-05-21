import { DeploymentEvent } from '@/services/api'
import { useRollbackDeployment } from '@/hooks/useDeployments'

interface Props {
  deployment: DeploymentEvent
}

export default function DeploymentStatus({ deployment }: Props) {
  const rollback = useRollbackDeployment()

  const statusColor = {
    pending: '#dbeafe',
    in_progress: '#fef3c7',
    succeeded: '#dcfce7',
    failed: '#fee2e2',
    rolled_back: '#e9d5ff',
  }

  const strategyLabel = {
    blue_green: 'Blue-Green',
    canary: 'Canary',
    feature_flag: 'Feature Flag',
    ab_test: 'A/B Test',
  }

  return (
    <div className="card deployment-card">
      <div className="card-header">
        <h2 className="card-title">Latest Deployment</h2>
        <button
          className="button button-secondary button-small"
          onClick={() => rollback.mutate(deployment.id)}
          disabled={deployment.status !== 'succeeded'}
        >
          Rollback
        </button>
      </div>

      <div className="deployment-grid">
        <div className="deployment-item">
          <div className="label">Version</div>
          <div className="value font-mono">{deployment.version}</div>
        </div>

        <div className="deployment-item">
          <div className="label">Strategy</div>
          <div className="value">
            {strategyLabel[deployment.strategy as keyof typeof strategyLabel]}
          </div>
        </div>

        <div className="deployment-item">
          <div className="label">Status</div>
          <div
            className="value"
            style={{
              backgroundColor: statusColor[deployment.status as keyof typeof statusColor],
              padding: '0.5rem',
              borderRadius: '0.375rem',
              display: 'inline-block',
            }}
          >
            {deployment.status}
          </div>
        </div>

        <div className="deployment-item">
          <div className="label">Created</div>
          <div className="value text-sm">
            {new Date(deployment.created_at).toLocaleString()}
          </div>
        </div>
      </div>

      {deployment.strategy === 'canary' && (
        <div className="canary-section">
          <div className="label">Canary Progress</div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${deployment.canary_percentage}%` }}
            />
          </div>
          <div className="progress-text">{deployment.canary_percentage}% of traffic</div>

          {deployment.error_rate > 0 && (
            <div className="error-rate">
              Error Rate: {(deployment.error_rate * 100).toFixed(2)}%
            </div>
          )}
        </div>
      )}

      <style>{`
        .deployment-card {
          border-left: 4px solid #3b82f6;
        }

        .deployment-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .deployment-item {
          padding: 1rem;
          background-color: #f9fafb;
          border-radius: 0.375rem;
        }

        .deployment-item .label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .deployment-item .value {
          font-size: 1rem;
          font-weight: 500;
        }

        .font-mono {
          font-family: monospace;
          font-size: 0.875rem;
        }

        .text-sm {
          font-size: 0.875rem;
        }

        .canary-section {
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-top: 1rem;
        }

        .canary-section .label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .progress-text {
          font-size: 0.875rem;
          color: #6b7280;
          margin-top: 0.5rem;
        }

        .error-rate {
          margin-top: 0.5rem;
          padding: 0.5rem;
          background-color: #fee2e2;
          color: #991b1b;
          border-radius: 0.25rem;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  )
}
