import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';
import AdminPanel from './AdminPanel';
import { 
  LogOut, Plus, Search, CheckCircle2, Circle, Clock, ListTodo, Shield, User, Loader2
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout, showToast } = useAuth();
  
  // Dashboard view toggle (for Admin: 'tasks' vs 'admin')
  const [activeTab, setActiveTab] = useState('tasks');
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters state
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); // Debounced/Triggered search

  // Modal forms
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Stats for current user's tasks
  const [userStats, setUserStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0
  });

  // Debouncing search query input (500ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchTerm(searchQuery);
    }, 400);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      let url = '/api/v1/tasks?';
      if (statusFilter) url += `status=${statusFilter}&`;
      if (priorityFilter) url += `priority=${priorityFilter}&`;
      if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

      const res = await api.get(url);
      if (res.data.success) {
        setTasks(res.data.data);
        
        // Calculate user metrics from total tasks
        const data = res.data.data;
        setUserStats({
          total: data.length,
          pending: data.filter((t) => t.status === 'Pending').length,
          inProgress: data.filter((t) => t.status === 'In Progress').length,
          completed: data.filter((t) => t.status === 'Completed').length
        });
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch tasks if we are in the 'tasks' tab view
    if (activeTab === 'tasks') {
      fetchTasks();
    }
  }, [statusFilter, priorityFilter, searchTerm, activeTab]);

  // Create or Update task handler
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        // Update API
        const res = await api.put(`/api/v1/tasks/${editingTask._id}`, taskData);
        if (res.data.success) {
          showToast('Task updated successfully!', 'success');
          fetchTasks();
        }
      } else {
        // Create API
        const res = await api.post('/api/v1/tasks', taskData);
        if (res.data.success) {
          showToast('Task created successfully!', 'success');
          fetchTasks();
        }
      }
      setIsFormOpen(false);
      setEditingTask(null);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to save task', 'error');
    }
  };

  // Delete task handler
  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const res = await api.delete(`/api/v1/tasks/${taskId}`);
        if (res.data.success) {
          showToast('Task deleted successfully', 'success');
          fetchTasks();
        }
      } catch (error) {
        showToast(error.response?.data?.message || 'Failed to delete task', 'error');
      }
    }
  };

  const handleEditClick = (task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCreateClick = () => {
    setEditingTask(null);
    setIsFormOpen(true);
  };

  // Reset filters
  const resetFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setSearchQuery('');
  };

  return (
    <div className="app-container">
      {/* Navigation Navbar */}
      <nav className="glass-panel navbar">
        <div className="logo">
          <ListTodo size={24} style={{ color: 'var(--color-primary)' }} />
          <span>Tasks</span>
        </div>
        
        <div className="user-badge">
          <div className="avatar">
            {user?.username ? user.username.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 6 }}>{user?.username}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              {user?.role === 'admin' ? (
                <>
                  <Shield size={11} style={{ color: 'var(--color-danger)' }} />
                  <span style={{ color: 'var(--color-danger)', fontWeight: 6 }}>Admin</span>
                </>
              ) : (
                <>
                  <User size={11} />
                  <span>User</span>
                </>
              )}
            </span>
          </div>
          <button className="btn btn-secondary btn-icon" onClick={logout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </nav>

      {/* Admin Panel Toggle Tabs */}
      {user?.role === 'admin' && (
        <div className="view-tabs">
          <button 
            className={`view-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            My Workspace
          </button>
          <button 
            className={`view-tab ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            System Admin Panel
          </button>
        </div>
      )}

      {/* Main dashboard content container */}
      {activeTab === 'admin' ? (
        <AdminPanel />
      ) : (
        <div className="dashboard-layout">
          
          {/* Filters Sidebar */}
          <aside className="sidebar">
            {/* Quick Metrics */}
            <div className="glass-panel sidebar-section">
              <h4 className="section-title">My Workspace Metrics</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Circle size={10} style={{ color: 'var(--color-warning)' }} />
                    <span>Pending</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 7, marginTop: '6px' }}>{userStats.pending}</div>
                </div>
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Clock size={10} style={{ color: 'var(--color-info)' }} />
                    <span>In Progress</span>
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 7, marginTop: '6px' }}>{userStats.inProgress}</div>
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border-glass)', marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={12} style={{ color: 'var(--color-success)' }} />
                  <span>Completed Tasks</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 7 }}>{userStats.completed} / {userStats.total}</div>
              </div>
            </div>

            {/* Filter controls */}
            <div className="glass-panel sidebar-section">
              <h4 className="section-title">Filters</h4>
              
              <div className="search-container">
                <input
                  type="text"
                  className="input-control search-input"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="search-icon" size={16} />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Status</span>
                <ul className="filter-list">
                  <li className={`filter-item ${statusFilter === '' ? 'active' : ''}`} onClick={() => setStatusFilter('')}>
                    <span>All Tasks</span>
                  </li>
                  <li className={`filter-item ${statusFilter === 'Pending' ? 'active' : ''}`} onClick={() => setStatusFilter('Pending')}>
                    <span>Pending</span>
                  </li>
                  <li className={`filter-item ${statusFilter === 'In Progress' ? 'active' : ''}`} onClick={() => setStatusFilter('In Progress')}>
                    <span>In Progress</span>
                  </li>
                  <li className={`filter-item ${statusFilter === 'Completed' ? 'active' : ''}`} onClick={() => setStatusFilter('Completed')}>
                    <span>Completed</span>
                  </li>
                </ul>
              </div>

              <div>
                <span className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Priority</span>
                <ul className="filter-list">
                  <li className={`filter-item ${priorityFilter === '' ? 'active' : ''}`} onClick={() => setPriorityFilter('')}>
                    <span>All Priorities</span>
                  </li>
                  <li className={`filter-item ${priorityFilter === 'High' ? 'active' : ''}`} onClick={() => setPriorityFilter('High')}>
                    <span>High</span>
                  </li>
                  <li className={`filter-item ${priorityFilter === 'Medium' ? 'active' : ''}`} onClick={() => setPriorityFilter('Medium')}>
                    <span>Medium</span>
                  </li>
                  <li className={`filter-item ${priorityFilter === 'Low' ? 'active' : ''}`} onClick={() => setPriorityFilter('Low')}>
                    <span>Low</span>
                  </li>
                </ul>
              </div>

              {(statusFilter || priorityFilter || searchQuery) && (
                <button 
                  className="btn btn-secondary" 
                  onClick={resetFilters} 
                  style={{ width: '100%', marginTop: '20px', padding: '10px', fontSize: '13px' }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Tasks Dashboard */}
          <main className="main-content">
            <div className="content-header">
              <div>
                <h2 style={{ fontSize: '24px', fontWeight: 7 }}>
                  {user?.role === 'admin' ? 'System Database Workspace' : 'My Personal Tasks'}
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Manage, prioritize, and track task completions
                </p>
              </div>
              <button className="btn btn-primary" onClick={handleCreateClick}>
                <Plus size={18} />
                <span>New Task</span>
              </button>
            </div>

            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={32} />
                <span style={{ marginLeft: '12px', fontSize: '18px' }}>Loading tasks...</span>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state glass-panel">
                <ListTodo className="empty-icon" size={48} />
                <h3 className="empty-title">No Tasks Found</h3>
                <p className="empty-subtitle">
                  {statusFilter || priorityFilter || searchTerm
                    ? 'No tasks match your current filter settings.'
                    : 'Get started by creating your first secure task.'}
                </p>
                {statusFilter || priorityFilter || searchTerm ? (
                  <button className="btn btn-secondary" onClick={resetFilters}>Clear Filters</button>
                ) : (
                  <button className="btn btn-primary" onClick={handleCreateClick}>
                    <Plus size={16} />
                    <span>Create Task</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="tasks-grid">
                {tasks.map((task) => (
                  <TaskItem
                    key={task._id}
                    task={task}
                    onEdit={handleEditClick}
                    onDelete={handleDeleteTask}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}
          </main>

        </div>
      )}

      {/* Modal Task Creation / Editing Dialog */}
      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onClose={() => setIsFormOpen(false)}
          onSave={handleSaveTask}
        />
      )}
    </div>
  );
};

export default Dashboard;
