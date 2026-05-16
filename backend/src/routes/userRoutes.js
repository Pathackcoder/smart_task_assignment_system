const express = require('express');
const { body } = require('express-validator');
const {
  getUsers,
  createUser,
  updateUserAvailability
} = require('../controllers/userController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const { userValidator } = require('../validators/userValidators');

const router = express.Router();

router.use(protect);

router.get('/', getUsers);
router.post('/', requireAdmin, userValidator, validateRequest, createUser);
router.patch(
  '/:id/availability',
  requireAdmin,
  body('isActive').isBoolean().withMessage('isActive must be true or false'),
  validateRequest,
  updateUserAvailability
);

module.exports = router;
