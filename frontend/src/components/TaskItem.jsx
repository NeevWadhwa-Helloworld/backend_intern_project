import React from 'react';
import { Calendar, User, Edit2, Trash2, AlertCircle } from 'lucide-react';

const TaskItem = ({ task, onEdit, onDelete, currentUserId }) => {
  const { _id, title, description, status, priority, dueDate, user } = task;

  const formatDate = (dateString) => {
    if (!dateString) return 'No date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = () => {
    if (status === 'Completed') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  };

  const overdue = isOverdue();

  return (
    <div className="glass-panel task-card glass-panel-hover">
      <div>
        <div className="task-card-header">
          <h4 className="task-title">{title}</h4>
          <span className={`priority-tag ${priority}`}>{priority}</span>
        </div>
        <p className="task-desc">{description || 'No description provided.'}</p>
      </div>

      <div>
        <div className="task-card-footer">
          <div className="task-meta">
            <div className="status-indicator">
              <span className={`dot ${status.replace(' ', '_')}`}></span>
              <span>{status}</span>
            </div>
            
            <div className="meta-item" style={{ color: overdue ? 'var(--color-danger)' : 'var(--text-muted)' }}>
              <Calendar size={13} />
              <span>Due: {formatDate(dueDate)}</span>
              {overdue && (
                <span className="meta-item" style={{ color: 'var(--color-danger)', fontWeight: 6, gap: '2px' }}>
                  <AlertCircle size={13} />
                  <span>Overdue</span>
                </span>
              )}
            </div>

            {/* Show task owner only if viewed by an admin and it belongs to another user */}
            {user && user.username && (
              <div className="meta-item">
                <User size={13} />
                <span>Owner: {user.username}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-icon" onClick={() => onEdit(task)} title="Edit Task">
              <Edit2 size={16} />
            </button>
            <button className="btn btn-icon btn-icon-danger" onClick={() => onDelete(_id)} title="Delete Task">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
