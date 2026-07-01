import { palette } from '@/src/constants/palette';
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    ActivityIndicator,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import ScreenHeader from '@/src/components/ScreenHeader';
import { authAPI } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';
import { getInitials, getAvatarColor } from '@/src/utils/avatar';

interface Employee {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    department?: string;
}

export default function ManagerEmployeesScreen() {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];
    const isDark = colorScheme === 'dark';
    const styles = makeStyles(theme, isDark);

    const fetchEmployees = async () => {
        try {
            const response = await authAPI.getAllEmployees();
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchEmployees();
    }, []);

    const filteredEmployees = employees.filter((emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderEmployee = ({ item }: { item: Employee }) => (
        <Link href={{ pathname: '/(manager)/employeeDetails/[id]', params: { id: item.id } }} asChild>
            <TouchableOpacity style={styles.employeeCard} activeOpacity={0.7}>
                <View style={[styles.avatar, { backgroundColor: getAvatarColor(item.name) }]}>
                    <Text style={styles.avatarInitials}>{getInitials(item.name)}</Text>
                </View>
                <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.employeeRole} numberOfLines={1}>
                        {item.department || 'Employee'}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
            </TouchableOpacity>
        </Link>
    );

    return (
        <View style={styles.safeArea}>
            <ScreenHeader title="Employee" showBack={false} />

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color={theme.textMuted} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search employees.."
                        placeholderTextColor={theme.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={theme.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Employee List */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={palette.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredEmployees}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEmployee}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[palette.primary]} />
                    }
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color={theme.textMuted} />
                            <Text style={styles.emptyTitle}>
                                {searchQuery ? 'No results found' : 'No employees'}
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                {searchQuery
                                    ? 'Try a different search term.'
                                    : 'No employees found in your department.'}
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const makeStyles = (theme: any, isDark: boolean) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.background,
    },
    headerContainer: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme.text,
    },
    searchWrapper: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: isDark ? '#2C2C2C' : '#E5E5EA',
        borderRadius: 10,
        paddingHorizontal: 10,
        height: 36,
    },
    searchIcon: {
        marginRight: 6,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: theme.text,
        paddingVertical: 0,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    employeeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.surface,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: theme.surface,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: isDark ? 0.3 : 0.1,
        shadowRadius: 2,
        elevation: 1,
    },
    avatarInitials: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '700',
    },
    employeeInfo: {
        flex: 1,
        marginLeft: 12,
    },
    employeeName: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 2,
    },
    employeeRole: {
        fontSize: 13,
        color: theme.textMuted,
        fontWeight: '400',
    },
    separator: {
        height: 1,
        backgroundColor: theme.border,
        marginLeft: 68,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 60,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 17,
        fontWeight: '600',
        color: theme.text,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.textMuted,
        marginTop: 4,
    },
});
