import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Hardcoding production URL directly so the APK doesn't fall back to local IPs
export const getBaseUrl = (): string => {
    return 'https://swapup-b.onrender.com';
};

export const API_BASE_URL = `${getBaseUrl()}/api`;
export const SOCKET_URL = getBaseUrl();