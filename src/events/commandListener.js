import dotenv from 'dotenv'
dotenv.config();
export default (discordClient, Events, whatsappClient) => {
    discordClient.on(Events.MessageCreate, async (message) => {
        if (!message.content.startsWith(process.env.PREFIX) || message.author.bot) return;
        if (!message.member.permissions.has('ADMINISTRATOR')) return

        const args = message.content.slice(1).trim().split(/ +/);
        const commandName = args[0].toLowerCase();

        const command = discordClient.commands.get(commandName);
        if (!command) return;

        try {
            command.execute(discordClient, whatsappClient, message, args);
        } catch (error) {
            console.error(error);
        }
    });
};
