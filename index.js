const { Client, LocalAuth, MessageMedia, Buttons } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const os = require("os");

// שמירת נתוני ההודעה עד לקבלת זמן השליחה המבוקש
let messageTemporary;
let scheduleTemporary;
let messageSchedule = "לשליחה מיידית יש ללחוץ על כפתור עכשיו" + "\nלשליחה עתידית יש לרשום בפורמט הזה בדיוק" + "\nהיום בשעה 14:20" + "\nמחר בשעה 14:20"
let formatError = "פורמט לא תקין, יש להתחיל את התהליך מחדש";
let signature = "*ירושלמים אונליין*🪀" + "\n\n";
let proccessActive = 0;
let robotSender = "קבוצת בדיקה 1"
// let robotSender = "שליחת הודעות רובוט"
// let arrayContacts = [4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 35, 36, 38, 39, 40, 41, 43, 44, 45, 47, 48];
let arrayContacts = [2, 3, 4];

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" }
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Client is ready!');

});

client.on('message_create', async (msg) => {

    console.log(msg);

    let chat = await msg.getChat();
    const contacts = await client.getContacts();

    if (msg.isStatus) {
        return
    }
    if (chat.name === robotSender) {

        try {

            if (msg.body === "בוצע") {
                return
            }
            if (msg.body !== messageSchedule && msg.body !== formatError && !msg.body.startsWith("מחר בשעה") && !msg.body.startsWith("היום בשעה") && msg.body !== "עכשיו" && msg.body !== "כן" && msg.body !== "לא" && msg.body !== "להוסיף חתימה?" && msg.body !== "מחק הודעה" && msg.body !== "רוצה למחוק את ההודעה?") {
                messageTemporary = msg;
                proccessActive = 1;
                let button = new Buttons(messageSchedule, [{ body: 'עכשיו' }], 'מתי לשלוח?', 'footer');
                // let button = new Buttons('Button body', [{ body: 'Aceptar' }, { body: 'rechazar' }], 'title', 'footer');
                const contact = contacts.find(({ name }) => name === robotSender);
                const { id: { _serialized: chatId } } = contact;
                client.sendMessage(chatId, button);
                return;
            }
            if (msg.body === messageSchedule || msg.body === formatError) {
                return;
            }
            if (msg.body === "להוסיף חתימה?") {
                return;
            }

            if (msg.body === "עכשיו") {
                scheduleTemporary = 500;

                let button = new Buttons('להוסיף חתימה?', [{ body: 'כן' }, { body: 'לא' }], '', '');
                const contact = contacts.find(({ name }) => name === robotSender);
                const { id: { _serialized: chatId } } = contact;
                client.sendMessage(chatId, button);


            } else if (msg.body.startsWith("מחר בשעה") || msg.body.startsWith("היום בשעה")) {
                let dateInserted = msg.body;
                if (dateInserted.startsWith("היום")) {
                    if (dateInserted.length < 15 || dateInserted.length > 15) {
                        client.sendMessage(msg.to, formatError);
                        return;
                    }
                }
                if (dateInserted.startsWith("מחר")) {
                    if (dateInserted.length < 14 || dateInserted.length > 14) {
                        client.sendMessage(msg.to, formatError);
                        return;
                    }
                }
                let dateNow = new Date();
                let day = dateNow.getDate();
                let month = dateNow.getMonth() + 1;
                let year = dateNow.getFullYear();
                let timeInserted = dateInserted.substring(dateInserted.indexOf("בשעה") + 5);
                if (dateInserted.startsWith("מחר")) {
                    day = day + 1;
                }
                scheduleTemporary = new Date(year + "-" + month + "-" + day + " " + timeInserted + ":00") - Date.now();
                console.log(year + "-" + month + "-" + day + " " + timeInserted + ":00");
                // scheduleTemporary = new Date("12-12-2022 15:42:00") - Date.now();

                let button = new Buttons('להוסיף חתימה?', [{ body: 'כן' }, { body: 'לא' }], '', '');
                const contact = contacts.find(({ name }) => name === robotSender);
                const { id: { _serialized: chatId } } = contact;
                client.sendMessage(chatId, button);


            }

            if (msg.body === "כן" && proccessActive === 1 || msg.body === "לא" && proccessActive === 1) {

                let signatureDynamic = "";
                if (msg.body === "כן") {
                    signatureDynamic = signature;
                }

                proccessActive = 0;
                chat.sendMessage('בוצע');
                // שמירת נתוני האירוע לשליחה עתידית
                let messageSaved = messageTemporary;
                let schedule = scheduleTemporary;

                let button = new Buttons('רוצה למחוק את ההודעה?', [{ body: 'מחק הודעה' }], '', messageSaved.id.id);
                const contact = contacts.find(({ name }) => name === robotSender);
                const { id: { _serialized: chatId } } = contact;
                chat.sendMessage(button);

                setTimeout(async () => {

                    if (!messageSaved.hasMedia) {
                        for (let i = 0; i < arrayContacts.length; i++) {
                            // const contact = contacts.find(({ name }) => name === "ירושלמים אונליין " + arrayContacts[i])
                            const contact = contacts.find(({ name }) => name === "קבוצת בדיקה " + arrayContacts[i])
                            const { id: { _serialized: chatId } } = contact;
                            client.sendMessage(chatId, signatureDynamic + messageSaved.body);
                        }
                    } else {
                        let mimeType;
                        if (messageSaved.type === "image") {
                            mimeType = 'image/png'
                        }
                        if (messageSaved.type === "video") {
                            mimeType = 'video/mp4'
                        }
                        if (messageSaved.type === "document") {
                            mimeType = 'document'
                        }
                        const media = await messageSaved.downloadMedia();
                        const media2 = new MessageMedia(mimeType, media.data, messageSaved.body);
                        for (let i = 0; i < arrayContacts.length; i++) {
                            // const contact = contacts.find(({ name }) => name === "ירושלמים אונליין " + arrayContacts[i])
                            const contact = contacts.find(({ name }) => name === "קבוצת בדיקה " + arrayContacts[i])
                            const { id: { _serialized: chatId } } = contact;
                            await client.sendMessage(chatId, media2, { caption: signatureDynamic + messageSaved.body});
                        }
                    }
                }, schedule);
            }

            if (msg.body === "מחק הודעה") {
                // if (msg.type === "buttons_response") {

                //     for (let c = 0; c < arrayContacts.length; c++) {
                //         // const contact = contacts.find(({ name }) => name === "ירושלמים אונליין " + arrayContacts[c]);
                //     const contact = contacts.find(({ name }) => name === "קבוצת בדיקה " + arrayContacts[c]);
                //     const { id: { _serialized: chatId } } = contact;
                //     client.getChatById(chatId).then(async (chat) => {
                //         let messages = await chat.fetchMessages({ limit: 30 });
                //         for (let i = 0; i < messages.length; i++) {
                //             if (messages[i].id.id === msg.rawData.quotedStanzaID) {
                //                 let targetMessage = messages[i].rawData.footer;
                //                 for (let e = 0; e < messages.length; e++) {
                //                     if (messages[e].id.id === targetMessage) {

                //                         try {
                //                             await messages[e].delete(); //delete message sent from me for everyone
                //                              console.log("success");

                //                         } catch (err) {
                //                              console.log("failed");
                //                         }
                //                         break;

                //                     }
                //                 }
                //             }
                //         }
                //     })
                // }
                // }
            }

        } catch (error) {
            console.log("my Error: " + error);
        }
    }
});

client.initialize();

