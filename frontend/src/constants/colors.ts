/**
 * Common colors used throughout the application.
 */

export const colors = {
    primary: '#0a7ea4',
    secondary: '#6c757d',
    success: '#28a745',
    danger: '#dc3545',
    warning: '#ffc107',
    info: '#17a2b8',
    light: '#f8f9fa',
    soft: '#e3f2fd',
    dark: '#343a40',
    white: '#ffffff',
    black: '#000000',
    muted: '#6c757d',
    border: '#dee2e6',

    // Semantic mappings from theme.ts
    tint: '#0a7ea4',
    tabIconDefault: '#687076',
    tabIconSelected: '#0a7ea4',

    text: {
        light: '#11181C',
        dark: '#ECEDEE',
    },
    background: {
        light: '#ffffff',
        dark: '#151718',
    },
} as const;

export default colors;
