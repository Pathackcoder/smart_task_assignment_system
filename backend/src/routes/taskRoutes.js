const express = require('express');
const {
  getTasks,
  createTask,
  updateTask,
  getWorkloadSummary
} = require('../controllers/taskController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const validateRequest = require('../middleware/validateRequest');
const {
  createTaskValidator,
  updateTaskValidator
} = require('../validators/taskValidators');

const router = express.Router();

router.use(protect);

router.get('/', getTasks);
router.post('/', requireAdmin, createTaskValidator, validateRequest, createTask);
router.patch('/:id', requireAdmin, updateTaskValidator, validateRequest, updateTask);
router.get('/reports/workloads', getWorkloadSummary);

module.exports = router;
