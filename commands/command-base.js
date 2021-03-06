const { prefix: globalPrefix } = require('@root/config.json');
const serverSettingsSchema = require('@schemas/server-settings-schema');
const guildPrefixes = {};

const language = require('@i18n/i18n');

const validatePermissions = (permissions) => {
    const validPermissions = [
        'ADMINISTRATOR',
        'CREATE_INSTANT_INVITE',
        'KICK_MEMBERS',
        'BAN_MEMBERS',
        'MANAGE_CHANNELS',
        'MANAGE_GUILD',
        'ADD_REACTIONS',
        'VIEW_AUDIT_LOG',
        'PRIORITY_SPEAKER',
        'STREAM',
        'VIEW_CHANNEL',
        'SEND_MESSAGES',
        'SEND_TTS_MESSAGES',
        'MANAGE_MESSAGES',
        'EMBED_LINKS',
        'ATTACH_FILES',
        'READ_MESSAGE_HISTORY',
        'MENTION_EVERYONE',
        'USE_EXTERNAL_EMOJIS',
        'VIEW_GUILD_INSIGHTS',
        'CONNECT',
        'SPEAK',
        'MUTE_MEMBERS',
        'DEAFEN_MEMBERS',
        'MOVE_MEMBERS',
        'USE_VAD',
        'CHANGE_NICKNAME',
        'MANAGE_NICKNAMES',
        'MANAGE_ROLES',
        'MANAGE_WEBHOOKS',
        'MANAGE_EMOJIS'
    ];
    for (const permission of permissions) {
        if (!validPermissions.includes(permission)) {
            throw new Error(`Rischiesto permesso sconosciuto "${permission}".`);
        };
    };
};
module.exports = (client, commandOptions, commandPath) => {
    let {
        commands,
        expectedArgs = '',
        permissionError = 'non hai i permessi necessari per eseguire questo comando.',
        minArgs = 0,
        maxArgs = null,
        permissions = [],
        requiredRoles = [],
        callback
    } = commandOptions;

    //Check che gli alias dei comandi siano all'interno di un array.
    if (typeof commands === 'string') {
        commands = [commands];
    };
    //Check che i permessi siano in un array e siano tutti validi.
    if (permissions.length) {
        if (typeof permissions === 'string') {
            permissions = [permissions];
        };
        validatePermissions(permissions);
    };

    //Catching dei comandi.
    client.on('message', async (message) => {
        const { member, content, guild } = message;

        if (message.author.bot) return;

        for (const alias of commands) {
            const prefix = guildPrefixes[guild.id] || globalPrefix;
            const command = `${prefix}${alias.toLowerCase()}`;

            if (content.toLowerCase().startsWith(`${command} `) || content.toLowerCase() === command) {
                //Get traslated properties from DB.
                const traslations = language(guild, commandPath[0], commandPath[1], commandPath[2]);

                //ExpectedArgs
                const expArgs = traslations.expArgs || expectedArgs;

                //Check user permissions.
                for (const permission of permissions) {
                    if (!member.hasPermission(permission)) {
                        message.reply(permissionError);
                        return
                    };
                };

                //Check user roles.
                for (const requiredRole of requiredRoles) {
                    const role = guild.roles.cache.find((role) => role.name === requiredRole);
                    if (!role || !member.roles.cache.has(role.id)) {
                        message.reply(`non hai il ruolo \`${requiredRole}\` necessario per eseguire questo comando`);
                        return
                    };
                };

                //Check syntax parameters.
                const arguments = content.split(/[ ]+/);
                arguments.shift();
                if (arguments.length < minArgs || (maxArgs !== null && arguments.length > maxArgs)) {
                    message.reply(`sintassi del comando errata. Usa: \`${prefix}${alias} ${expArgs}\``);
                    return
                }

                //Logging command execution.
                console.log(`Running the command: ${alias} on ${guild.name}`);

                //Reaction to command.
                await message.react("🌺");

                //Command-related code.
                callback(message, arguments, arguments.join(' '), client, prefix, traslations);
                return
            }
        }
    })
}

module.exports.updateCache = (guildId, newPrefix) => {
    guildPrefixes[guildId] = newPrefix;
}

module.exports.loadPrefixes = async (client) => {
    for (const guild of client.guilds.cache) {
        const guildID = guild[1].id;

        const result = await serverSettingsSchema.findOne({ _id: guildID })
        guildPrefixes[guildID] = result ? result.prefix : globalPrefix;
    }
}