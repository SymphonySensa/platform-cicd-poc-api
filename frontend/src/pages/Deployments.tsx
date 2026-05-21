import { useState } from 'react'
import { useDeployments, useCreateDeployment, useRollbackDeployment } from '@/hooks/useDeployments'

export default function Deployments() {
  const { data: deployments, isLoading } = useDeployments()
  const createDeployment = useCreateDeployment()
  const rollback = useRollbackDeployment()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    version: '',
    strategy: 'canary' as const,
  })

  const handleSubmit = () => {
    if (form.version) {
      createDeployment.mutate({
        version: form.version,
        strategy: form.strategy,
        status: 'pending',
      } as any)
      setForm({ version: '', strategy: 'canary' })
      setShowForm(false)
    }
  }

  if (isLoading) return <div className="loading">Loading deployments...</div>

  return (
    <div>
      <h1 className="page-title">Deployments</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Create New Deployment</h2>
          <button className="button button-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Deployment'}
          </button>
        </div>

        {showForm && (
          <form className="form">
            <div className="form-group">
              <label>Version</label>
              <input
                type="text"
                value={form.version}
                onChange={e => setForm({ ...form, version: e.target.value })}
                placeholder="e.g., 1.2.0 or abc1234"
              />
            </div>

            <div className="form-group">
              <label>Strategy</label>
              <select value={form.strategy} onChange={e => setForm({ ...form, strategy: e.target.value as any })}>
                <option value="blue_green">Blue-Green</option>
                <option value="canary">Canary</option>
                <option value="feature_flag">Feature Flag</option>
                <option value="ab_test">A/B Test</option>
              </select>
            </div>

            <button
              type="button"
              className="button button-primary"
              onClick={handleSubmit}
              disabled={!form.version}
            >
              Create Deployment
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Deployment History</h2>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Version</th>
                <th>Strategy</th>
                <th>Status</th>
                <th>Canary %</th>
                <th>Error Rate</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deployments?.map(d => (
                <tr key={d.id}>
                  <td style={{ fontFamily: 'monospace' }}>{d.version}</td>
                  <td>{d.strategy.replace('_', '-')}</td>
                  <td>
                    <span className={`status-badge status-${d.status}`}>
                      {d.status}
                    </span>
                  </td>
                  <td>{d.canary_percentage}%</td>
                  <td>{(d.error_rate * 100).toFixed(2)}%</td>
                  <td style={{ fontSize: '0.875rem' }}>
                    {new Date(d.created_at).toLocaleString()}
                  </td>
                  <td>
                    {d.status === 'succeeded' && (
                      <button
                        className="button button-danger button-small"
                        onClick={() => rollback.mutate(d.id)}
                      >
                        Rollback
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .form {
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }

        .table-container {
          overflow-x: auto;
        }
      `}</style>
    </div>
  )
}
