const mongoose = require('mongoose');
const User = require('../models/User');
const Task = require('../models/Task');
const AIConversation = require('../models/AIConversation');

// @desc    Get all AI conversations for the logged-in user
// @route   GET /api/assistant/conversations
// @access  Private
const getConversations = async (req, res) => {
    try {
        const conversations = await AIConversation.find({ user: req.user._id })
            .select('_id title updatedAt messages')
            .sort({ updatedAt: -1 });

        const formatted = conversations.map(c => ({
            _id: c._id,
            title: c.title,
            updatedAt: c.updatedAt,
            messageCount: c.messages.length,
            lastMessage: c.messages.length > 0 ? c.messages[c.messages.length - 1].content : ''
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Fetch AI Conversations Error:', error);
        res.status(500).json({ message: 'Server error fetching chat history' });
    }
};

// @desc    Get details of a single AI conversation
// @route   GET /api/assistant/conversations/:id
// @access  Private
const getConversationDetails = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid conversation ID' });
        }
        const conversation = await AIConversation.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.json(conversation);
    } catch (error) {
        console.error('Fetch AI Conversation Details Error:', error);
        res.status(500).json({ message: 'Server error fetching chat details' });
    }
};

// @desc    Create a new AI conversation
// @route   POST /api/assistant/conversations
// @access  Private
const createConversation = async (req, res) => {
    try {
        const conversation = await AIConversation.create({
            user: req.user._id,
            title: 'New Chat Session',
            messages: []
        });

        res.status(201).json(conversation);
    } catch (error) {
        console.error('Create AI Conversation Error:', error);
        res.status(500).json({ message: 'Server error creating chat session' });
    }
};

// @desc    Delete an AI conversation
// @route   DELETE /api/assistant/conversations/:id
// @access  Private
const deleteConversation = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid conversation ID' });
        }
        const conversation = await AIConversation.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        res.json({ message: 'Conversation deleted successfully' });
    } catch (error) {
        console.error('Delete AI Conversation Error:', error);
        res.status(500).json({ message: 'Server error deleting chat session' });
    }
};

// Helper function to build Elev AI's personality and inject system context
const getSystemPrompt = (user, openTasks, otherUsers) => {
    const level = Math.floor((user.xp || 0) / 500) + 1;
    const relicList = user.relics && user.relics.length > 0 
        ? user.relics.map(r => `${r.name} (${r.tier} Tier, Bonus: ${r.bonus})`).join(', ')
        : 'None';
    
    const tasksText = openTasks && openTasks.length > 0
        ? openTasks.map(t => `- [${t.title}] (${t.category}) | Reward: ${t.coins} coins | ${t.description.substring(0, 120)}...`).join('\n')
        : 'No open tasks are currently available.';

    const peersText = otherUsers && otherUsers.length > 0
        ? otherUsers.map(u => `- ${u.name} (Level ${Math.floor((u.xp || 0) / 500) + 1}): ${u.bio || 'No biography'}`).join('\n')
        : 'No other active users are online right now.';

    return `You are Elev AI, the official AI Assistant & Productivity Guide for ElevateX. 
ElevateX is a gamified micro-skill marketplace where clients post tasks and helpers complete them to earn XP and coins.

--- DYNAMIC USER PROFILE INFO ---
- Active User Name: ${user.name}
- Email: ${user.email}
- Bio: ${user.bio || 'None set'}
- Current XP: ${user.xp || 0} (Level ${level})
- Current Coins: ${user.coins || 0}
- Focus Essences: Focus: ${user.essences?.focus || 0}, Creativity: ${user.essences?.creativity || 0}, Discipline: ${user.essences?.discipline || 0}
- Relics Crafted: ${relicList}
- Subscription: ${user.subscription?.plan || 'free'}

--- LIVE TASKS AVAILABLE ---
${tasksText}

--- OTHER REGISTERED USERS ---
${peersText}

--- YOUR ROLE AND PERSONA ---
1. **Coach & Guide**: Encourage the user. Mention their stats (XP, level, relics) naturally when relevant to make the conversation feel deeply customized.
2. **Task Recommendations**: If they ask for work, suggest tasks from the list above that match their bio/skills, or give advice on how to create high-quality tasks.
3. **Explaining Mechanics**: Explain how gamification works:
   * **XP**: Level up (every 500 XP is a level).
   * **Coins**: Earn by doing tasks, spend on Razorpay Subscriptions (Pro/Elite) or items.
   * **Alchemy Lab**: Craft "Relics" using Focus Essences earned from completing tasks or duels.
   * **Duels**: Productivity face-offs between two users.
   * **Resonance Room**: A networking and audio room where users connect.
4. **Tone**: Warm, encouraging, slightly tech-savvy, concise. Do not write extremely long essays. Use bullet points and bold text where appropriate.
5. **Formatting**: Always format your output in clean, readable Markdown. Include code blocks or list formats if they help present information.`;
};

// @desc    Send a message to Elev AI and get a response
// @route   POST /api/assistant/conversations/:id/chat
// @access  Private
const chatWithAssistant = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || content.trim() === '') {
            return res.status(400).json({ message: 'Message content is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid conversation ID' });
        }

        const conversation = await AIConversation.findOne({
            _id: req.params.id,
            user: req.user._id
        });

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }

        // Add user message
        conversation.messages.push({
            role: 'user',
            content: content
        });

        // Gather context
        const user = await User.findById(req.user._id);
        const openTasks = await Task.find({ status: 'Open', createdBy: { $ne: req.user._id } })
            .limit(5)
            .select('title description category coins');
        const otherUsers = await User.find({ _id: { $ne: req.user._id } })
            .limit(5)
            .select('name bio xp');

        const systemPrompt = getSystemPrompt(user, openTasks, otherUsers);
        
        let aiResponseText = '';
        const apiKey = process.env.GEMINI_API_KEY;

        if (apiKey && apiKey !== 'your_key' && !apiKey.startsWith('your_')) {
            try {
                // Format history for Gemini API
                // Gemini API takes messages as role: 'user' / 'model' and parts: [{ text: content }]
                const formattedContents = conversation.messages.map(m => ({
                    role: m.role,
                    parts: [{ text: m.content }]
                }));

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        contents: formattedContents,
                        systemInstruction: {
                            parts: [{ text: systemPrompt }]
                        },
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 1024
                        }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
                        aiResponseText = data.candidates[0].content.parts[0].text;
                    } else {
                        throw new Error('Unexpected response format from Gemini');
                    }
                } else {
                    const errData = await response.text();
                    console.error('Gemini API Error details:', errData);
                    throw new Error(`Gemini API returned status ${response.status}`);
                }
            } catch (err) {
                console.error('Error calling Gemini API, falling back to Demo Mode:', err.message);
                aiResponseText = generateDemoResponse(content, user, openTasks);
            }
        } else {
            // No API key -> Run in demo mode
            aiResponseText = generateDemoResponse(content, user, openTasks);
        }

        // Add AI response
        conversation.messages.push({
            role: 'model',
            content: aiResponseText
        });

        // Auto-rename chat title if it's the first message exchange and has default title
        if (conversation.title === 'New Chat Session' && conversation.messages.length <= 3) {
            // Clean up user message to make a neat title
            let cleanTitle = content.trim();
            if (cleanTitle.length > 28) {
                cleanTitle = cleanTitle.substring(0, 25) + '...';
            }
            conversation.title = cleanTitle;
        }

        await conversation.save();

        res.json({
            reply: aiResponseText,
            conversation: conversation
        });

    } catch (error) {
        console.error('AI Chat Error:', error);
        res.status(500).json({ message: 'Server error in AI Chatbot' });
    }
};

// Generates high-fidelity mock responses when API key is missing or calls fail (Ensures "no-crash" reliability)
const generateDemoResponse = (userInput, user, openTasks) => {
    const input = userInput.toLowerCase();
    const level = Math.floor((user.xp || 0) / 500) + 1;
    
    let reply = `🤖 **Elev AI Assistant (Demo Mode)**\n\n*(Note: Gemini API key is missing or inactive in your \`.env\` file. I'm running in demo mode to guarantee zero service interruption!)*\n\n`;

    if (input.includes('task') || input.includes('recommend') || input.includes('work')) {
        reply += `Hi **${user.name}**! I'd love to help you find some work. Since you are **Level ${level}**, you are qualified for various tasks.\n\n`;
        if (openTasks && openTasks.length > 0) {
            reply += `Here are the top tasks on our board right now:\n\n`;
            openTasks.forEach((t, i) => {
                reply += `${i+1}. **${t.title}** (${t.category}) — Reward: **${t.coins} coins**\n   *Description:* ${t.description.substring(0, 100)}...\n`;
            });
            reply += `\nGo ahead and navigate to the **Explore** page in the menu to apply!`;
        } else {
            reply += `The task board is currently empty. Why not head over to the **Create Task** page in the menu and publish your first task to test the platform?`;
        }
    } else if (input.includes('xp') || input.includes('level') || input.includes('coin') || input.includes('gamif')) {
        reply += `Here's a breakdown of the ElevateX gamification system:\n\n`;
        reply += `- **XP (Experience Points)**: You currently have **${user.xp} XP**. You level up every 500 XP. Leveling up unlocks badges and prestige status!\n`;
        reply += `- **Coins**: You currently have **${user.coins} Coins**. Use coins to buy subscriptions or request help on tasks.\n`;
        reply += `- **Essences**: You have **${user.essences?.focus || 0} Focus**, **${user.essences?.creativity || 0} Creativity**, and **${user.essences?.discipline || 0} Discipline** essences. You earn these from completing tasks and productivity duels.\n`;
        reply += `- **Alchemy**: Spend your essences in the **Alchemy Lab** to craft powerful Relics that boost your coin multiplier and profile visibility!`;
    } else if (input.includes('duel') || input.includes('challeng')) {
        reply += `Productivity Duels are a core feature of ElevateX!\n\n`;
        reply += `1. Navigate to the **Duels** page from the menu.\n`;
        reply += `2. Search for online users or challenge your friends to a focus sprint.\n`;
        reply += `3. Choose a duration (e.g. 25-minute Pomodoro) and stake some coins.\n`;
        reply += `4. The user who stays focused and completes their checklist wins the staked coins, XP, and focus essences!`;
    } else if (input.includes('alchemy') || input.includes('relic') || input.includes('essence')) {
        reply += `Welcome to the **Alchemy Lab** tutorial:\n\n`;
        reply += `- **Focus Essence**: Earned from completing technical tasks.\n`;
        reply += `- **Creativity Essence**: Earned from creative/design tasks.\n`;
        reply += `- **Discipline Essence**: Earned from completing your daily duels.\n\n`;
        reply += `Once you collect enough essences, head to `/alchemy` and click **Craft Relic**. Relics are displayed on your profile and provide multipliers for all future coins earned!`;
    } else {
        reply += `Hello **${user.name}**! I am Elev AI, your AI assistant and career companion. I can help you with:\n\n`;
        reply += `- 🎯 **Suggesting tasks** suited to your skills.\n`;
        reply += `- 🧪 **Explaining Focus Alchemy** and how to craft Relics.\n`;
        reply += `- ⚔️ **Guiding you on Duels** and gamified systems.\n`;
        reply += `- 👤 **Analyzing your user profile** (You are currently Level ${level} with ${user.coins} coins).\n\n`;
        reply += `How can I help you level up your day?`;
    }

    return reply;
};

module.exports = {
    getConversations,
    getConversationDetails,
    createConversation,
    deleteConversation,
    chatWithAssistant
};
