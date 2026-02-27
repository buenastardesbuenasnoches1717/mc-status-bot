require("dotenv").config();

const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const util = require("minecraft-server-util");

// 🔐 TOKEN DESDE VARIABLE DE ENTORNO
const TOKEN = process.env.TOKEN;

const CHANNEL_ID = "1474542030456623349";

// ===============================
// 🔹 CONFIGURACIÓN SERVIDOR 1
// ===============================
const SERVER1_NAME = "🌍 Survival MC";
const SERVER1_IP = "maruchann7.aternos.me";
const SERVER1_PORT = 25565;
const SERVER1_VERSION = "1.21.11";
const SERVER1_IMAGE = "https://cdn.discordapp.com/attachments/1474542030456623349/1476478280466042890/descargar_33.jpg";

// ===============================
// 🔹 CONFIGURACIÓN SERVIDOR 2
// ===============================
const SERVER2_NAME = "⚔️ MC Server De Terror";
const SERVER2_IP = "elterrordecolocolo.aternos.me";
const SERVER2_PORT = 25565;
const SERVER2_VERSION = "1.20.1 ForgeOptifine";
const SERVER2_IMAGE = "https://cdn.discordapp.com/attachments/1474542030456623349/1476478280466042890/descargar_33.jpg";

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

let messageId1 = null;
let messageId2 = null;

async function checkServer(ip, port) {
    try {
        const response = await util.status(ip, {
            port: port,
            timeout: 3000,
            enableSRV: false
        });

        if (!response.players || response.players.max === 0) {
            return { online: false };
        }

        return {
            online: true,
            players: response.players.online,
            max: response.players.max
        };

    } catch (error) {
        return { online: false };
    }
}

function createEmbed(name, ip, version, image, status) {

    const embed = new EmbedBuilder()
        .setColor(status.online ? 0x00ff00 : 0xff0000)
        .setTitle(name)
        .addFields(
            { name: "📡 IP", value: `\`${ip}\``, inline: false },
            { name: "🛠 Versión", value: version, inline: false },
            {
                name: "📊 Estado",
                value: status.online
                    ? `🟢 Online\n👥 ${status.players} / ${status.max}`
                    : "🔴 Offline",
                inline: false
            }
        )
        .setTimestamp();

    if (image && image.startsWith("http")) {
        embed.setImage(image);
    }

    return embed;
}

client.once("ready", async () => {

    console.log(`Bot conectado como ${client.user.tag}`);

    const channel = await client.channels.fetch(CHANNEL_ID);

    const messages = await channel.messages.fetch({ limit: 50 });

    let msg1 = messages.find(
        m => m.author.id === client.user.id &&
        m.embeds[0]?.title === SERVER1_NAME
    );

    let msg2 = messages.find(
        m => m.author.id === client.user.id &&
        m.embeds[0]?.title === SERVER2_NAME
    );

    if (!msg1) {
        msg1 = await channel.send("Cargando servidor 1...");
    }

    if (!msg2) {
        msg2 = await channel.send("Cargando servidor 2...");
    }

    messageId1 = msg1.id;
    messageId2 = msg2.id;

    setInterval(async () => {

        console.log("Actualizando estado...");

        const status1 = await checkServer(SERVER1_IP, SERVER1_PORT);
        const status2 = await checkServer(SERVER2_IP, SERVER2_PORT);

        const embed1 = createEmbed(
            SERVER1_NAME,
            SERVER1_IP,
            SERVER1_VERSION,
            SERVER1_IMAGE,
            status1
        );

        const embed2 = createEmbed(
            SERVER2_NAME,
            SERVER2_IP,
            SERVER2_VERSION,
            SERVER2_IMAGE,
            status2
        );

        try {
            const message1 = await channel.messages.fetch(messageId1);
            const message2 = await channel.messages.fetch(messageId2);

            await message1.edit({ content: "", embeds: [embed1] });
            await message2.edit({ content: "", embeds: [embed2] });

        } catch (err) {
            console.log("Error editando mensaje, recreando...");

            const newMsg1 = await channel.send({ embeds: [embed1] });
            const newMsg2 = await channel.send({ embeds: [embed2] });

            messageId1 = newMsg1.id;
            messageId2 = newMsg2.id;
        }

    }, 30000);

});

client.login(TOKEN);


