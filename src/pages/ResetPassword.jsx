import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowLeft } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { setUser, setToken: setAuthToken } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    if (password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const res = await api.put(`/auth/reset-password/${token}`, { password });
      const { accessToken, user } = res.data;
      localStorage.setItem('token', accessToken);
      setSuccess(true);
      // Auto-redirect after 2s
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength
  const getStrength = () => {
    if (!password) return { level: 0, label: '', color: 'transparent' };
    if (password.length < 6) return { level: 1, label: 'Too short', color: 'var(--danger)' };
    if (password.length < 8) return { level: 2, label: 'Weak', color: '#f97316' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 4, label: 'Strong', color: 'var(--success)' };
    return { level: 3, label: 'Medium', color: '#eab308' };
  };
  const strength = getStrength();

  return (
    <div className="flex-center" style={{ minHeight: '100vh', padding: '20px' }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '40px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div className="flex-center" style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            margin: '0 auto 16px'
          }}>
            <ShieldCheck color="white" size={30} />
          </div>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Set New Password</h2>
          <p style={{ fontSize: '0.9rem' }}>Choose a strong password for your account.</p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '12px', background: 'rgba(239, 68, 68, 0.1)',
            borderLeft: '4px solid var(--danger)', color: 'var(--danger)',
            marginBottom: '20px', borderRadius: '4px', fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        {/* Success */}
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div className="flex-center" style={{
              width: '56px', height: '56px', borderRadius: '50%',
              background: 'rgba(34, 197, 94, 0.15)',
              border: '2px solid var(--success)',
              margin: '0 auto 20px'
            }}>
              <ShieldCheck size={28} color="var(--success)" />
            </div>
            <h3 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Password Updated!</h3>
            <p style={{ fontSize: '0.9rem' }}>Redirecting you to the app...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* New Password */}
            <div className="input-group">
              <label className="input-label">New Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field"
                  style={{ paddingLeft: '40px', paddingRight: '44px' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                    padding: 0
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength bar */}
              {password && (
                <div style={{ marginTop: '6px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{
                        flex: 1, height: '3px', borderRadius: '2px',
                        background: i <= strength.level ? strength.color : 'var(--border-color)',
                        transition: 'all 0.3s ease'
                      }} />
                    ))}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="input-group" style={{ marginBottom: '24px' }}>
              <label className="input-label">Confirm Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="input-field"
                  style={{
                    paddingLeft: '40px', paddingRight: '44px',
                    borderColor: confirmPassword && confirmPassword !== password
                      ? 'var(--danger)' : undefined
                  }}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                    padding: 0
                  }}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <span style={{ fontSize: '0.75rem', color: 'var(--danger)' }}>Passwords do not match</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {/* Back link */}
        {!success && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <Link
              to="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem',
                transition: 'color 0.2s'
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
