const { id } = require('../../config.json');

import fs from 'fs';
import Discord from 'discord.js';
import { Command, GameClient } from '../../index';
import { Stage } from './src/game';
import { isUndefined } from '../../utils';

const roleNames: string[] = [];
const roleFiles = fs.readdirSync('./commands/tos/roles').filter(file => file.endsWith('.ts'));
for (const file of roleFiles) { //List of all roles currently added to the bot
    const { View } = require(`./roles/${file}`);
    roleNames.push(View.name.toLowerCase());
}

module.exports = new Command({
    name: 'add',
    aliases: undefined,
    description: 'Add a role to the Town Of Salem game. Only executeable by moderator.',
    usage: '`tos' + id + 'add [Role]',
    guildOnly: true,
    cooldown: 1,
    args: true,
    execute(message: Discord.Message, args: string[] | undefined) {
        if (isUndefined(args)) return;
        const client: GameClient = require('../../index.ts');
        const game = client.games.get(message.guild.id);
            if (isUndefined(game)) return;

        if (!game.running) return message.reply('Start a game first!');
        if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');
        if (game.stage != Stage.Setup) return message.channel.send(`The game has already begun, ${message.member.nickname || message.author.username}!`);
        if (message.member != game.moderator) return message.reply("Ask the faggot in charge");
        if (game.players.length <= game.roles.length) message.channel.send('Note: there are more roles than there are players! Upon starting, roles will randomly be chosen from the role pool.');
        
        const role = args[0].toLowerCase();

        if (!roleNames.includes(role)) return message.reply('That role is not available yet!');

        game.roles.push(role);
        message.channel.send('Role `' + role.charAt(0).toUpperCase() + role.slice(1) + '` Added to the game!')
    }
})