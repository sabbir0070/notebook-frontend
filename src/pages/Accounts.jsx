import React, { useState, useEffect } from 'react';
import { useAccounts } from '../context/AccountsContext';
import api from '../api';
import { Plus, Minus, Share2, FolderOpen, Trash2, History, TrendingUp, TrendingDown, X, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Accounts.css';

const Accounts = () => {
  const { personalAccounts, personalTotal, addAccount, addTransaction, shareAccount, shareAllAccounts, deleteAccount } = useAccounts();
  const navigate = useNavigate();

  // Dialog states
  const [showAddAcc, setShowAddAcc] = useState(false);
  const [accName, setAccName] = useState('');
  const [accBase, setAccBase] = useState('0');

  // Transaction states
  const [showTrx, setShowTrx] = useState(false);
  const [activeAcc, setActiveAcc] = useState(null);
  const [trxType, setTrxType] = useState('plus');
  const [trxAmount, setTrxAmount] = useState('');
  const [trxNote, setTrxNote] = useState('');

  // Share states
  const [showShare, setShowShare] = useState(false);
  const [shareTarget, setShareTarget] = useState('');
  const [users, setUsers] = useState([]);
  const [isShareAll, setIsShareAll] = useState(false);

  // History state
  const [showHistory, setShowHistory] = useState(false);
  const [historyAcc, setHistoryAcc] = useState(null);

  useEffect(() => {
    if (showShare && users.length === 0) {
      api.get('/auth/users').then(res => setUsers(res.data.data)).catch(console.error);
    }
  }, [showShare]);

  const formatCurrency = (amount) => `৳ ${Number(amount).toLocaleString()}`;

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('bn-BD', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const handleAddAccount = async (e) => {
    e.preventDefault();
    await addAccount(accName, Number(accBase));
    setShowAddAcc(false);
    setAccName('');
    setAccBase('0');
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    await addTransaction(activeAcc._id, trxType, Number(trxAmount), trxNote);
    setShowTrx(false);
    setTrxAmount('');
    setTrxNote('');
  };

  const handleShareSubmit = async (e) => {
    e.preventDefault();
    if (!shareTarget) return;
    if (isShareAll) {
      await shareAllAccounts(shareTarget);
      alert('All accounts shared successfully!');
    } else {
      await shareAccount(activeAcc._id, shareTarget);
      alert(`Account ${activeAcc.name} shared successfully!`);
    }
    setShowShare(false);
    setShareTarget('');
  };

  const openHistory = (acc) => {
    setHistoryAcc(acc);
    setShowHistory(true);
  };

  // Compute running balance for history display
  const getRunningHistory = (acc) => {
    if (!acc) return [];
    const rows = [];
    let running = acc.baseAmount;

    // Starting row
    rows.push({
      id: 'base',
      date: acc.createdAt,
      type: 'base',
      amount: acc.baseAmount,
      note: 'প্রারম্ভিক ব্যালেন্স (Base)',
      balance: running,
    });

    // Transactions chronologically
    const sorted = [...(acc.transactions || [])].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );

    sorted.forEach((trx) => {
      if (trx.type === 'plus') running += trx.amount;
      else running -= trx.amount;
      rows.push({
        id: trx._id,
        date: trx.date,
        type: trx.type,
        amount: trx.amount,
        note: trx.note || '—',
        balance: running,
      });
    });

    return rows;
  };

  return (
    <div className="accounts-page animate-fade-in">
      <div className="flex-between" style={{ marginBottom: '24px' }}>
        <h2>Accounts / হিসাব</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost" title="Recycle Bin" onClick={() => navigate('/deleted-accounts')} style={{ color: 'var(--danger)' }}>
            <Trash2 size={20} />
          </button>
          <button className="btn btn-ghost" title="Shared With Me" onClick={() => navigate('/shared-accounts')}>
            <FolderOpen size={20} />
          </button>
          <button className="btn btn-primary" title="Share All" onClick={() => { setIsShareAll(true); setShowShare(true); }}>
            <Share2 size={20} />
          </button>
        </div>
      </div>

      <div className="grand-total-card">
        <p>Grand Total (মোট হিসাব)</p>
        <h1>{formatCurrency(personalTotal)}</h1>
      </div>

      <div className="accounts-list">
        {personalAccounts.length === 0 ? (
          <div className="empty-state">No personal accounts found. Add one!</div>
        ) : (
          personalAccounts.map(acc => (
            <div key={acc._id} className="glass-card account-card">
              <div className="account-info">
                <h3>{acc.name}</h3>
                <span className="base-amount">Base: {formatCurrency(acc.baseAmount)}</span>
              </div>
              <div className="account-actions">
                {/* History Button */}
                <button
                  className="icon-btn history-btn"
                  title="লেনদেনের ইতিহাস"
                  onClick={() => openHistory(acc)}
                >
                  <History size={18} />
                </button>

                <button className="icon-btn share-btn" onClick={() => { setActiveAcc(acc); setIsShareAll(false); setShowShare(true); }}>
                  <Share2 size={18} />
                </button>
                <div className={`current-balance ${acc.currentBalance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(acc.currentBalance)}
                </div>
                <button className="icon-btn add-btn" onClick={() => { setActiveAcc(acc); setTrxType('plus'); setShowTrx(true); }}>
                  <Plus size={18} />
                </button>
                <button className="icon-btn sub-btn" onClick={() => { setActiveAcc(acc); setTrxType('minus'); setShowTrx(true); }}>
                  <Minus size={18} />
                </button>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)', margin: '0 4px' }}></div>
                <button className="icon-btn" style={{ color: 'var(--danger)' }} onClick={() => { if (window.confirm('Delete this account to Recycle Bin?')) deleteAccount(acc._id); }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <button className="fab-btn" onClick={() => setShowAddAcc(true)}>
        <Plus size={24} />
      </button>

      {/* ─── History Modal ─── */}
      {showHistory && historyAcc && (() => {
        const rows = getRunningHistory(historyAcc);
        const totalIn = historyAcc.transactions.filter(t => t.type === 'plus').reduce((s, t) => s + t.amount, 0);
        const totalOut = historyAcc.transactions.filter(t => t.type === 'minus').reduce((s, t) => s + t.amount, 0);
        return (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowHistory(false)}>
            <div className="glass-panel history-modal animate-fade-in">
              {/* Header */}
              <div className="history-header">
                <div>
                  <h3>{historyAcc.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    লেনদেনের ইতিহাস ({rows.length - 1} টি লেনদেন)
                  </p>
                </div>
                <button className="icon-btn" onClick={() => setShowHistory(false)}>
                  <X size={20} />
                </button>
              </div>

              {/* Summary row */}
              <div className="history-summary">
                <div className="summary-item">
                  <span className="summary-label">বর্তমান ব্যালেন্স</span>
                  <span className={`summary-value ${historyAcc.currentBalance >= 0 ? 'positive' : 'negative'}`}>
                    {formatCurrency(historyAcc.currentBalance)}
                  </span>
                </div>
                <div className="summary-divider" />
                <div className="summary-item">
                  <TrendingUp size={14} color="var(--success)" />
                  <span className="summary-label">মোট জমা</span>
                  <span className="summary-value positive">{formatCurrency(totalIn)}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-item">
                  <TrendingDown size={14} color="var(--danger)" />
                  <span className="summary-label">মোট বকেয়া</span>
                  <span className="summary-value negative">{formatCurrency(totalOut)}</span>
                </div>
              </div>

              {/* Transaction table */}
              <div className="history-table-wrap">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>তারিখ</th>
                      <th>ধরন</th>
                      <th>পরিমাণ</th>
                      <th>রেফারেন্স / নোট</th>
                      <th>ব্যালেন্স</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={row.id} className={`history-row ${row.type}`}>
                        <td className="date-cell">{formatDate(row.date)}</td>
                        <td className="type-cell">
                          {row.type === 'base' && (
                            <span className="badge badge-base">প্রারম্ভিক</span>
                          )}
                          {row.type === 'plus' && (
                            <span className="badge badge-plus">
                              <ArrowUpCircle size={13} /> জমা
                            </span>
                          )}
                          {row.type === 'minus' && (
                            <span className="badge badge-minus">
                              <ArrowDownCircle size={13} /> বকেয়া
                            </span>
                          )}
                        </td>
                        <td className={`amount-cell ${row.type === 'minus' ? 'negative' : 'positive'}`}>
                          {row.type === 'minus' ? '−' : '+'}{formatCurrency(row.amount)}
                        </td>
                        <td className="note-cell">{row.note}</td>
                        <td className={`balance-cell ${row.balance >= 0 ? 'positive' : 'negative'}`}>
                          {formatCurrency(row.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {rows.length === 1 && (
                  <div className="empty-state" style={{ margin: '24px 0' }}>
                    এখনো কোনো লেনদেন নেই
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Add Account Modal */}
      {showAddAcc && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content animate-fade-in">
            <h3>Add New Account / নতুন হিসাব</h3>
            <form onSubmit={handleAddAccount}>
              <div className="input-group">
                <label className="input-label">Account Name</label>
                <input required className="input-field" value={accName} onChange={e => setAccName(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label">Starting Balance</label>
                <input required type="number" className="input-field" value={accBase} onChange={e => setAccBase(e.target.value)} />
              </div>
              <div className="flex-between">
                <button type="button" className="btn btn-ghost" onClick={() => setShowAddAcc(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Transaction Modal */}
      {showTrx && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content animate-fade-in">
            <h3>{trxType === 'plus' ? 'Add Income (+ জমা)' : 'Add Expense (- বকেয়া)'}</h3>
            <p style={{ marginBottom: '16px' }}>for {activeAcc?.name}</p>
            <form onSubmit={handleAddTransaction}>
              <div className="input-group">
                <label className="input-label">Amount</label>
                <input required type="number" className="input-field" value={trxAmount} onChange={e => setTrxAmount(e.target.value)} />
              </div>
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label">Note (Optional)</label>
                <input type="text" className="input-field" value={trxNote} onChange={e => setTrxNote(e.target.value)} />
              </div>
              <div className="flex-between">
                <button type="button" className="btn btn-ghost" onClick={() => setShowTrx(false)}>Cancel</button>
                <button type="submit" className={`btn ${trxType === 'plus' ? 'btn-primary' : 'btn-danger'}`}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShare && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content animate-fade-in">
            <h3>{isShareAll ? 'Share All Accounts' : `Share ${activeAcc?.name}`}</h3>
            <form onSubmit={handleShareSubmit}>
              <div className="input-group" style={{ marginBottom: '24px' }}>
                <label className="input-label">Select User to Share With</label>
                <select required className="input-field" value={shareTarget} onChange={e => setShareTarget(e.target.value)}>
                  <option value="">-- Choose User --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex-between">
                <button type="button" className="btn btn-ghost" onClick={() => setShowShare(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Share</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
