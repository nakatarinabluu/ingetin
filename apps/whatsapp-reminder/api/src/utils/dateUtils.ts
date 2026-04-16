import { 
    addDays, 
    addWeeks, 
    addMonths, 
    addYears, 
    isWeekend, 
    getDay, 
    setDay, 
    isAfter,
    isEqual
} from 'date-fns';

export class DateUtils {
    static calculateNextOccurrence(start: Date, interval: string, daysOfWeek: number[] = []): Date {
        let next = new Date(start.getTime());
        
        switch (interval) {
            case 'DAILY':
                return addDays(next, 1);
            
            case 'WEEKDAY':
                do {
                    next = addDays(next, 1);
                } while (isWeekend(next));
                return next;
            
            case 'WEEKEND':
                do {
                    next = addDays(next, 1);
                } while (!isWeekend(next));
                return next;
            
            case 'CUSTOM':
                if (daysOfWeek.length > 0) {
                    const sortedDays = [...daysOfWeek].sort((a, b) => a - b);
                    const currentDay = getDay(next);
                    
                    // Find the next day in the list that is later than today
                    const nextScheduledDay = sortedDays.find(day => day > currentDay);
                    
                    if (nextScheduledDay !== undefined) {
                        return setDay(next, nextScheduledDay);
                    } else {
                        // All scheduled days are earlier or equal to today, move to the first day next week
                        return addWeeks(setDay(next, sortedDays[0]), 1);
                    }
                }
                return addDays(next, 1);
            
            case 'WEEKLY':
                return addWeeks(next, 1);
            
            case 'MONTHLY':
                return addMonths(next, 1);
            
            case 'YEARLY':
                return addYears(next, 1);
            
            default:
                return addDays(next, 1);
        }
    }

    /**
     * Jumps a date into the future by repeatedly applying the recurrence interval
     * until the date is >= reference date (defaulting to now).
     */
    static jumpToFuture(start: Date, interval: string, daysOfWeek: number[] = [], reference: Date = new Date()): Date {
        let current = new Date(start.getTime());
        if (interval === 'NONE' || isAfter(current, reference) || isEqual(current, reference)) return current;

        // Safety break to prevent infinite loops (max 1000 jumps)
        let safety = 0;
        while ((!isAfter(current, reference) && !isEqual(current, reference)) && safety < 1000) {
            current = this.calculateNextOccurrence(current, interval, daysOfWeek);
            safety++;
        }
        return current;
    }
}

