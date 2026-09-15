import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Hardcoding production URL directly so the APK doesn't fall back to local IPs
export const getBaseUrl = (): string => {
    // If you are testing local backend changes, comment the line below
    // and uncomment the local IP address (replace with your actual local IPv4).
    // return 'https://swapup-b.onrender.com';
    return 'http://10.36.0.93:5000'; // Local backend
};

export const API_BASE_URL = `${getBaseUrl()}/api`;
export const SOCKET_URL = getBaseUrl();