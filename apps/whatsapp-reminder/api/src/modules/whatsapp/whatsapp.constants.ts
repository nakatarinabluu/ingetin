export const WHATSAPP_ALERTS = {
    SYNC_FAILURE: {
        template: 'sync_failure_alert',
        defaultComponents: ['Google Calendar']
    },
    MISSED_REMINDERS: {
        template: 'missed_reminders_alert',
        getMessage: (count: number) => `You have missed ${count} scheduled reminders due to a temporary system interruption. We have recovered and are back online.`
    }
};
