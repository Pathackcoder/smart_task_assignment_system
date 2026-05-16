const Task = require('../models/Task');
const User = require('../models/User');

const priorityPoints = {
  low: 1,
  medium: 3,
  high: 5
};

const activeStatuses = ['pending', 'in_progress'];

const calculateUserWorkloads = async () => {
  const activeUsers = await User.find({ isActive: true }).sort({ createdAt: 1 });

  if (activeUsers.length === 0) {
    const error = new Error('No active users available for task assignment');
    error.statusCode = 400;
    throw error;
  }

  const tasks = await Task.find({
    status: { $in: activeStatuses },
    assignedTo: { $in: activeUsers.map((user) => user._id) }
  });

  return activeUsers.map((user) => {
    const assignedTasks = tasks.filter(
      (task) => task.assignedTo.toString() === user._id.toString()
    );

    const workload = assignedTasks.reduce(
      (total, task) => total + priorityPoints[task.priority],
      0
    );

    return {
      user,
      workload,
      activeTaskCount: assignedTasks.length
    };
  });
};

const findBestAssignee = async () => {
  const workloads = await calculateUserWorkloads();

  const [bestCandidate] = workloads.sort((a, b) => {
    if (a.workload !== b.workload) return a.workload - b.workload;
    if (a.activeTaskCount !== b.activeTaskCount) {
      return a.activeTaskCount - b.activeTaskCount;
    }
    return a.user.createdAt - b.user.createdAt;
  });

  return {
    user: bestCandidate.user,
    assignmentSnapshot: workloads.map(({ user, workload, activeTaskCount }) => ({
      userId: user._id,
      name: user.name,
      workload,
      activeTaskCount,
      createdAt: user.createdAt
    }))
  };
};

module.exports = {
  activeStatuses,
  priorityPoints,
  calculateUserWorkloads,
  findBestAssignee
};
