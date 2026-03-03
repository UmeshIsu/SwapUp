import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../constants/colors";

interface HeaderSimpleProps {
    title: string;
}

export default function HeaderSimple({ title }: HeaderSimpleProps) {
    const router = useRouter();

    return (
        <View style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: "transparent",
        }}>
            <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
                <Ionicons name="chevron-back" size={24} color={colors.text.light} />
            </TouchableOpacity>
            <Text style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text.light,
                marginLeft: 8,
            }}>
                {title}
            </Text>
        </View>
    );
}
