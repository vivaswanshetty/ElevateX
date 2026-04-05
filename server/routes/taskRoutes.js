const express = require('express');
const { createTask, getTasks, getTaskById, applyForTask, assignTask, completeTask, addTaskMessage, editTaskMessage, deleteTaskMessage, reactToMessage, markMessagesAsRead, updateTask, deleteTask } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { taskValidation, mongoIdParam, validate } = require('../middleware/validation');
const { writeLimiter, uploadLimiter } = require('../middleware/rateLimiter');
const router = express.Router();

router.route('/')
    .post(protect, uploadLimiter, upload.single('image'), taskValidation, validate, createTask)
    .get(getTasks);
router.route('/:id')
    .get(mongoIdParam(), validate, getTaskById)
    .put(protect, writeLimiter, mongoIdParam(), validate, updateTask)
    .delete(protect, mongoIdParam(), validate, deleteTask);
router.route('/:id/apply').put(protect, writeLimiter, mongoIdParam(), validate, applyForTask);
router.route('/:id/assign').put(protect, writeLimiter, mongoIdParam(), validate, assignTask);
router.route('/:id/complete').put(protect, writeLimiter, mongoIdParam(), validate, completeTask);
router.route('/:id/chat').post(protect, writeLimiter, addTaskMessage);
router.route('/:id/chat/read').put(protect, markMessagesAsRead);
router.route('/:id/chat/:messageId').put(protect, editTaskMessage).delete(protect, deleteTaskMessage);
router.route('/:id/chat/:messageId/react').post(protect, reactToMessage);

module.exports = router;
