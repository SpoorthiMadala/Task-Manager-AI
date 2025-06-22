const express = require('express');
const router = express.Router();
const {
  generateTaskSuggestions,
  generateTaskDescription,
  generateTaskBreakdown,
  categorizeTask
} = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// @route   POST /api/ai/suggestions/:taskId
// @desc    Generate AI suggestions for a task
// @access  Private
router.post('/suggestions/:taskId', generateTaskSuggestions);

// @route   POST /api/ai/description
// @desc    Generate task description
// @access  Private
router.post('/description', generateTaskDescription);

// @route   POST /api/ai/breakdown/:taskId
// @desc    Generate task breakdown
// @access  Private
router.post('/breakdown/:taskId', generateTaskBreakdown);

// @route   POST /api/ai/categorize
// @desc    Categorize task using AI
// @access  Private
router.post('/categorize', categorizeTask);

module.exports = router;
