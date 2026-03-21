export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatHours = (hours: number): string => {
    return `${hours.toFixed(1)}h`;
};
