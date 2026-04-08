import React from 'react';
import { useAccounts } from '../context/AccountsContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Share } from 'lucide-react';

const SharedAccounts = () => {
  const { sharedAccounts, sharedTotal } = useAccounts();
  const navigate = useNavigate();

  const formatCurrency = (amount) => `৳ ${Number(amount).toLocaleString()}`;

  return (
    <div className="accounts-page animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <button className="btn btn-ghost" onClick={() => navigate('/accounts')}>
          <ArrowLeft size={18} /> Back
        </button>
        <h2>Shared With Me</h2>
        <div style={{ width: '85px' }}></div> {/* Spacer */}
      </div>

      <div className="grand-total-card" style={{ background: 'linear-gradient(135deg, #475569, #1e293b)' }}>
        <p>Total Shared Amount</p>
        <h1>{formatCurrency(sharedTotal)}</h1>
      </div>

      <div className="accounts-list">
        {sharedAccounts.length === 0 ? (
          <div className="empty-state">No shared accounts found.</div>
        ) : (
          sharedAccounts.map(acc => (
            <div key={acc._id} className="glass-card account-card">
              <div className="account-info">
                <h3>{acc.name}</h3>
                <span className="base-amount">Base: {formatCurrency(acc.baseAmount)}</span>
                
                {acc.userId && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#3b82f6', fontSize: '0.85rem' }}>
                    <Share size={14} />
                    <span>Shared by: {acc.userId.name}</span>
                  </div>
                )}
              </div>
              <div className="account-actions">
                <div className={`current-balance ${acc.currentBalance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(acc.currentBalance)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SharedAccounts;
