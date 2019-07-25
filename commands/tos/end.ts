const { id } = require('../../config.json');

import Discord from 'discord.js';
import { Command, GameClient } from '../../index';
import { Game, Stage } from './src/game';
import { isUndefined, isNull } from '../../utils';

module.exports = new Command({
    name: "end",
    aliases: ['stop'],
    description: 'Ends a Town Of Salem game. Only executable by moderator',
    usage: '`tos' + id + 'end`',
    guildOnly: true,
    cooldown: 10,
    requireArgs: false,
    execute(message: Discord.Message) {
        const client: GameClient = require("../../index.ts");
        const game: Game | undefined = client.games.get(message.guild.id);
        if (isUndefined(game)) return;

        if (game.stage === Stage.Ended) return message.reply("Wow you really don't like this game.");
        if (message.author != game.moderator) return message.reply("Ask the guy in charge");
        if (message.channel != game.announcements) return message.reply('Wrong channel my dood');

        const end = new Discord.RichEmbed()
            .setTitle('**The game of Town Of Salem has just finished!**')
            .setDescription(`This game was run by: ${message.member.nickname || message.author.username}`)
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .setTimestamp();
            //TO-DO: Add game info (ie reveal the roles of each player)
        game.reset(end);
    }
})