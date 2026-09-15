import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SEEN_KEY_PREFIX = 'chat:lastSeen:';

const getLastSeenKey = (conversationId: string) => `${LAST_SEEN_KEY_PREFIX}${conversationId}`;

export async function getConversationReadState(conversationIds: string[]): Promise<Record<string, string>> {
    const entries = await Promise.all(
        conversationIds.map(async (conversationId) => [conversationId, await AsyncStorage.getItem(getLastSeenKey(conversationId))] as const)
    );

    return Object.fromEntries(entries.filter(([, value]) => Boolean(value)) as Array<readonly [string, string]>);
}

export async function markConversationAsRead(conversationId: string, seenAt: string = new Date().toISOString()): Promise<void> {
    await AsyncStorage.setItem(getLastSeenKey(conversationId), seenAt);
}