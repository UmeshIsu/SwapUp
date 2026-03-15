import { Router } from 'express';
import { getChatThreads, getMessages, sendMessage } from '../controllers/chatController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.use(authMiddleware);

router.get('/threads', getChatThreads);
router.get('/messages/:conversationId', getMessages);
router.post('/messages/:conversationId', sendMessage);

export default router;
