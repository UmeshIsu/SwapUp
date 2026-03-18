import { Router } from 'express';
import {
    getConversations,
    getOrCreateConversation,
    getUsers,
    searchDepartmentUsers,
    getSentSwapRequests,
    getIncomingSwapRequests,
    getMessages,
    sendMessage,
    respondSwapRequest,
    getManagerSwapApprovals,
} from '../controllers/chatController';

const router = Router();

router.get('/conversations/:userId', getConversations);
router.post('/conversations', getOrCreateConversation);
router.get('/users/search', searchDepartmentUsers);
router.get('/users', getUsers);
router.get('/sent-swap-requests/:userId', getSentSwapRequests);
router.get('/incoming-swap-requests/:userId', getIncomingSwapRequests);
router.get('/messages/:conversationId', getMessages);
router.post('/messages', sendMessage);
router.patch('/swap-requests/:id', respondSwapRequest);
router.get('/manager/swap-approvals', getManagerSwapApprovals);

export default router;
