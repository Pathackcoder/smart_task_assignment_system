const { body } = require('express-validator');

const createTaskValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').optional().trim(),
  body('priority').isIn(['low', 'medium', 'high']).withMessage('Priority is invalid')
];

const updateTaskValidator = [
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty'),
  body('description').optional().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high']).withMessage('Priority is invalid'),
  body('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed'])
    .withMessage('Status is invalid')
];

module.exports = { createTaskValidator, updateTaskValidator };
