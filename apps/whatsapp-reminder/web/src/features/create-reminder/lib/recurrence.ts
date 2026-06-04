import { RepeatInterval } from '@ingetin/types';

export const recurrenceToInterval = (rec: string): RepeatInterval => {
    switch (rec) {
        case 'DAILY': return RepeatInterval.DAILY;
        case 'WEEKLY': return RepeatInterval.WEEKLY;
        case 'MONTHLY': return RepeatInterval.MONTHLY;
        case 'YEARLY': return RepeatInterval.YEARLY;
        case 'ONCE':
        default:
            return RepeatInterval.NONE;
    }
};

export const intervalToRecurrence = (interval: RepeatInterval): 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' => {
    switch (interval) {
        case RepeatInterval.DAILY: return 'DAILY';
        case RepeatInterval.WEEKLY: return 'WEEKLY';
        case RepeatInterval.MONTHLY: return 'MONTHLY';
        case RepeatInterval.YEARLY: return 'YEARLY';
        case RepeatInterval.NONE:
        default:
            return 'ONCE';
    }
};