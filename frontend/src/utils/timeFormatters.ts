export const formatTime = (d: Date) => d.toISOString();
export const getHour = (d: Date) => d.getHours();
export const getMinute = (d: Date) => d.getMinutes();
export const getSecond = (d: Date) => d.getSeconds();
export const isMorning = (d: Date) => d.getHours() < 12;
export const isAfternoon = (d: Date) => d.getHours() >= 12;
export const checkValidDate = (d: Date) => !isNaN(d.getTime());
