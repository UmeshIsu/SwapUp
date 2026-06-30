import { Request, Response } from 'express';
import { prisma } from '../config/prisma';

// GET /api/notifications
export const getMyNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        });
        res.json(notifications);
    } catch (error) {
        console.error('getMyNotifications error:', error);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// GET /api/notifications/unread-count
export const getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const count = await prisma.notification.count({ where: { userId, isRead: false } });
        res.json({ count });
    } catch (error) {
        console.error('getUnreadCount error:', error);
        res.status(500).json({ error: 'Failed to fetch unread count' });
    }
};

// PATCH /api/notifications/:id/read
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        const id = req.params.id as string;

        const notification = await prisma.notification.findUnique({ where: { id } });
        if (!notification || notification.userId !== userId) {
            res.status(404).json({ error: 'Notification not found' });
            return;
        }

        const updated = await prisma.notification.update({
            where: { id },
            data: { isRead: true },
        });
        res.json(updated);
    } catch (error) {
        console.error('markAsRead error:', error);
        res.status(500).json({ error: 'Failed to update notification' });
    }
};

// PATCH /api/notifications/read-all
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.id;
        await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('markAllAsRead error:', error);
        res.status(500).json({ error: 'Failed to update notifications' });
    }
};
