const Task = require('../models/Task');
const { findBestAssignee } = require('../services/assignmentService');

const populateAssignee = { path: 'assignedTo', select: 'name email isActive' };

const getTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find()
      .populate(populateAssignee)
      .sort({ createdAt: -1 });

    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;
    const { user, assignmentSnapshot } = await findBestAssignee();

    const task = await Task.create({
      title,
      description,
      priority,
      assignedTo: user._id
    });

    const populatedTask = await task.populate(populateAssignee);

    res.status(201).json({
      task: populatedTask,
      assignedTo: {
        id: user._id,
        name: user.name,
        email: user.email
      },
      assignmentSnapshot
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate(populateAssignee);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    next(error);
  }
};

const getWorkloadSummary = async (req, res, next) => {
  try {
    const { assignmentSnapshot } = await findBestAssignee();
    res.status(200).json(assignmentSnapshot);
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, updateTask, getWorkloadSummary };
