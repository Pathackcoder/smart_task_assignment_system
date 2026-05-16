const User = require('../models/User');
const { calculateUserWorkloads } = require('../services/assignmentService');

const getUsers = async (req, res, next) => {
  try {
    const workloads = await calculateUserWorkloads().catch(() => []);
    const workloadMap = new Map(
      workloads.map((item) => [
        item.user._id.toString(),
        {
          workload: item.workload,
          activeTaskCount: item.activeTaskCount
        }
      ])
    );

    const users = await User.find()
      .select(req.user.role === 'admin' ? '-password +passwordPreview' : '-password -passwordPreview')
      .sort({ createdAt: 1 });
    const response = users.map((user) => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      password: req.user.role === 'admin' ? user.passwordPreview || null : undefined,
      createdAt: user.createdAt,
      workload: workloadMap.get(user._id.toString())?.workload || 0,
      activeTaskCount: workloadMap.get(user._id.toString())?.activeTaskCount || 0
    }));

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, isActive } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      passwordPreview: password,
      role,
      isActive
    });
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  } catch (error) {
    next(error);
  }
};

const updateUserAvailability = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString() && req.body.isActive === false) {
      return res.status(400).json({ message: 'You cannot deactivate your own admin account' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, createUser, updateUserAvailability };
