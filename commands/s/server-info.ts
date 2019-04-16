const { id } = require('../../config.json');

import { Command } from '../../index';
import Discord from 'discord.js'

module.exports = new Command ({
    name: 'server',
    aliases: ['cfc'],
    description: 'Show info about the server',
    usage: '`s' + id + 'server`',
    guildOnly: true,
    cooldown: 5,
    args: false,
    execute(message: Discord.Message) {
        const embed = new Discord.RichEmbed()
            .setTitle(`**${message.guild.name}**`)
            .setColor(0x00AE86)
            .setDescription("Below is information about your server:")
            .setThumbnail(`${message.guild.iconURL}`)
            .setTimestamp()
            .addField('Member Count:' ,message.guild.memberCount)
            .addField('Server:', message.guild.region)
            .addField('AFK Timeout:', message.guild.afkTimeout)
            .addField('AFK Channel:', message.guild.afkChannel)
            .addField('Date of Formation:', message.guild.createdAt);

        message.channel.send({embed});
    }
})