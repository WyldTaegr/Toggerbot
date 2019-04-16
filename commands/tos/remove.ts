const { id } = require('../../config.json');

import { Command } from '../../index';
import Discord from 'discord.js';
import { isUndefined } from '../../utils';

module.exports = new Command({
    name: 'remove',
    aliases: undefined,
    description: 'Remove a role added to the game. Only executable by moderator.',
    usage: '`tos' + id + 'add [Role]`',
    guildOnly: true,
    cooldown: 2,
    args: true,
    execute(message: Discord.Message, args: string[] | undefined) {
        if (isUndefined(args)) return;
        const client = require('../../index.ts');
        const game = client.games.get(message.guild.id);

        if (!game.running) { message.reply('Start a game first!'); return; };
        if (message.channel != game.announcements) { message.channel.send('Wrong channel, my dood.'); return; };
        if (game.stage != 'setup') { message.channel.send(`The game has already begun, ${message.member.nickname || message.author.username}!`); return };
        if (message.member != game.moderator) { message.reply("Ask the faggot in charge"); return; };
        
        const role: string = args[0].toLowerCase();
        if(!game.roles.includes(role)) { message.reply('No such role is currently added to the game!'); return; };

        game.roles.splice(game.roles.lastIndexOf(role), 1);
        message.channel.send('One instance of `' + role.charAt(0).toUpperCase() + role.slice(1) + '` has been removed from the game.');
    }
})