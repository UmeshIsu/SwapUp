import { useState, useCallback } from 'react';

// For simplicity in the mock, we can use a module-level variable to act as a singleton store
// or just return local state. Since it's a mock, local state or simple subscribe model works.
let premiumState = false;

export const usePremium = () => {
    const [isPremium, setIsPremiumState] = useState(premiumState);

    const setPremium = useCallback((value: boolean) => {
        premiumState = value;
        setIsPremiumState(value);
    }, []);

    return { isPremium, setPremium };
};
