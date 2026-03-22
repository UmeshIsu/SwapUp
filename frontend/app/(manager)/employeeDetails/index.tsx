import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    ActivityIndicator,
    Image,
    RefreshControl,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { authAPI } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';
import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { Colors } from '@/src/constants/theme';

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

    const fetchEmployees = async () => {
        try {
            const response = await authAPI.getAllEmployees({ department: user?.department || undefined });
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user?.department) {
            fetchEmployees();
        } else {
            setLoading(false);
        }
    }, [user?.department]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchEmployees();
    }, [user?.department]);

    const filteredEmployees = employees.filter((emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderEmployee = ({ item }: { item: Employee }) => (
        <Link href={{ pathname: '/(manager)/employeeDetails/[id]', params: { id: item.id } }} asChild>
            <TouchableOpacity style={styles.employeeCard} activeOpacity={0.7}>
                <Image
                    source={{ uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=4A90D9&color=fff&bold=true&size=128` }}
                    style={styles.avatar}
                />
                <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.employeeRole} numberOfLines={1}>
                        {item.department || 'Employee'}
                    </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#C5C5C7" />
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Employee</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchWrapper}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={18} color="#8E8E93" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search employees.."
                        placeholderTextColor="#8E8E93"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color="#8E8E93" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Employee List */}
            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#1373D0" />
                </View>
            ) : (
                <FlatList
                    data={filteredEmployees}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEmployee}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1373D0']} />
                    }
                    ItemSeparatorComponent={() => <View style={styles.separator} />}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color="#C5C5C7" />
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
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    headerContainer: {
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 12,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#000',
    },
    searchWrapper: {
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E5E5EA',
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
        color: '#000',
        paddingVertical: 0,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    employeeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 12,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#D1D5DB',
        borderWidth: 2,
        borderColor: '#4A90D9',
    },
    employeeInfo: {
        flex: 1,
        marginLeft: 12,
    },
    employeeName: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1C1C1E',
        marginBottom: 2,
    },
    employeeRole: {
        fontSize: 13,
        color: '#8E8E93',
        fontWeight: '400',
    },
    separator: {
        height: 1,
        backgroundColor: '#E5E5EA',
        marginLeft: 68, // avatar width + padding
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
        color: '#1C1C1E',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#8E8E93',
        marginTop: 4,
    },
});
