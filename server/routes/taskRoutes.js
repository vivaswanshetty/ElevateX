const express = require('express');
const { createTask, getTasks, getTaskById, applyForTask, assignTask, completeTask, addTaskMessage, editTaskMessage, deleteTaskMessage, reactToMessage, markMessagesAsRead, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').post(protect, createTask).get(getTasks);
router.route('/:id').get(getTaskById).put(protect, updateTask).delete(protect, deleteTask);
router.route('/:id/apply').put(protect, applyForTask);
router.route('/:id/assign').put(protect, assignTask);
router.route('/:id/complete').put(protect, completeTask);
router.route('/:id/chat').post(protect, addTaskMessage);
router.route('/:id/chat/read').put(protect, markMessagesAsRead);
router.route('/:id/chat/:messageId').put(protect, editTaskMessage).delete(protect, deleteTaskMessage);
router.route('/:id/chat/:messageId/react').post(protect, reactToMessage);

module.exports = router;
