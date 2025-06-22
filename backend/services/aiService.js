const axios = require('axios');

class AIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async makeRequest(prompt, maxTokens = 200) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful task management assistant. Provide concise, actionable suggestions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: maxTokens,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('OpenAI API error:', error.response?.data || error.message);
      throw new Error('Failed to generate AI response');
    }
  }

  async generateTaskSuggestions(task) {
    const prompt = `Given this task:
Title: ${task.title}
Description: ${task.description || 'No description'}
Priority: ${task.priority}
Status: ${task.status}

Provide 3 helpful suggestions to improve task completion. Format as JSON array with objects containing 'type' (improvement/subtask/resource) and 'content' fields.`;

    try {
      const response = await this.makeRequest(prompt, 300);
      return JSON.parse(response);
    } catch (error) {
      // Fallback to structured suggestions
      return [
        {
          type: 'improvement',
          content: 'Break down this task into smaller, manageable steps'
        },
        {
          type: 'resource',
          content: 'Consider using productivity tools or setting reminders'
        },
        {
          type: 'subtask',
          content: 'Create a checklist of required actions'
        }
      ];
    }
  }

  async generateTaskDescription(title, category) {
    const prompt = `Generate a helpful description for a task titled "${title}"${category ? ` in the ${category} category` : ''}. Keep it concise and actionable (max 100 words).`;

    try {
      return await this.makeRequest(prompt, 150);
    } catch (error) {
      return `Task: ${title}. Please add specific details about what needs to be accomplished, deadlines, and any requirements.`;
    }
  }

  async generateTaskBreakdown(task) {
    const prompt = `Break down this task into 3-5 specific steps:
Title: ${task.title}
Description: ${task.description || 'No description'}

Provide a numbered list of actionable steps.`;

    try {
      const response = await this.makeRequest(prompt, 250);
      return response.split('\n').filter(line => line.trim()).map(step => step.replace(/^\d+\.?\s*/, ''));
    } catch (error) {
      return [
        'Plan and gather required resources',
        'Start working on the main task',
        'Review and refine the work',
        'Complete and mark as done'
      ];
    }
  }

  async categorizeTask(title, description) {
    const prompt = `Categorize this task into one of these categories: Work, Personal, Health, Learning, Finance, Home, or Other.
Title: ${title}
Description: ${description || 'No description'}

Respond with just the category name.`;

    try {
      const response = await this.makeRequest(prompt, 50);
      const validCategories = ['Work', 'Personal', 'Health', 'Learning', 'Finance', 'Home', 'Other'];
      const category = response.trim();
      return validCategories.includes(category) ? category : 'Other';
    } catch (error) {
      return 'Other';
    }
  }
}

module.exports = new AIService();
