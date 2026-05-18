const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const signToken = require('../utils/signToken');

function userPayload(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError('Email already exists', 409);
  }

  const user = await User.create({ name, email, password, role: role || 'Member' });
  const token = signToken(user);

  res.status(201).json({ token, user: userPayload(user) });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = signToken(user);
  res.json({ token, user: userPayload(user) });
});

const me = asyncHandler(async (req, res) => {
  res.json({ data: userPayload(req.user) });
});

module.exports = { signup, login, me };
