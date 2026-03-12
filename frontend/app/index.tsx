import { useAuth } from '@/src/contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const { width } = Dimensions.get('window');


export default function RoleSelectionScreen() {
    const router = useRouter();
    const { setSelectedRole, isAuthenticated, user } = useAuth();

    React.useEffect(() => {
        if (isAuthenticated && user) {
            if (user.role === 'MANAGER') {
                router.replace('/(manager)/home');
            } else {
                router.replace('/(employee)/home');
            }
        }
    }, [isAuthenticated, user]);

    // const handleRoleSelect = (role: 'MANAGER' | 'EMPLOYEE') => {
    //     setSelectedRole(role);
    //     router.push('/login');
    // };
    const handleRoleSelect = (role: 'MANAGER' | 'EMPLOYEE') => {
        setSelectedRole(role);
        // FOR TESTING: Bypass the login screen entirely
        if (role === 'MANAGER') {
            router.replace('/(manager)/home');
        } else {
            router.replace('/(employee)/home');
        }
    };


    return (
        <LinearGradient
            colors={['#FFFFFF', '#F0EAF8', '#D8BEF0']}
            locations={[0, 0.45, 1]}
            style={styles.container}
        >
            <StatusBar barStyle="dark-content" />


            <View style={styles.logoContainer}>

                <Image
                    source={require('@/assets/images/logo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </View>

            {/* Title */}
            <Text style={styles.title}>Hello, User !</Text>
            <Text style={styles.subtitle}>You are a ?</Text>

            {/* Role Selection Cards */}
            <View style={styles.cardsContainer}>
                {/* Manager Card */}
                <TouchableOpacity
                    style={styles.cardWrapper}
                    onPress={() => handleRoleSelect('MANAGER')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#B8D4EE', '#C8B8E4']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.card}
                    >
                        <Text style={styles.cardText}>Manager</Text>
                    </LinearGradient>
                </TouchableOpacity>

                {/* Employee Card */}
                <TouchableOpacity
                    style={styles.cardWrapper}
                    onPress={() => handleRoleSelect('EMPLOYEE')}
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={['#CCC0E8', '#E4C0D8']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.card}
                    >
                        <Text style={styles.cardText}>Employee</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 120,
    },

    // ── Logo ────────────────────────────────────────────────────────────────
    logoContainer: {
        marginBottom: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoPlaceholder: {
        width: 110,
        height: 70,

    },
    /** Style for the real logo image — adjust width/height to taste. */
    logoImage: {
        width: 110,
        height: 70,
    },

    //Text
    title: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1A1A2E',
        marginBottom: 8,
        letterSpacing: 0.2,
    },
    subtitle: {
        fontSize: 17,
        color: '#555',
        marginBottom: 56,
        fontWeight: '400',
    },

    //Cards 
    cardsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 24,
        gap: 18,
    },
    cardWrapper: {
        borderRadius: 18,
        overflow: 'hidden',
        shadowColor: '#9B8EC4',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.22,
        shadowRadius: 10,
        elevation: 6,
    },
    card: {
        width: (width - 66) / 2,
        height: 145,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 18,
    },
    cardText: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1A1A2E',
        letterSpacing: 0.1,
    },
});