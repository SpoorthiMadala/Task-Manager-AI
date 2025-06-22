const aiService = require('../services/aiService');
const Task = require('../models/Task');

// Generate AI suggestions for a task
const generateTaskSuggestions = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findOne({ _id: taskId, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const suggestions = await aiService.generateTaskSuggestions(task);
    
    // Save suggestions to task
    task.aiSuggestions = task.aiSuggestions.concat(suggestions.map(s => ({
      type: s.type,
      content: s.content
    })));
    await task.save();

    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('AI suggestion error:', error);
    res.status(500).json({ message: 'Error generating AI suggestions' });
  }
};

// Generate task description using AI
const generateTaskDescription = async (req, res) => {
  try {
    const { title, category } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const description = await aiService.generateTaskDescription(title, category);
    
    res.json({
      success: true,
      data: { description }
    });
  } catch (error) {
    console.error('AI description generation error:', error);
    res.status(500).json({ message: 'Error generating task description' });
  }
};

// Generate task breakdown
const generateTaskBreakdown = async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const task = await Task.findOne({ _id: taskId, user: req.user.id });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const breakdown = await aiService.generateTaskBreakdown(task);
    
    res.json({
      success: true,
      data: breakdown
    });
  } catch (error) {
    console.error('AI breakdown error:', error);
    res.status(500).json({ message: 'Error generating task breakdown' });
  }
};

// Smart task categorization
const categorizeTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }

    const category = await aiService.categorizeTask(title, description);
    
    res.json({
      success: true,
      data: { category }
    });
  } catch (error) {
    console.error('AI categorization error:', error);
    res.status(500).json({ message: 'Error categorizing task' });
  }
};

module.exports = {
  generateTaskSuggestions,
  generateTaskDescription,
  generateTaskBreakdown,
  categorizeTask
};
