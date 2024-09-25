import fetch from "node-fetch";
import dotenv from 'dotenv'
dotenv.config();
export default (discordClient, Events, whatsappClient) => {
    const groupName = process.env.WHATSAPP_GROUP_NAME;
    const discordChannelId = process.env.DISCORD_CHANNEL_ID;

    discordClient.on(Events.MessageCreate, async (message) => {
        const discordChannel = await discordClient.channels.fetch(discordChannelId);
        if (discordChannel.id !== message.channel.id) return;
        if (message.author.id === discordClient.user.id) return;
        if (!whatsappClient.ready) return;

        const messageContent = message.content;
        const attachments = message.attachments;
        const authorName = message.author.globalName
        const chats = await whatsappClient.getChats();
        const chat = chats.find((c) => c.name === groupName);

        if (chat) {

            if (messageContent) {
                await chat.sendMessage(`${authorName}\n${messageContent}`);
            }

            if (attachments.size > 0) {
                attachments.forEach(async (attachment) => {
                    const mediaUrl = attachment.url;
                    let fileName = attachment.name;
                    const mediaType = attachment.contentType;

                    try {
                        const response = await fetch(mediaUrl);
                        const arrayBuffer = await response.arrayBuffer();
                        const mediaBuffer = Buffer.from(arrayBuffer);


                        const extension = mediaType.split("/")[1];
                        if (!fileName.includes(".")) {
                            fileName += `.${extension}`;
                        }

                        await chat.sendMessage(mediaBuffer, {
                            caption: fileName,
                            mimetype: mediaType,
                        });
                    } catch (error) {
                        console.error("Error sending file:", error);
                    }
                });
            }
        } else {
            console.error("WhatsApp chat not found.");
        }
    });

    whatsappClient.on("message", async (message) => {
        const chat = await message.getChat();
        if (chat.name === groupName) {
            const discordChannel = await discordClient.channels.fetch(
                discordChannelId
            );
            if (discordChannel) {
                const contact = await message.getContact();

                if (!message.hasMedia) {
                    await discordChannel.send(
                        `${contact.pushname || contact.number}:\n${message.body}`
                    );
                }

                if (message.hasMedia) {
                    const media = await message.downloadMedia();
                    const mediaType = media.mimetype;
                    let fileName = media.filename || "file";

                    const extension = mediaType.split("/")[1];
                    if (!fileName.includes(".")) {
                        fileName += `.${extension}`;
                    }

                    await discordChannel.send({
                        content: `${contact.pushname || contact.number}\n${message.body}`,
                        files: [
                            {
                                attachment: Buffer.from(media.data, "base64"),
                                name: fileName,
                                contentType: mediaType,
                            },
                        ],
                    });
                }
            } else {
                console.error("Discord channel not found.");
            }
        }
    });
};
