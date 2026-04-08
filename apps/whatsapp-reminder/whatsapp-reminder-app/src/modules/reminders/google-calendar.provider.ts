import { google, calendar_v3 } from 'googleapis';
import CircuitBreaker from 'opossum';
import { logger } from '@ingetin/logger';
import { env } from '../../core/config';

export class GoogleCalendarProvider {
    private breaker: CircuitBreaker;

    constructor() {
        this.breaker = new CircuitBreaker(this.executeGoogleCall.bind(this), {
            timeout: 30000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000
        });
    }

    private async executeGoogleCall(call: () => Promise<any>) {
        return await call();
    }

    getClient(tokens?: { access_token?: string, refresh_token?: string, expiry_date?: number }) {
        const auth = new google.auth.OAuth2(
            env.GOOGLE_CLIENT_ID,
            env.GOOGLE_CLIENT_SECRET,
            env.GOOGLE_REDIRECT_URI
        );

        if (tokens) {
            auth.setCredentials(tokens);
        }

        return auth;
    }

    async listEvents(auth: any, start: Date, end: Date): Promise<calendar_v3.Schema$Events> {
        const calendar = google.calendar({ version: 'v3', auth });
        const response = await this.breaker.fire(() => calendar.events.list({
            calendarId: 'primary',
            timeMin: start.toISOString(),
            timeMax: end.toISOString(),
            singleEvents: false,
            showDeleted: true,
            maxResults: 250
        })) as { data: calendar_v3.Schema$Events };

        return response.data;
    }

    getStatus() {
        return {
            name: 'GOOGLE_CALENDAR_PROVIDER',
            state: this.breaker.opened ? 'OPEN' : 'CLOSED',
            stats: this.breaker.stats
        };
    }
}
