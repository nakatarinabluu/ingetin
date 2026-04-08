import { MessageDirection } from '@prisma/client';

export interface ConversationSnapshot {
    lastMessageDirection: MessageDirection;
    lastMessageTimestamp: Date;
}

export class MessagingPolicy {
    private static readonly WINDOW_24H_MS = 24 * 60 * 60 * 1000;

    /**
     * Determines if a free-text message can be sent to a user 
     * based on the WhatsApp 24-hour customer service window.
     */
    static canSendFreeText(conversation: ConversationSnapshot | null): boolean {
        if (!conversation) return false;

        // Meta's rule: You can only send free-text if the user sent a message in the last 24h
        if (conversation.lastMessageDirection !== MessageDirection.INBOUND) {
            return false;
        }

        const now = new Date();
        const diff = now.getTime() - conversation.lastMessageTimestamp.getTime();
        
        return diff < this.WINDOW_24H_MS;
    }

    /**
     * Returns the required template name and default parameters 
     * when a free-text message is not allowed.
     */
    static getFallbackTemplate(message: string) {
        return {
            name: 'reminder_alert',
            components: ['Reminder', message]
        };
    }
}
