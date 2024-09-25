import qrcode from 'qrcode';

export default {
    name: 'auth',
    description: 'Log in to WhatsApp using a QR code.',
    execute(discordClient, whatsappClient, message, args) {
        whatsappClient.on('qr', async (qr) => {
            try {
                const qrCodeImage = await qrcode.toBuffer(qr);
                await message.channel.send({
                    files: [{
                        attachment: qrCodeImage,
                        name: 'qr.png'
                    }],
                    content: 'Scan this QR code to authenticate your WhatsApp account.'
                });
            } catch (error) {
                console.error('Error generating the QR code:', error);
                message.channel.send('There was an error generating the QR code. Please try again.');
            }
        });
        whatsappClient.on('authenticated', () => {
            console.log('WhatsApp is authenticated.');
            message.channel.send('You are now logged in to WhatsApp.');
        });

        whatsappClient.on('auth_failure', () => {
            console.log('Authentication failed, please scan the QR code again.');
            message.channel.send('Authentication failed. Please try to log in again.');
        });
    }
};
