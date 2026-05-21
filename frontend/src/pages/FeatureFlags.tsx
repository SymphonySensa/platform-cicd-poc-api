import { useState } from 'react'
import { useFeatureFlags, useCreateFlag, useToggleFlag, useSetFlagRollout } from '@/hooks/useFeatureFlags'

export default function FeatureFlags() {
  const { data: flags, isLoading } = useFeatureFlags()
  const createFlag = useCreateFlag()
  const toggleFlag = useToggleFlag()
  const setRollout = useSetFlagRollout()

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    status: 'disabled' as const,
  })

  const handleSubmit = () => {
    if (form.name) {
      createFlag.mutate({
        name: form.name,
        description: form.description,
        status: form.status,
        rollout_percentage: 0,
      } as any)
      setForm({ name: '', description: '', status: 'disabled' })
      setShowForm(false)
    }
  }

  if (isLoading) return <div className="loading">Loading feature flags...</div>

  return (
    <div>
      <h1 className="page-title">Feature Flags</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Create New Flag</h2>
          <button className="button button-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Flag'}
          </button>
        </div>

        {showForm && (
          <form className="form">
            <div className="form-group">
              <label>Flag Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., new-ui-redesign"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Feature description"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Initial Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                <option value="disabled">Disabled</option>
                <option value="enabled">Enabled</option>
                <option value="rolling_out">Rolling Out</option>
              </select>
            </div>

            <button
              type="button"
              className="button button-primary"
              onClick={handleSubmit}
              disabled={!form.name}
            >
              Create Flag
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Flags ({flags?.length || 0})</h2>
        </div>

        {flags && flags.length > 0 ? (
          <div className="flags-grid">
            {flags.map(flag => (
              <div key={flag.id} className="flag-card">
                <h3>{flag.name}</h3>
                <p className="flag-description">{flag.description || 'No description'}</p>

                <div className="flag-status">
                  <span className={`badge badge-${flag.status}`}>
                    {flag.status}
                  </span>
                </div>

                {flag.status === 'rolling_out' && (
                  <div className="rollout-section">
                    <div className="rollout-label">Rollout: {flag.rollout_percentage}%</div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${flag.rollout_percentage}%` }}
                      />
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={flag.rollout_percentage}
                      onChange={e => setRollout.mutate({
                        id: flag.id,
                        rollout_percentage: parseInt(e.target.value),
                      })}
                      className="rollout-slider"
                    />
                  </div>
                )}

                <div className="flag-actions">
                  <button
                    className="button button-small button-success"
                    onClick={() => toggleFlag.mutate({ id: flag.id, enable: true })}
                    disabled={flag.status === 'enabled' || flag.status === 'rolling_out'}
                  >
                    Enable
                  </button>
                  <button
                    className="button button-small button-secondary"
                    onClick={() => toggleFlag.mutate({ id: flag.id, enable: false })}
                    disabled={flag.status === 'disabled'}
                  >
                    Disable
                  </button>
                </div>

                <div className="flag-meta">
                  Updated: {new Date(flag.updated_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No feature flags created yet</p>
        )}
      </div>

      <style>{`
        .form {
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }

        .flags-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .flag-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 1rem;
        }

        .flag-card h3 {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .flag-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .flag-status {
          margin-bottom: 1rem;
        }

        .rollout-section {
          background-color: #f9fafb;
          padding: 0.75rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }

        .rollout-label {
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .rollout-slider {
          width: 100%;
          margin-top: 0.5rem;
        }

        .flag-actions {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .flag-meta {
          font-size: 0.75rem;
          color: #9ca3af;
        }

        .badge-disabled {
          background-color: #f3f4f6;
          color: #6b7280;
        }

        .badge-enabled {
          background-color: #dcfce7;
          color: #166534;
        }

        .badge-rolling_out {
          background-color: #fef3c7;
          color: #92400e;
        }
      `}</style>
    </div>
  )
}
