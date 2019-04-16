const { id } = require('../../config.json')

import Discord from 'discord.js';
import { Command, GameClient } from '../../index';
import { Stage } from './src/game';
import { shuffle, isUndefined } from '../../utils';

module.exports = new Command({
    name: 'start',
    aliases: undefined,
    description: 'Starts the Town Of Salem game! Assigns roles to all players and begins Night 1.',
    usage: '`tos' + id + 'start`',
    guildOnly: true,
    cooldown: 10,
    args: false,
    execute(message: Discord.Message) {
        const client: GameClient = require("../../index.ts");
        const game = client.games.get(message.guild.id);
        if (isUndefined(game)) return;

        if (!game.running) return message.reply('Setup a game first!');
        if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');
        if (game.stage != Stage.Setup) return message.channel.send(`The game has already begun, ${message.member.nickname || message.author.username}!`);
        if (message.member != game.moderator) return message.reply("Ask the faggot in charge");
        if (game.players.length > game.roles.length) return message.reply('You need to add more roles first!');

        if (game.players.length <= 5) message.channel.send('This is gonna be a pretty lame game, just saying.');
        message.channel.send('Shuffling roles...');
        game.roles = shuffle(game.roles);
        message.channel.send('Assigning to players...');
        game.players.forEach((member, index) => {
            const { Player } = require(`./roles/${game.roles[index]}.ts`);
            const user: Discord.User = member.user
            const player = new Player(user)
            game.assignments.set(member, player);
        });
        message.channel.send('The game has begun!');
        game.cycleNight();
    }
})