import React, { useState, useEffect } from 'react';
import { X, Calendar, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TaskForm = ({ task, onClose, onSave }) => {
  const { showToast } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pending',
    priority: 'Medium',
    dueDate: ''
  });

  useEffect(() => {
    if (task) {
      // Pre-fill form if editing
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'Pending',
        priority: task.priority || 'Medium',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
      });
    } else {
      // Set default due date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData((prev) => ({
        ...prev,
        dueDate: tomorrow.toISOString().split('T')[0]
      }));
    }
  }, [task]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      showToast('Task title is required', 'error');
      return;
    }
    if (!formData.dueDate) {
      showToast('Due date is required', 'error');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="glass-panel modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{task ? 'Edit Task' : 'Create Task'}</h3>
          <X className="modal-close" onClick={onClose} size={24} />
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="title">Task Title</label>
            <div className="search-container" style={{ marginBottom: 0 }}>
              <input
                id="title"
                name="title"
                type="text"
                required
                maxLength="100"
                className="input-control search-input"
                placeholder="Write reports, build API..."
                value={formData.title}
                onChange={handleChange}
              />
              <ClipboardList className="search-icon" size={18} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="input-control"
              placeholder="Provide some details about this task..."
              value={formData.description}
              onChange={handleChange}
              style={{ resize: 'none', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="input-control"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                className="input-control"
                value={formData.priority}
                onChange={handleChange}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="dueDate">Due Date</label>
            <div className="search-container" style={{ marginBottom: 0 }}>
              <input
                id="dueDate"
                name="dueDate"
                type="date"
                required
                className="input-control search-input"
                value={formData.dueDate}
                onChange={handleChange}
              />
              <Calendar className="search-icon" size={18} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
