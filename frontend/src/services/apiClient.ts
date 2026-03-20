
// apiClient.ts
// Base fetch wrapper — attaches token & base URL for all service calls


import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_BASE_URL } from '../utils/config';

export const BASE_URL = API_BASE_URL;

// ---------------------------------------------------------------------------
// Token helpers — reads from AsyncStorage (written by AuthContext on login)
// ---------------------------------------------------------------------------
// For physical device testing use your machine's LAN IP, e.g. 'http://192.168.1.XX:5000/api'
// For Android emulator use 'http://10.0.2.2:5000/api'
//export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:5000/api';


// Token provider — reads from AsyncStorage (set by AuthContext on login)

let _token: string | null = null;

export const setAuthToken = (token: string | null) => {
    _token = token;
};

export const getAuthToken = async (): Promise<string | null> => {
    // First check in-memory cache
    if (_token) return _token;
    // Fall back to AsyncStorage (set by AuthContext on login)
    try {
        const storedToken = await AsyncStorage.getItem('authToken');
        if (storedToken) {
            _token = storedToken; // cache it in memory
        }
        return storedToken;
    } catch {
        return null;
    }
};


// Dev auth — auto-login as E-C-001 (TEMPORARY)
// Call this once on app startup before making any API calls.

let _devAuthPromise: Promise<void> | null = null;

export async function initDevAuth(workerId = 'E-C-001'): Promise<void> {
    // Only run once
    if (_devAuthPromise) return _devAuthPromise;

    _devAuthPromise = (async () => {
        try {
            const res = await fetch(`${BASE_URL}/dev-login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ workerId }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error('Dev auth failed:', data.error);
                return;
            }

            _token = data.token;
            console.log(`✅ Dev auth: logged in as ${data.user.name} (${data.user.department})`);
        } catch (err) {
            console.error('Dev auth network error:', err);
        }
    })();

    return _devAuthPromise;
}


// Core request helper

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';

export async function apiRequest<T>(
    method: Method,
    path: string,
    body?: object,
    params?: Record<string, string>
): Promise<T> {
    const token = await getAuthToken();

    let url = `${BASE_URL}${path}`;

    if (params && Object.keys(params).length > 0) {
        const query = new URLSearchParams(params).toString();
        url = `${url}?${query}`;
    }

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data?.error ?? `Request failed with status ${response.status}`);
    }

    return data as T;
}
