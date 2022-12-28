const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const os = require("os");

let messageSaved;

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"}
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    // Fired if session restore was unsuccessful
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message_create', async (msg) => {

    let chat = await msg.getChat();
  
        const contacts = await client.getContacts()
        // arrayContacts = [4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 38, 39, 40, 41, 43, 44, 45, 47, 48];
        let arrayContacts = [2, 3, 4];
        setTimeout(async () => {

            if (!msg.hasMedia) {

                for (let i = 0; i < arrayContacts.length; i++) {
                    // const contact = contacts.find(({ name }) => name === "ירושלמים אונליין " + arrayContacts[i])
                    const contact = contacts.find(({ name }) => name === "קבוצת בדיקה " + arrayContacts[i])
                    const { id: { _serialized: chatId } } = contact;
                    client.sendMessage(chatId, "*ירושלמים אונליין*🪀" + "\n\n" + msg.body);
                }
            } else if (msg.type === "image") {
                const media = await msg.downloadMedia();
                const media2 = new MessageMedia('image/png', media.data);

                for (let i = 0; i < arrayContacts.length; i++) {
                    const contact = contacts.find(({ name }) => name === "קבוצת בדיקה " + arrayContacts[i])
                    const { id: { _serialized: chatId } } = contact;
                    client.sendMessage(chatId, media2, { caption: "*ירושלמים אונליין*🪀" + "\n\n" + msg.body });
                }
            } else if (msg.type === "video") {
                const media = await msg.downloadMedia();
                const media2 = new MessageMedia('video/mp4', media.data);

                for (let i = 0; i < arrayContacts.length; i++) {
                    const contact = contacts.find(({ name }) => name === "קבוצת בדיקה " + arrayContacts[i])
                    const { id: { _serialized: chatId } } = contact;
                    client.sendMessage(chatId, media2, { caption: "*ירושלמים אונליין*🪀" + "\n\n" + msg.body });
                }
            }
                }, 500);
});

client.initialize();

