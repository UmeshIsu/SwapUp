export interface AppNotification {
    id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
}

interface NotificationMeta {
    icon: string;
    color: string;
    bg: string;
}

const META: Record<string, NotificationMeta> = {
    SWAP_REQUESTED: { icon: 'swap-horizontal', color: '#1373D0', bg: '#EFF6FF' },
    SWAP_ACCEPTED: { icon: 'checkmark-circle', color: '#15803D', bg: '#ECFDF5' },
    SWAP_APPROVED: { icon: 'checkmark-done-circle', color: '#15803D', bg: '#ECFDF5' },
    LEAVE_REQUESTED: { icon: 'document-text', color: '#1373D0', bg: '#EFF6FF' },
    LEAVE_APPROVED: { icon: 'checkmark-circle', color: '#15803D', bg: '#ECFDF5' },
    FATIGUE_ALERT: { icon: 'warning', color: '#DC2626', bg: '#FEF2F2' },
};

const DEFAULT_META: NotificationMeta = { icon: 'notifications', color: '#475569', bg: '#F1F5F9' };

export function getNotificationMeta(type: string): NotificationMeta {
    return META[type] ?? DEFAULT_META;
}

export function getRosterPublishedDates(notification: AppNotification): string[] {
    if (notification.type !== 'ROSTER_PUBLISHED') {
        return [];
    }

    const dates = notification.metadata?.dates;
    if (!Array.isArray(dates)) {
        return [];
    }

    return dates.filter((date): date is string => typeof date === 'string' && date.length > 0);
}

export function formatRelativeTime(iso: string): string {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
