require('dotenv').config();
const { Client, GatewayIntentBits, PermissionsBitField, ChannelType } = require('discord.js');

// ─────────────────────────────────────────────
//  CONFIG
// ─────────────────────────────────────────────
const CHANNEL_ID   = '1484915685875515396';   // ID du salon smash-or-pass
const SLOW_MODE_S  = 30;                       // Mode lent : 30 secondes entre chaque post

const THREAD_WARNING = `# ⚠️ Respect avant tout
> Tout propos méprisant, dévalorisant, insultant ou méchant envers cette personne est **strictement interdit** et entraînera une sanction immédiate.
> 
> ✅ **Smash** — tu valides
> ❌ **Pass** — tu passes
> 
> Garde ton avis constructif et bienveillant. On est là pour s'amuser, pas pour blesser. 🙏`;

// Types MIME autorisés
const ALLOWED_TYPES = ['image/', 'video/'];

// ─────────────────────────────────────────────
//  CLIENT
// ─────────────────────────────────────────────
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

/**
 * Vérifie qu'un message contient uniquement des médias (photo/vidéo).
 */
function hasOnlyMedia(message) {
    // Doit avoir au moins une pièce jointe
    if (message.attachments.size === 0) return false;

    // Tous les attachments doivent être image ou vidéo
    for (const [, att] of message.attachments) {
        const type = att.contentType ?? '';
        if (!ALLOWED_TYPES.some(t => type.startsWith(t))) return false;
    }

    // Pas de texte dans le message (hors URL Discord générée automatiquement)
    const textContent = message.content.trim();
    if (textContent.length > 0) return false;

    return true;
}

/**
 * Tente de supprimer un message silencieusement.
 */
async function tryDelete(message) {
    try { await message.delete(); } catch (_) { /* déjà supprimé ou pas les perms */ }
}

/**
 * Tente d'envoyer un DM à l'auteur.
 */
async function tryDM(user, text) {
    try { await user.send(text); } catch (_) { /* DM fermés */ }
}

// ─────────────────────────────────────────────
//  EVENTS
// ─────────────────────────────────────────────

// ─────────────────────────────────────────────
//  KEEPALIVE HTTP (Railway exige un port ouvert)
// ─────────────────────────────────────────────
const http = require('http');
const PORT = process.env.PORT || 3000;
http.createServer((_, res) => {
    res.writeHead(200);
    res.end('Bot en ligne ✅');
}).listen(PORT, () => {
    console.log(`🌐 Serveur keepalive sur le port ${PORT}`);
});

client.once('clientReady', async () => {
    console.log(`✅ Bot connecté en tant que ${client.user.tag}`);

    // Configure le mode lent sur le salon au démarrage
    const channel = await client.channels.fetch(CHANNEL_ID).catch(() => null);
    if (channel && channel.type === ChannelType.GuildText) {
        await channel.setRateLimitPerUser(SLOW_MODE_S, 'Mode lent automatique — Smash or Pass').catch(console.error);
        console.log(`⏱️  Mode lent configuré : ${SLOW_MODE_S}s sur #${channel.name}`);
    }
});

client.on('messageCreate', async (message) => {
    // Ignorer les bots
    if (message.author.bot) return;

    // Ignorer tout ce qui ne vient pas du bon salon
    if (message.channelId !== CHANNEL_ID) return;

    // Laisser les messages dans les fils (threads) — c'est là qu'on vote
    if (message.channel.isThread()) return;

    // ── Vérification : uniquement photo/vidéo, aucun texte ──
    if (!hasOnlyMedia(message)) {
        await tryDelete(message);
        await tryDM(
            message.author,
            `❌ **Salon Smash or Pass** — Seules les **photos** et **vidéos** sont autorisées dans ce salon (sans texte). Ton message a été supprimé.`
        );
        return;
    }

    // ── Réactions smash / pass ──
    try {
        await message.react('✅');
        await message.react('❌');
    } catch (err) {
        console.error('Erreur lors des réactions :', err.message);
    }

    // ── Création du fil ──
    try {
        const threadName = `📸 ${message.author.username}`.slice(0, 100);

        const thread = await message.startThread({
            name: threadName,
            autoArchiveDuration: 1440, // Archive après 24h d'inactivité
            reason: 'Fil Smash or Pass automatique',
        });

        await thread.send(THREAD_WARNING);
        console.log(`🧵 Fil créé : "${threadName}" pour ${message.author.tag}`);
    } catch (err) {
        console.error('Erreur lors de la création du fil :', err.message);
    }
});

// ─────────────────────────────────────────────
//  GESTION DES ERREURS GLOBALES
// ─────────────────────────────────────────────
process.on('unhandledRejection', (err) => {
    console.error('Erreur non gérée :', err);
});

// ─────────────────────────────────────────────
//  CONNEXION
// ─────────────────────────────────────────────
client.login(process.env.DISCORD_TOKEN);
