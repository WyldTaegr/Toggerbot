const { id } = require('../../config.json');

import Discord from 'discord.js';
import fs from 'fs';
import { _View } from './src/player';
import { isUndefined } from '../../utils';
import { roleEmbed } from "./src/game";

const roles: Discord.Collection<string, _View> = new Discord.Collection();
const roleFiles = fs.readdirSync('./commands/tos/roles').filter(file => file.endsWith('.ts'));
for (const file of roleFiles) {
    const { View } = require(`./roles/${file}`);
    roles.set(View.name.toLowerCase(), View)
}

module.exports = {
    name: "role",
    aliases: ['r', 'view'],
    description: 'See more information about a specific role in Town of Salem.',
    usage: '`tos' + id + 'role [Role]`', //NOTE: prefix before id depends on folder name!
    guildOnly: false,
    cooldown: 3,
    args: true,
    execute(message: Discord.Message, args: string[]) {
        const role: _View | undefined = roles.get(args[0]);
        if (isUndefined(role)) return;
        if (!role) {
            message.reply('that\'s not a role.');
            return;
        }

        message.channel.send(roleEmbed(role));

    }
}