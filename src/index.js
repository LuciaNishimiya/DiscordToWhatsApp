import { Client as DiscordClient, GatewayIntentBits, Events, Collection } from 'discord.js';
import whatsapp from 'whatsapp-web.js';
const { LocalAuth, Client: WhatsAppClient } = whatsapp;
import dotenv from 'dotenv'
import fs from 'fs';
import path from 'path';
dotenv.config();
const discordClient = new DiscordClient({
    intents: [GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent]
});
const whatsappClient = new WhatsAppClient({
    authStrategy: new LocalAuth()
});

discordClient.commands = new Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
    import(`./commands/${file}`).then(command => {
        discordClient.commands.set(command.default.name, command.default);
        console.log(`Loaded command: ${command.default.name}`)
    });
}

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    import(`./events/${file}`).then(event => {
        event.default(discordClient, Events, whatsappClient);
        console.log(`Loaded event: ${path.basename(file, '.js')}`);
    }).catch(err => {
        console.error(`Error loading event ${file}:`, err);
    });
}

whatsappClient.initialize();
discordClient.login(process.env.TOKEN);