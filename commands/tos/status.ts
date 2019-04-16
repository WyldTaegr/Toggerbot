const { id } = require('../../config.json');

import Discord from 'discord.js';
import { Command } from '../../index';

module.exports = new Command ({
    name: 'status',
    aliases: ['info'],
    description: 'Displays info about the current game.',
    usage: '`tos' + id + 'status`',
    guildOnly: true,
    cooldown: 6,
    args: false,
    execute(message: Discord.Message) {
        const client = require('../../index.ts');
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.reply("There's no game!");
        if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');

        const playerNames = game.players.map((member: Discord.GuildMember) => member.nickname || member.user.username)
            .toString()
            .replace(/,/g, '\n');
        const roleNames = game.roles.map((role: string) => role.charAt(0).toUpperCase() + role.slice(1))
            .toString()
            .replace(/,/g, '\n');

        const status = new Discord.RichEmbed()
            .setTitle('**Town Of Salem**')
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .setDescription(`Moderator: ${game.moderator.nickname || game.moderator.user.username}`)
            .addField('Players:', playerNames, true)
            .addField('Roles:', roleNames || 'No roles yet lol', true)

        game.announcements.send(status)
    }
})