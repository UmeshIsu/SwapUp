import { Platform } from 'react-native';

const BASE_URL = Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api' // Android emulator default gateway
    : 'http://localhost:5000/api';

export const apiCall = async (endpoint: string, options: any = {}) => {
    const { method = 'GET', body, token, ...rest } = options;

    const headers: any = {
        'Content-Type': 'application/json',
        ...rest.headers,
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method,
        headers,
        ...rest,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error: any) {
        console.error(`API Error (${endpoint}):`, error.message);
        throw error;
    }
};
