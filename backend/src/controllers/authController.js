const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const authResponse = (user) => ({
  token: generateToken(user._id),
  user: {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive
  }
});

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'member';
    const user = await User.create({ name, email, password, passwordPreview: password, role });
    res.status(201).json(authResponse(user));
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +passwordPreview');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Your account is inactive' });
    }

    const adminCount = await User.countDocuments({ role: 'admin' });
    if (adminCount === 0) {
      const oldestUser = await User.findOne().sort({ createdAt: 1 }).select('_id');

      if (oldestUser?._id.toString() === user._id.toString()) {
        user.role = 'admin';
      }
    }

    if (!user.passwordPreview) {
      user.passwordPreview = password;
    }

    if (user.isModified('role') || user.isModified('passwordPreview')) {
      await user.save();
    }

    res.status(200).json(authResponse(user));
  } catch (error) {
    next(error);
  }
};

const getMe = (req, res) => {
  res.status(200).json({ user: req.user });
};

module.exports = { register, login, getMe };
