import Constants from 'expo-constants';
import { Platform } from 'react-native';

const LAN_IP = '10.80.152.231';
const EMULATOR_IP = '10.0.2.2';

export const getBaseUrl = (): string => {
    // If it's a physical device, use the LAN IP
    if (Constants.isDevice) {
        return `http://${LAN_IP}:5000`;
    }

    // If it's an emulator/simulator, use the standard loopback
    // 10.0.2.2 is for Android emulator, localhost is usually fine for iOS simulator
    if (Platform.OS === 'android') {
        return `http://${EMULATOR_IP}:5000`;
    }

    return `http://${LAN_IP}:5000`;
};

export const API_BASE_URL = `${getBaseUrl()}/api`;
export const SOCKET_URL = getBaseUrl();