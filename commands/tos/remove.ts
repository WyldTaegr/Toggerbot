const { id } = require('../../config.json');

import { Command, GameClient } from '../../index';
import Discord from 'discord.js';
import { isUndefined } from '../../utils';
import { Stage, RoleName } from './src/game';

module.exports = new Command({
    name: 'remove',
    aliases: undefined,
    description: 'Remove a role added to the game. Only executable by moderator.',
    usage: '`tos' + id + 'remove [Role]`',
    guildOnly: true,
    cooldown: 2,
    requireArgs: false,
    execute(message: Discord.Message, args: string[] | undefined) {
        if (isUndefined(args)) return;
        const client: GameClient = require('../../index.ts');
        //@ts-ignore
        const game = client.games.get(message.author.partOfTos);
        if (isUndefined(game)) return;

        if (game.stage === Stage.Ended) return message.reply('Start a game first!');
        if (message.channel != game.announcements) { message.channel.send('Wrong channel, my dood.'); return; };

        message.delete();

        if (game.stage != Stage.Setup) { message.channel.send(`The game has already begun, <@${message.author.id}>!`); return };
        if (message.author != game.moderator) { message.reply("Ask the guy in charge"); return; };
        
        if (args.length === 0) return message.channel.send('Select a role to remove from the role pool: `tos!remove [Role]`').then(message => setTimeout(() => (message as Discord.Message).delete(), 3000))

        const role: RoleName = args[0].toLowerCase() as RoleName;
        if(!game.roles.includes(role)) return message.reply('No such role is currently added to the game!').then(message => setTimeout(() => (message as Discord.Message).delete() , 3000));

        game.roles.splice(game.roles.lastIndexOf(role), 1);
        game.setup!.edit(game.setupEmbed())
        message.channel.send('One instance of `' + role.charAt(0).toUpperCase() + role.slice(1) + '` has been removed from the game.').then(message => setTimeout(() => (message as Discord.Message).delete() , 3000));
    }
})