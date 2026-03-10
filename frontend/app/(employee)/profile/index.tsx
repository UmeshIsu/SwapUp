import React, { useState } from 'react';
import { StyleSheet, Image, TouchableOpacity, ScrollView, Alert, View, TextInput, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/src/components/themed-text';
import { ThemedView } from '@/src/components/themed-view';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Colors } from '@/src/constants/theme';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { useAppTheme } from '@/src/context/ThemeContext';
import { useAuth } from '@/src/context/AuthContext';
import { apiCall } from '@/src/services/api';

export default function ProfileScreen() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const router = useRouter();
    const { user, logout, updateUser, token } = useAuth();

    const { isDark, toggleTheme } = useAppTheme();

    // Edit state
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name ?? '');
    const [editEmail, setEditEmail] = useState(user?.email ?? '');
    const [editPhone, setEditPhone] = useState(user?.phone ?? '');
    const [editAvailability, setEditAvailability] = useState(user?.availabilityPreferences ?? '');
    const [isSaving, setIsSaving] = useState(false);

    const handleEditToggle = () => {
        if (isEditing) {
            handleSave();
        } else {
            setEditName(user?.name ?? '');
            setEditEmail(user?.email ?? '');
            setEditPhone(user?.phone ?? '');
            setEditAvailability(user?.availabilityPreferences ?? '');
            setIsEditing(true);
        }
    };

    const handleSave = async () => {
        if (!editName.trim()) {
            Alert.alert('Error', 'Name cannot be empty');
            return;
        }

        setIsSaving(true);
        try {
            const data = await apiCall('/user/profile', {
                method: 'PUT',
                token,
                body: {
                    name: editName.trim(),
                    email: editEmail.trim(),
                    phone: editPhone.trim(),
                    availabilityPreferences: editAvailability.trim(),
                },
            });
            updateUser(data.user);
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditName(user?.name ?? '');
        setEditEmail(user?.email ?? '');
        setEditPhone(user?.phone ?? '');
        setEditAvailability(user?.availabilityPreferences ?? '');
    };

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Yes, Log Out',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        router.replace('/(employee)');
                    }
                }
            ]
        );
    };

    if (!user) {
        return null;
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: theme.background }]}
            showsVerticalScrollIndicator={false}
        >
            {/* Profile Header */}
            <ThemedView style={styles.header}>
                <View style={styles.profileImageContainer}>
                    <Image
                        source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png' }}
                        style={styles.profileImage}
                    />
                    <View style={styles.verifiedBadge}>
                        <IconSymbol name="checkmark" size={14} color="white" />
                    </View>
                </View>

                <ThemedText style={styles.userName}>{user.name}</ThemedText>
                <ThemedText style={styles.userInfo}>workerID : {user.workerId || '20231789'}</ThemedText>
                <ThemedText style={styles.userInfo}>Plan : {user.plan || 'Basic'}</ThemedText>
            </ThemedView>

            {/* Personal Information */}
            <ThemedView style={styles.section}>
                <View style={styles.sectionHeaderRow}>
                    <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
                    <TouchableOpacity onPress={handleEditToggle} disabled={isSaving}>
                        {isSaving ? (
                            <ActivityIndicator size="small" color={theme.tint} />
                        ) : (
                            <ThemedText style={{ color: theme.tint, fontWeight: '600' }}>
                                {isEditing ? 'Save' : 'Edit'}
                            </ThemedText>
                        )}
                    </TouchableOpacity>
                </View>

                {isEditing ? (
                    <>
                        <EditableField
                            label="Name"
                            value={editName}
                            onChangeText={setEditName}
                            icon="person.text.rectangle"
                        />
                        <EditableField
                            label="Phone"
                            value={editPhone}
                            onChangeText={setEditPhone}
                            icon="phone"
                            keyboardType="phone-pad"
                        />
                        <EditableField
                            label="Email"
                            value={editEmail}
                            onChangeText={setEditEmail}
                            icon="envelope"
                            keyboardType="email-address"
                        />
                        <EditableField
                            label="Availability Preferences"
                            value={editAvailability}
                            onChangeText={setEditAvailability}
                            icon="clock"
                        />

                        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                            <ThemedText style={styles.cancelText}>Cancel</ThemedText>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <InfoItem
                            icon="person.text.rectangle"
                            label="Employee ID"
                            value={user.workerId || 'KH08 - 2233'}
                        />
                        <InfoItem
                            icon="phone"
                            label="Contact Number"
                            value={user.phone || 'Not set'}
                        />
                        <InfoItem
                            icon="envelope"
                            label="Email Address"
                            value={user.email || 'Not set'}
                        />
                        {user.availabilityPreferences ? (
                            <InfoItem
                                icon="clock"
                                label="Availability"
                                value={user.availabilityPreferences}
                            />
                        ) : null}
                    </>
                )}
            </ThemedView>

            {/* Application Settings */}
            <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Application Settings</ThemedText>

                <View style={[styles.item, { backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F9F9F9' }]}>
                    <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#3C3C3C' : '#E8E8E8' }]}>
                        <IconSymbol name="moon.fill" size={20} color={theme.icon} />
                    </View>
                    <ThemedText style={styles.settingLabel}>Dark Mode</ThemedText>
                    <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ true: theme.tint }} />
                </View>

                <SettingItem
                    icon="bell"
                    label="Notification Settings"
                    onPress={() => router.push('/(employee)/profile/settings/notifications' as any)}
                />
                <SettingItem
                    icon="lock.shield"
                    label="Privacy Settings"
                    onPress={() => router.push('/(employee)/profile/settings/privacy' as any)}
                />
                <SettingItem
                    icon="lock"
                    label="Change Password"
                    onPress={() => router.push('/(employee)/profile/settings/change-password' as any)}
                />
                <SettingItem
                    icon="questionmark.circle"
                    label="Customer Support"
                    onPress={() => router.push('/(employee)/profile/support' as any)}
                />
            </ThemedView>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <ThemedText style={styles.logoutText}>Logout</ThemedText>
            </TouchableOpacity>
        </ScrollView>
    );
}

function EditableField({
    label,
    value,
    onChangeText,
    icon,
    keyboardType,
}: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    icon: string;
    keyboardType?: 'default' | 'phone-pad' | 'email-address';
}) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={[styles.editField, { backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F9F9F9' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#3C3C3C' : '#E8E8E8' }]}>
                <IconSymbol name={icon} size={20} color={theme.icon} />
            </View>
            <View style={styles.editFieldContent}>
                <ThemedText style={styles.editFieldLabel}>{label}</ThemedText>
                <TextInput
                    style={[styles.editInput, { color: theme.text }]}
                    value={value}
                    onChangeText={onChangeText}
                    keyboardType={keyboardType || 'default'}
                    placeholder={`Enter ${label.toLowerCase()}`}
                    placeholderTextColor="#888"
                />
            </View>
        </ThemedView>
    );
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <ThemedView style={[styles.item, { backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F9F9F9' }]}>
            <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#3C3C3C' : '#E8E8E8' }]}>
                <IconSymbol name={icon} size={20} color={theme.icon} />
            </View>
            <View style={styles.itemContent}>
                <ThemedText style={styles.itemLabel}>{label}</ThemedText>
                <ThemedText style={styles.itemValue}>{value}</ThemedText>
            </View>
        </ThemedView>
    );
}

function SettingItem({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: colorScheme === 'dark' ? '#2C2C2C' : '#F9F9F9' }]}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: colorScheme === 'dark' ? '#3C3C3C' : '#E8E8E8' }]}>
                <IconSymbol name={icon} size={20} color={theme.icon} />
            </View>
            <ThemedText style={styles.settingLabel}>{label}</ThemedText>
            <IconSymbol name="chevron.right" size={20} color="#888" style={styles.chevron} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        alignItems: 'center',
        paddingVertical: 30,
        paddingTop: 60,
    },
    profileImageContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    profileImage: {
        width: 80,
        height: 80,
        borderRadius: 40,
    },
    verifiedBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#3498db',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'white',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    userInfo: {
        fontSize: 14,
        color: '#888',
    },
    section: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 8,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    itemContent: {
        flex: 1,
    },
    itemLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    itemValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '500',
        flex: 1,
    },
    chevron: {
        marginLeft: 'auto',
    },
    editField: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    editFieldContent: {
        flex: 1,
    },
    editFieldLabel: {
        fontSize: 12,
        color: '#888',
        marginBottom: 4,
    },
    editInput: {
        fontSize: 14,
        fontWeight: '500',
        padding: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#3498db',
        paddingBottom: 4,
    },
    cancelButton: {
        alignItems: 'center',
        paddingVertical: 12,
        marginTop: 4,
    },
    cancelText: {
        color: '#888',
        fontSize: 14,
        fontWeight: '500',
    },
    logoutButton: {
        backgroundColor: '#FFE5E5',
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 100,
    },
    logoutText: {
        color: '#FF5A5F',
        fontWeight: '600',
        fontSize: 16,
    },
});
