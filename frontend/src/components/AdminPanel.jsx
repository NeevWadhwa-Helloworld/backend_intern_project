import React, { useState, useEffect } from 'react';
import { ShieldAlert, Users, FolderKanban, BarChart3, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AdminPanel = () => {
  const { showToast } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/v1/tasks/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to load admin statistics', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
        <RefreshCw className="animate-spin" size={32} />
        <span style={{ marginLeft: '12px', fontSize: '18px' }}>Loading system statistics...</span>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="empty-state glass-panel">
        <ShieldAlert className="empty-icon" size={48} />
        <h3 className="empty-title">Error Loading Statistics</h3>
        <p className="empty-subtitle">Could not connect to stats service. Please verify your admin privileges.</p>
        <button className="btn btn-primary" onClick={fetchStats}>Retry</button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Stat Count Cards */}
      <div className="glass-panel admin-header-card">
        <div className="stat-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary)' }}>
            <FolderKanban size={18} />
            <span className="stat-label">Total System Tasks</span>
          </div>
          <span className="stat-value">{stats.totalTasks}</span>
        </div>
        
        <div className="stat-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-secondary)' }}>
            <Users size={18} />
            <span className="stat-label">Registered Accounts</span>
          </div>
          <span className="stat-value">{stats.totalUsers}</span>
        </div>

        <div className="stat-item">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
            <BarChart3 size={18} />
            <span className="stat-label">Completion Rate</span>
          </div>
          <span className="stat-value">
            {stats.totalTasks > 0
              ? `${Math.round(
                  ((stats.status.find((s) => s._id === 'Completed')?.count || 0) /
                    stats.totalTasks) *
                    100
                )}%`
              : '0%'}
          </span>
        </div>
      </div>

      <div className="admin-grid">
        {/* User Task Distribution Table */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '24px 24px 0', borderBottom: '1px solid var(--border-glass)', pb: '16px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 6 }}>User Task Assignments</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Registered accounts and total tasks currently managed</p>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Tasks Count</th>
                </tr>
              </thead>
              <tbody>
                {stats.users.map((u) => (
                  <tr key={u._id}>
                    <td style={{ fontWeight: 6 }}>{u.username}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 7,
                          textTransform: 'uppercase',
                          padding: '2px 8px',
                          borderRadius: '10px',
                          background: u.role === 'admin' ? 'var(--color-danger-glow)' : 'var(--border-glass)',
                          color: u.role === 'admin' ? 'var(--color-danger)' : 'var(--text-secondary)'
                        }}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontWeight: 6, color: 'var(--color-primary)' }}>{u.taskCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Task Metrics Summary */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Status Distribution */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 className="section-title" style={{ marginBottom: '16px' }}>Task Status Distribution</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Pending', 'In Progress', 'Completed'].map((status) => {
                const count = stats.status.find((s) => s._id === status)?.count || 0;
                const percentage = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
                let color = 'var(--color-warning)';
                if (status === 'In Progress') color = 'var(--color-info)';
                if (status === 'Completed') color = 'var(--color-success)';

                return (
                  <div key={status} style={{ fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 5 }}>{status}</span>
                      <span style={{ fontWeight: 6 }}>{count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 className="section-title" style={{ marginBottom: '16px' }}>Task Priority Distribution</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['High', 'Medium', 'Low'].map((prio) => {
                const count = stats.priority.find((p) => p._id === prio)?.count || 0;
                const percentage = stats.totalTasks > 0 ? (count / stats.totalTasks) * 100 : 0;
                let color = 'var(--color-danger)';
                if (prio === 'Medium') color = 'var(--color-warning)';
                if (prio === 'Low') color = 'var(--color-info)';

                return (
                  <div key={prio} style={{ fontSize: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontWeight: 5 }}>{prio} Priority</span>
                      <span style={{ fontWeight: 6 }}>{count} ({Math.round(percentage)}%)</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${percentage}%`, height: '100%', background: color, borderRadius: '3px' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
