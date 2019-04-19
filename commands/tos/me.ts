const { id } = require('../../index');

import Discord from 'discord.js';
import { GameClient } from '../../index';
import { isUndefined } from '../../utils';

module.exports = {
    name: 'me',
    aliases: undefined,
    description: 'Displays your role in the Town Of Salem game. You should only use this by PMing me!',
    usage: '`tos' + id + 'me`',
    guildOnly: false,
    cooldown: 10,
    args: false,
    execute(message: Discord.Message) {
        const client: GameClient = require('../../index.ts');
        //@ts-ignore
        if (!message.author.partOfTos) return message.reply('You are not in a game of Town Of Salem!');
        //@ts-ignore
        const game = client.games.get(message.author.partOfTos);
            if (isUndefined(game)) return;
        if (message.channel.type == 'text') {
            //@ts-ignore
            if (message.author.partOfTos != message.guild.id) return message.channel.send('Wrong server, my dood.');
            if (!game.running) return message.reply('There is no game for you to have a role in!');
            
            message.channel.send('Did my man just make a huge mistake?');
        }

        message.reply('Your role is:');
        //@ts-ignore
        const guild: Discord.Guild | undefined = client.guilds.get(message.author.partOfTos);
            if (isUndefined(guild)) return;
        let member: Discord.GuildMember | undefined;
        if (message.channel.type == 'text') {
            member = message.member;
        } else {
            member = guild.members.get(message.author.id);
        }
            if (isUndefined(member)) return;
        const player = game.assignments.get(member);
            if (isUndefined(player)) return;
        const { View } = require(`./roles/${player.name}.ts`);
        const embed = new Discord.RichEmbed()
            .setTitle(View.name)
            .setThumbnail(View.pictureUrl)
            .setColor(View.color)
            .setDescription(`Alignment/Category: ${View.alignment} (${View.category})`)
            .addField('Abilities', View.abilities, true)
            .addField('Attributes', View.attributes, false)
            .addField('Goal', View.goal, false)
        message.author.send(embed);
    }
}