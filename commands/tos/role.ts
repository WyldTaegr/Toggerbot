const { id } = require('../../config.json');

import Discord from 'discord.js';
import fs from 'fs';
import { _View } from './src/player';

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
    execute(message, args) {
        const role: _View = roles.get(args[0]);
        if (!role) {
            message.reply('that\'s not a role.');
            return;
        }
        const embed = new Discord.RichEmbed()
            .setTitle(role.name)
            .setThumbnail(role.pictureUrl)
            .setColor(role.color)
            .setDescription(`Alignment: ${role.alignment} (${role.category})`)
            .addField('Abilities', role.abilities, true)
            .addField('Attributes', role.attributes, false)
            .addField('Goal', role.goal, false)

        message.channel.send(embed);

    }
}