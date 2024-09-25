export default (discordClient, Events, whatsappClient) => {
    discordClient.on(Events.ClientReady, async () => {
        console.log('Discord bot ready');
    });
    whatsappClient.on('ready', () => {
        console.log('Whatsapp bot ready');
        whatsappClient.ready = true
    });
};