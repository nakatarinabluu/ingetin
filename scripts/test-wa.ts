import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

// Load env from root
dotenv.config({ path: path.join(__dirname, '../.env') });

const {
    WA_NOTIF_PHONE_NUMBER_ID,
    WA_NOTIF_ACCESS_TOKEN,
    MY_PERSONAL_PHONE
} = process.env;

async function sendTestMessage() {
    console.log('🚀 Memulai Tes Pengiriman WhatsApp...');
    console.log(`📱 Tujuan: ${MY_PERSONAL_PHONE}`);
    console.log(`🆔 Phone ID: ${WA_NOTIF_PHONE_NUMBER_ID}`);

    const url = `https://graph.facebook.com/v21.0/${WA_NOTIF_PHONE_NUMBER_ID}/messages`;
    
    const data = {
        messaging_product: 'whatsapp',
        to: MY_PERSONAL_PHONE,
        type: 'template',
        template: {
            name: 'hello_world',
            language: {
                code: 'en_US'
            }
        }
    };

    try {
        const response = await axios.post(url, data, {
            headers: {
                Authorization: `Bearer ${WA_NOTIF_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ BERHASIL! Pesan terkirim.');
        console.log('📄 Response:', JSON.stringify(response.data, null, 2));
    } catch (err: unknown) {
        console.error('❌ GAGAL mengirim pesan.');
        if (axios.isAxiosError(err) && err.response) {
            console.error('Keterangan Error:', JSON.stringify(err.response.data, null, 2));
        } else if (err instanceof Error) {
            console.error('Error:', err.message);
        } else {
            console.error('Unknown error occurred');
        }
    }
}

sendTestMessage();
