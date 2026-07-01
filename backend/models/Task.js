const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'In Progress', 'Completed'],
        message: '{VALUE} is not a valid status'
      },
      default: 'Pending'
    },
    priority: {
      type: String,
      enum: {
        values: ['Low', 'Medium', 'High'],
        message: '{VALUE} is not a valid priority'
      },
      default: 'Medium'
    },
    dueDate: {
      type: Date,
      required: [true, 'Please provide a due date']
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A task must belong to a user']
    }
  },
  {
    timestamps: true
  }
);

// Indexes to speed up queries by owner user and filters
taskSchema.index({ user: 1, status: 1 });
taskSchema.index({ user: 1, dueDate: 1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
