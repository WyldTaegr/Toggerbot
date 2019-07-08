const { id } = require('../../config.json');

import { Command } from '../../index';
import { Message } from 'discord.js';
import { Stage } from './src/game';

module.exports = new Command({
    name: "leave",
    aliases: ['exit'],
    description: "Leave the Town Of Salem Game on the server, if you are part of it",
    usage: '`tos' + id + 'leave`',
    guildOnly: true,
    cooldown: 2,
    args: false,
    execute(message: Message) {
        const client = require('../../index.ts');
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.channel.send("There's no game to leave.");
        if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');
        if (!game.players.includes(message.member)) return message.reply("You're not in the game!");
        if (message.member == game.moderator) return message.reply("You can't leave, you're the moderator!");
        if (game.stage != Stage.Setup) return message.channel.send("My man, you are already in too deep.");

        game.players.splice(game.players.indexOf(message.member), 1);
        //@ts-ignore
        message.author.partOfTos = false;
        message.channel.send(`${message.member.nickname || message.author.username} has left the game`)
    }
})