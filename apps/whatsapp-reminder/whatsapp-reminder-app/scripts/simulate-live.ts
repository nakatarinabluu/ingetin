import { container } from '../src/core/container';
import { LiveEvent } from '../src/modules/whatsapp/live.service';

async function main() {
    console.log('🚀 LIVE HANDSHAKE SIMULATOR: Starting Stream...');
    
    const liveService = container.liveService;
    
    const activities = [
        { msg: 'System Heartbeat: Node Cluster Alpha Healthy', status: 'SUCCESS', cat: 'SYSTEM' },
        { msg: 'Incoming Handshake from +62857xxxxxxx', status: 'INFO', cat: 'RECEIVED' },
        { msg: 'Auth Protocol: OTP verified for user_001', status: 'SUCCESS', cat: 'SYSTEM' },
        { msg: 'Reminder Dispatch: "Scale Test Reminder 3" sent to node map', status: 'SUCCESS', cat: 'SENT' },
        { msg: 'Provider Latency: Google Calendar Sync (45ms)', status: 'INFO', cat: 'SYSTEM' },
        { msg: 'Encryption Layer: AES-256-GCM Rotation Success', status: 'SUCCESS', cat: 'SYSTEM' },
        { msg: 'Traffic Alert: High volume detected from unregistered node', status: 'ERROR', cat: 'RECEIVED' }
    ];

    let i = 0;
    const interval = setInterval(() => {
        const activity = activities[i % activities.length];
        
        console.log(`📡 Broadcasting: [${activity.cat}] ${activity.msg}`);
        
        liveService.sendPulse(
            activity.msg, 
            activity.status as any, 
            activity.cat as any
        );

        // Also trigger a stats update occasionally
        if (i % 3 === 0) {
            liveService.broadcast(LiveEvent.STATS_UPDATE, {});
        }

        i++;
        if (i > 100) {
            clearInterval(interval);
            console.log('✅ Simulation Complete.');
            process.exit(0);
        }
    }, 3000);
}

main().catch(console.error);
