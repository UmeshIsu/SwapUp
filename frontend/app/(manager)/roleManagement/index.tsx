import React, { useState } from "react";
// Use valid react-native imports
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "@/src/constants/colors";

// Assuming we want a native alike look
import * as RN from "react-native";

interface User {
  id: string;
  name: string;
  email: string;
  role: "Employee" | "Manager";
  avatar: string;
}

const mockUsers: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Employee", avatar: "AJ" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "Employee", avatar: "BS" },
  { id: "3", name: "Charlie Davis", email: "charlie@example.com", role: "Manager", avatar: "CD" },
  { id: "4", name: "Diana Prince", email: "diana@example.com", role: "Employee", avatar: "DP" },
  { id: "5", name: "Evan Wright", email: "evan@example.com", role: "Manager", avatar: "EW" },
];

export default function RoleManagementScreen() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [dropdownOpenFor, setDropdownOpenFor] = useState<string | null>(null);

  const toggleDropdown = (userId: string) => {
    setDropdownOpenFor((prev) => (prev === userId ? null : userId));
  };

  const handleRoleChange = (userId: string, newRole: "Employee" | "Manager") => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === userId ? { ...user, role: newRole } : user))
    );
    setDropdownOpenFor(null);
  };

  const renderItem = ({ item }: { item: User }) => {
    const isDropdownOpen = dropdownOpenFor === item.id;

    return (
      <RN.View style={styles.userCard}>
        <RN.View style={styles.userInfo}>
          <RN.View style={styles.avatar}>
            <RN.Text style={styles.avatarText}>{item.avatar}</RN.Text>
          </RN.View>
          <RN.View>
            <RN.Text style={styles.userName}>{item.name}</RN.Text>
            <RN.Text style={styles.userEmail}>{item.email}</RN.Text>
          </RN.View>
        </RN.View>

        <RN.View style={{ zIndex: isDropdownOpen ? 10 : 1 }}>
          <RN.TouchableOpacity
            style={[styles.roleSelector, isDropdownOpen && styles.roleSelectorActive]}
            onPress={() => toggleDropdown(item.id)}
            activeOpacity={0.7}
          >
            <RN.Text style={styles.roleText}>{item.role}</RN.Text>
            <Ionicons
              name={isDropdownOpen ? "chevron-up" : "chevron-down"}
              size={16}
              color={colors.text}
            />
          </RN.TouchableOpacity>

          {isDropdownOpen && (
            <RN.View style={styles.dropdownMenu}>
              <RN.TouchableOpacity
                style={[styles.dropdownItem, item.role === "Employee" && styles.dropdownItemActive]}
                onPress={() => handleRoleChange(item.id, "Employee")}
              >
                <RN.Text
                  style={[
                    styles.dropdownItemText,
                    item.role === "Employee" && styles.dropdownItemTextActive,
                  ]}
                >
                  Employee
                </RN.Text>
                {item.role === "Employee" && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
              </RN.TouchableOpacity>
              <RN.View style={styles.dropdownDivider} />
              <RN.TouchableOpacity
                style={[styles.dropdownItem, item.role === "Manager" && styles.dropdownItemActive]}
                onPress={() => handleRoleChange(item.id, "Manager")}
              >
                <RN.Text
                  style={[
                    styles.dropdownItemText,
                    item.role === "Manager" && styles.dropdownItemTextActive,
                  ]}
                >
                  Manager
                </RN.Text>
                {item.role === "Manager" && (
                  <Ionicons name="checkmark" size={16} color={colors.primary} />
                )}
              </RN.TouchableOpacity>
            </RN.View>
          )}
        </RN.View>
      </RN.View>
    );
  };

  return (
    <RN.SafeAreaView style={styles.container}>
      <RN.View style={styles.header}>
        <RN.Text style={styles.headerTitle}>Role Management</RN.Text>
        <RN.Text style={styles.headerSubtitle}>Manage access levels for your team</RN.Text>
      </RN.View>

      <RN.FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </RN.SafeAreaView>
  );
}

const styles = RN.StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.muted,
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.soft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: colors.muted,
  },
  roleSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bg,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleSelectorActive: {
    borderColor: colors.primary,
    backgroundColor: colors.soft,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    marginRight: 6,
  },
  dropdownMenu: {
    position: "absolute",
    top: 42,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 140,
    zIndex: 100,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  dropdownItemActive: {
    backgroundColor: colors.soft,
  },
  dropdownItemText: {
    fontSize: 14,
    color: colors.text,
  },
  dropdownItemTextActive: {
    fontWeight: "600",
    color: colors.primary,
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
});
