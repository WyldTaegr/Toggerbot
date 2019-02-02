const { id } = require('../../config.json');

import { Command } from '../../index';

module.exports = new Command({
    name: 'remove',
    aliases: undefined,
    description: 'Remove a role added to the game. Only executable by moderator.',
    usage: '`tos' + id + 'add [Role]`',
    guildOnly: true,
    cooldown: 2,
    args: true,
    execute(message, args) {
        const client = require('../../index.ts');
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.reply('Start a game first!');
        if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');
        if (game.stage != 'setup') return message.channel.send(`The game has already begun, ${message.member.nickname || message.author.username}!`);
        if (message.member != game.moderator) return message.reply("Ask the faggot in charge");
        
        const role = args[0].toLowerCase();
        if(!game.roles.includes(role)) return message.reply('No such role is currently added to the game!');

        game.roles.splice(game.roles.lastIndexOf(role), 1);
        message.channel.send('One instance of `' + role.charAt(0).toUpperCase() + role.slice(1) + '` has been removed from the game.');
    }
})