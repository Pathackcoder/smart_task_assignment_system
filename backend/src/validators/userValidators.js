const { body } = require('express-validator');

const userValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Role is invalid'),
  body('isActive').optional().isBoolean().withMessage('isActive must be true or false')
];

module.exports = { userValidator };
