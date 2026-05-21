import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/services/api'

export default function ABTests() {
  const { data: tests, isLoading } = useQuery({
    queryKey: ['ab-tests'],
    queryFn: () => api.getABTests(),
    refetchInterval: 5000,
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    variant_a_name: 'Control',
    variant_b_name: 'Variant',
    split_percentage: 50,
  })

  const handleSubmit = async () => {
    if (form.name) {
      try {
        await api.createABTest({
          name: form.name,
          description: form.description,
          variant_a_name: form.variant_a_name,
          variant_b_name: form.variant_b_name,
          split_percentage: form.split_percentage,
          status: 'draft',
        } as any)
        setForm({
          name: '',
          description: '',
          variant_a_name: 'Control',
          variant_b_name: 'Variant',
          split_percentage: 50,
        })
        setShowForm(false)
      } catch (err) {
        console.error('Failed to create test:', err)
      }
    }
  }

  if (isLoading) return <div className="loading">Loading A/B tests...</div>

  return (
    <div>
      <h1 className="page-title">A/B Tests</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Create New Test</h2>
          <button className="button button-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ New Test'}
          </button>
        </div>

        {showForm && (
          <form className="form">
            <div className="form-group">
              <label>Test Name</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., checkout-flow-optimization"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Test description"
                rows={2}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Variant A Name</label>
                <input
                  type="text"
                  value={form.variant_a_name}
                  onChange={e => setForm({ ...form, variant_a_name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Variant B Name</label>
                <input
                  type="text"
                  value={form.variant_b_name}
                  onChange={e => setForm({ ...form, variant_b_name: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Split Percentage (to Variant B)</label>
              <div className="split-input">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={form.split_percentage}
                  onChange={e => setForm({ ...form, split_percentage: parseInt(e.target.value) })}
                />
                <span className="split-value">{form.split_percentage}%</span>
              </div>
            </div>

            <button
              type="button"
              className="button button-primary"
              onClick={handleSubmit}
              disabled={!form.name}
            >
              Create Test
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Active Tests</h2>
        </div>

        {tests && tests.length > 0 ? (
          <div className="tests-grid">
            {tests.map(test => (
              <div key={test.id} className="test-card">
                <h3>{test.name}</h3>
                <p className="test-description">{test.description || 'No description'}</p>

                <div className="test-status">
                  <span className={`badge badge-${test.status}`}>{test.status}</span>
                </div>

                <div className="variants-comparison">
                  <div className="variant">
                    <div className="variant-name">{test.variant_a_name}</div>
                    <div className="variant-metric">
                      <div className="metric-label">Conversions</div>
                      <div className="metric-value">{test.variant_a_conversions}</div>
                    </div>
                    <div className="variant-metric">
                      <div className="metric-label">Views</div>
                      <div className="metric-value">{test.variant_a_views}</div>
                    </div>
                    <div className="variant-metric">
                      <div className="metric-label">Conversion Rate</div>
                      <div className="metric-value">{test.variant_a_conversion_rate}%</div>
                    </div>
                  </div>

                  <div className="vs">vs</div>

                  <div className="variant">
                    <div className="variant-name">{test.variant_b_name}</div>
                    <div className="variant-metric">
                      <div className="metric-label">Conversions</div>
                      <div className="metric-value">{test.variant_b_conversions}</div>
                    </div>
                    <div className="variant-metric">
                      <div className="metric-label">Views</div>
                      <div className="metric-value">{test.variant_b_views}</div>
                    </div>
                    <div className="variant-metric">
                      <div className="metric-label">Conversion Rate</div>
                      <div className="metric-value">{test.variant_b_conversion_rate}%</div>
                    </div>
                  </div>
                </div>

                <div className="split-info">
                  Traffic Split: {100 - test.split_percentage}% / {test.split_percentage}%
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No A/B tests yet</p>
        )}
      </div>

      <style>{`
        .form {
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .split-input {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .split-input input[type="range"] {
          flex: 1;
        }

        .split-value {
          min-width: 50px;
          text-align: right;
          font-weight: 500;
        }

        .tests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .test-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 1rem;
        }

        .test-card h3 {
          font-size: 1.125rem;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .test-description {
          color: #6b7280;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }

        .test-status {
          margin-bottom: 1rem;
        }

        .badge-draft {
          background-color: #f3f4f6;
          color: #6b7280;
        }

        .badge-active {
          background-color: #dbeafe;
          color: #0c4a6e;
        }

        .badge-completed {
          background-color: #dcfce7;
          color: #166534;
        }

        .badge-cancelled {
          background-color: #fee2e2;
          color: #991b1b;
        }

        .variants-comparison {
          display: flex;
          gap: 1rem;
          align-items: center;
          background-color: #f9fafb;
          padding: 1rem;
          border-radius: 0.375rem;
          margin-bottom: 1rem;
        }

        .variant {
          flex: 1;
          text-align: center;
        }

        .variant-name {
          font-weight: 600;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .variant-metric {
          font-size: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .metric-label {
          color: #6b7280;
        }

        .metric-value {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.875rem;
        }

        .vs {
          color: #9ca3af;
          font-weight: 500;
        }

        .split-info {
          font-size: 0.875rem;
          color: #6b7280;
          text-align: center;
          padding-top: 0.5rem;
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  )
}
