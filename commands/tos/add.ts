const { id } = require('../../config.json');

import Discord from 'discord.js';
import { Command, GameClient } from '../../index';
import { Stage, Roles, RoleName } from './src/game';
import { isUndefined } from '../../utils';

module.exports = new Command({
    name: 'add',
    aliases: undefined,
    description: 'Add a role to the Town Of Salem game. Only executeable by moderator.',
    usage: '`tos' + id + 'add [Role]',
    guildOnly: true,
    cooldown: 1,
    requireArgs: false,
    async execute(message: Discord.Message, args: string[] | undefined) {
        if (isUndefined(args)) return;
        const client: GameClient = require('../../index.ts');
        //@ts-ignore
        const game = client.games.get(message.author.partOfTos);
            if (isUndefined(game)) return;

        if (game.stage === Stage.Ended) return message.reply('Start a game first!');
        if (message.channel != game.chat) return message.channel.send('Wrong channel, my dood.');
        if (game.stage != Stage.Setup) return message.channel.send(`The game has already begun, ${message.member.nickname || message.author.username}!`);
        if (message.author != game.moderator) return message.reply("Ask the guy in charge");
        if (args.length === 0) return game.chat.send('Provide a role to add with the command: `tos!add [Role]`').then(notification => {
            message.delete();
            setTimeout(() => (notification as Discord.Message).delete(), 3000)
        })
        
        message.delete();

        const _role: string = args[0].toLowerCase();
        //@ts-ignore
        const role: RoleName = Roles.findKey(Player => new Player().name.startsWith(_role))

        if (!role) {
            const notification: Discord.Message = await message.reply('That role is not available yet!') as Discord.Message;
            return setTimeout(() => notification.delete(), 3000);
        };

        const Player = Roles.get(role);
        //@ts-ignore
        if (new Player().unique && game.roles.includes(role)) {
            const notification: Discord.Message = await message.reply(`A ${role} is already in the game, and cannot be added again!`) as Discord.Message;
            return setTimeout(() => notification.delete(), 3000);
        }

        if (game.players.length <= game.roles.length) {
            const notification: Discord.Message = await message.channel.send('Note: there are more roles than there are players! Upon starting, roles will randomly be chosen from the role pool.') as Discord.Message;
            setTimeout(() => notification.delete(), 3000);
        }

        game.roles.push(role);
        const notification: Discord.Message = await message.channel.send('Role `' + role + '` Added to the game!') as Discord.Message;
        game.setup!.edit(game.setupEmbed())
        setTimeout(() => notification.delete(), 3000);
    }
})