import { useState, useCallback } from 'react';

// For simplicity in the mock, we can use a module-level variable to act as a singleton store
// or just return local state. Since it's a mock, local state or simple subscribe model works.
let premiumState = false;

export const usePremium = () => {
    // Hardcoded to true to remove premium restrictions
    const isPremium = true;
    const setPremium = (value: boolean) => {
        // No-op since premium is now permanent
    };

    return { isPremium, setPremium };
};
