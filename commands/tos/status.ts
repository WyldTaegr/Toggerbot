const { id } = require('../../config.json');

import Discord from 'discord.js';
import { Command } from '../../index';
import { Stage } from './src/game';

const logo = new Discord.Attachment('images/tos/logo.png');

module.exports = new Command ({
    name: 'status',
    aliases: ['info'],
    description: 'Displays info about the current game.',
    usage: '`tos' + id + 'status`',
    guildOnly: true,
    cooldown: 6,
    requireArgs: false,
    execute(message: Discord.Message) {
        const client = require('../../index.ts');
        const game = client.games.get(message.guild.id);

        if (game.stage === Stage.Ended) return message.reply("There's no game!");
        if (message.channel != game.chat) return message.channel.send('Wrong channel, my dood.');

        const playerNames = game.players.map((member: Discord.GuildMember) => member.nickname || member.user.username)
            .toString()
            .replace(/,/g, '\n');
        const roleNames = game.roles.map((role: string) => role.charAt(0).toUpperCase() + role.slice(1))
            .toString()
            .replace(/,/g, '\n');

        const status = new Discord.RichEmbed()
            .setTitle('**Town Of Salem**')
            .setColor('#ffff00')
            .attachFile(logo)
            .setThumbnail('attachment://logo.png')
            .setDescription(`Moderator: ${game.moderator.nickname || game.moderator.user.username}`)
            .addField('Players:', playerNames, true)
            .addField('Roles:', roleNames || 'No roles yet lol', true)

        game.chat.send(status)
    }
})