const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// System context for the chatbot
const SYSTEM_CONTEXT = `You are DockerBot, an intelligent AI assistant for the Digital Dockers Suite - a workplace productivity platform similar to Jira.

Your capabilities include:
1. Helping users navigate the website and understand its features
2. Answering questions about tasks, projects, sprints, and meetings
3. Providing information about the user's assigned tasks and upcoming meetings
4. Explaining how to use features like the Task Board, Backlog, Roadmap, Reports, etc.

Key features of the platform:
- Task Management: Create tasks, assign to team members, set deadlines, track progress through Kanban board
- Sprint Planning: Create sprints, add tasks to sprints, track velocity
- Backlog: Manage and prioritize upcoming work
- Meetings: Upload meeting recordings to get AI-generated summaries
- Email Generator: Generate professional emails with AI assistance
- Documents: Upload and analyze compliance documents
- Organization Chart: View team structure
- Wellness Check-in: Track employee wellbeing

Navigation tips:
- Dashboard: Overview with metrics and recent activity
- Board: Kanban-style task board for active sprint
- Backlog: View and manage all tasks not in a sprint
- Roadmap: Visual timeline of project milestones
- Reports: Analytics and burndown charts

Be concise, helpful, and friendly. If the user asks about their specific data (tasks, meetings), use the context provided to give personalized responses.`;

/**
 * Generate a response using Gemini AI
 * @param {string} userMessage - The user's message
 * @param {object} userContext - Context about the user's data
 * @returns {Promise<string>} - The AI response
 */
const generateResponse = async (userMessage, userContext = {}) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            return getFallbackResponse(userMessage);
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        // Build context from user data
        let contextPrompt = SYSTEM_CONTEXT;

        if (userContext.user) {
            contextPrompt += `\n\nCurrent user: ${userContext.user.fullName} (${userContext.user.role})`;
        }

        if (userContext.tasks && userContext.tasks.length > 0) {
            contextPrompt += `\n\nUser's assigned tasks (${userContext.tasks.length} total):`;
            userContext.tasks.slice(0, 5).forEach(task => {
                contextPrompt += `\n- [${task.key || 'TASK'}] ${task.title} (Status: ${task.status}, Priority: ${task.priority})`;
                if (task.dueDate) {
                    contextPrompt += ` - Due: ${new Date(task.dueDate).toLocaleDateString()}`;
                }
            });
        }

        if (userContext.meetings && userContext.meetings.length > 0) {
            contextPrompt += `\n\nUpcoming meetings:`;
            userContext.meetings.slice(0, 3).forEach(meeting => {
                contextPrompt += `\n- ${meeting.title} on ${new Date(meeting.scheduledAt || meeting.createdAt).toLocaleDateString()}`;
            });
        }

        if (userContext.projects && userContext.projects.length > 0) {
            contextPrompt += `\n\nUser's projects: ${userContext.projects.map(p => p.name).join(', ')}`;
        }

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: contextPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand. I am DockerBot, ready to assist users with the Digital Dockers Suite. I will use the provided context to give personalized responses.' }],
                },
            ],
        });

        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        return response.text();

    } catch (error) {
        console.error('Gemini API Error:', error);
        return getFallbackResponse(userMessage);
    }
};

/**
 * Fallback responses when API is not available
 */
const getFallbackResponse = (message) => {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
        return "Hello! I'm DockerBot, your assistant for Digital Dockers Suite. How can I help you today?";
    }

    if (lowerMsg.includes('task') || lowerMsg.includes('create')) {
        return "To create a new task, click the 'Create' button in the header, or navigate to the Backlog and use the sprint creation panel. You can set assignees, deadlines, and priorities for each task.";
    }

    if (lowerMsg.includes('meeting')) {
        return "You can view meetings in the Meetings section from the sidebar. The platform supports uploading meeting recordings to automatically generate AI summaries with key points, decisions, and action items.";
    }

    if (lowerMsg.includes('sprint')) {
        return "Sprints help organize your work into time-boxed iterations. Go to Backlog to create a sprint, then drag tasks into it. Start the sprint when ready, and track progress on the Board.";
    }

    if (lowerMsg.includes('help') || lowerMsg.includes('what can you do')) {
        return "I can help you with:\n• Navigating the Digital Dockers platform\n• Finding information about your tasks and meetings\n• Explaining how to use features like Board, Backlog, and Reports\n• Tips for task management and collaboration\n\nJust ask me anything!";
    }

    return "I'm here to help you navigate the Digital Dockers Suite! You can ask me about tasks, sprints, meetings, or any feature of the platform. For example, try asking 'How do I create a task?' or 'What are my upcoming meetings?'";
};

module.exports = {
    generateResponse
};
