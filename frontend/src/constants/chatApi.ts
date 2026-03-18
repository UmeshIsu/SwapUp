import { getBaseUrl } from '../utils/config';

// ─── Change this to your friend's API URL when ready ───────────────────────
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? getBaseUrl();
