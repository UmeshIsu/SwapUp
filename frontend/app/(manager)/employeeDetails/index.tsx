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

    const fetchEmployees = async () => {
        try {
            // Fetch employees for the manager's department
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
            <TouchableOpacity style={styles.employeeCard}>
                <Image 
                    source={{ uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random` }} 
                    style={styles.avatar}
                />
                <View style={styles.employeeInfo}>
                    <Text style={styles.employeeName}>{item.name}</Text>
                    {/* Displaying 'Waiter' as per design, but could be dynamic if backend supported specialized titles */}
                    <Text style={styles.employeeRole}>{item.department || 'Employee'}</Text> 
                </View>
                <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
        </Link>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>Employee</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#6B7280" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search employees.."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

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
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No employees match your search.' : 'No employees found in your department.'}
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
        backgroundColor: '#FFFFFF',
    },
    headerContainer: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6',
        marginHorizontal: 16,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        marginBottom: 16,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: '#111827',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },
    employeeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        marginRight: 16,
        backgroundColor: '#E5E7EB',
    },
    employeeInfo: {
        flex: 1,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    employeeRole: {
        fontSize: 13,
        color: '#6B7280',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        paddingVertical: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 15,
        color: '#6B7280',
    },
});
