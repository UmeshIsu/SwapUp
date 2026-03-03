import React from 'react';
import { StyleSheet, View, ViewStyle, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';

interface ScreenProps {
    children: React.ReactNode;
    style?: ViewStyle;
    scroll?: boolean;
}

export const Screen: React.FC<ScreenProps> = ({ children, style, scroll = true }) => {
    const insets = useSafeAreaInsets();
    const Container = scroll ? ScrollView : View;

    return (
        <Container
            style={[styles.container, style]}
            contentContainerStyle={scroll ? styles.contentContainer : undefined}
        >
            <View style={{ height: 0 }} />
            {children}
            <View style={{ height: insets.bottom + 20 }} />
        </Container>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA', // Light background for better contrast
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
});

export default Screen;
