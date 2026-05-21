import { useState } from 'react'
import { Transaction } from '@/services/api'

interface Props {
  transactions: Transaction[]
  onFlagTransaction: (params: { transaction_id: string; reason: string }) => void
}

export default function TransactionTable({ transactions, onFlagTransaction }: Props) {
  const [flagging, setFlagging] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [showModal, setShowModal] = useState(false)

  const handleFlagClick = (transactionId: string) => {
    setFlagging(transactionId)
    setShowModal(true)
  }

  const handleSubmit = () => {
    if (flagging && reason.trim()) {
      onFlagTransaction({ transaction_id: flagging, reason: reason.trim() })
      setFlagging(null)
      setReason('')
      setShowModal(false)
    }
  }

  return (
    <>
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">All Transactions</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Amount</th>
                <th>Originator</th>
                <th>Beneficiary</th>
                <th>Risk Level</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td className="font-mono">{tx.transaction_id.slice(0, 12)}...</td>
                  <td>{tx.amount} {tx.currency}</td>
                  <td>{tx.originator}</td>
                  <td>{tx.beneficiary}</td>
                  <td>
                    <span className={`badge badge-${tx.risk_level}`}>
                      {tx.risk_level}
                    </span>
                  </td>
                  <td>
                    {tx.flagged ? (
                      <span className="badge badge-danger">Flagged</span>
                    ) : (
                      <span className="badge badge-success">OK</span>
                    )}
                  </td>
                  <td className="text-sm text-gray">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    {!tx.flagged && (
                      <button
                        className="button button-small button-warning"
                        onClick={() => handleFlagClick(tx.transaction_id)}
                      >
                        Flag
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Flag Transaction</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="form-group">
              <label>Transaction ID</label>
              <input type="text" value={flagging || ''} disabled />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                value={reason}
                onChange={e => setReason(e.target.value)}
                placeholder="Enter reason for flagging..."
                rows={3}
              />
            </div>

            <div className="button-group" style={{ justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="button button-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="button button-danger"
                onClick={handleSubmit}
                disabled={!reason.trim()}
              >
                Flag Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .font-mono {
          font-family: monospace;
        }
        .text-sm {
          font-size: 0.875rem;
        }
        .text-gray {
          color: #6b7280;
        }
        .badge-high {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .badge-medium {
          background-color: #fef3c7;
          color: #92400e;
        }
        .badge-low {
          background-color: #dcfce7;
          color: #166534;
        }
        .button-warning {
          background-color: #f59e0b;
          color: white;
        }
        .button-warning:hover {
          background-color: #d97706;
        }
        .table-container {
          overflow-x: auto;
        }
      `}</style>
    </>
  )
}
