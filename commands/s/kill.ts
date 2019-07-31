const { id } = require('../../config.json')

import Discord from 'discord.js';
import { Command, GameClient } from '../../index';
import { Stage } from '../tos/src/game';

const logo = new Discord.Attachment('images/tos/logo.png');

module.exports = new Command({
    name: 'kill',
    aliases: undefined,
    description: 'Kills the bot safely by resetting all edited objects and logging out',
    usage: "`s" + id + "kill`",
    guildOnly: false,
    cooldown: 0,
    requireArgs: false,
    async execute(message: Discord.Message) {
        const client: GameClient = require('../../index.ts');

        if (message.author.id != '179697448300576778') return message.reply("I don't answer to you.");

        message.author.send('Ending games of Town Of Salem...')
        for (const [, game] of client.games) {
            if (game.stage !== Stage.Ended) {
                const moderator = await game.origin!.guild.fetchMember(game.moderator!)
                const end = new Discord.RichEmbed()
                    .setTitle('**The game of Town Of Salem has been forced to end.**')
                    .attachFile(logo)
                    .setThumbnail('attachment://logo.png')
                    .setDescription(`This game was run by: ${moderator!.nickname || moderator!.user.username}`)
                    .setColor('#ffff00')
                    .setTimestamp();
                    //TO-DO: Add game info (ie players with their respective roles)
                game.reset(end);
            }
        }

        if (client.guild) await client.guild.delete();
        
        await message.author.send('Kill confirmed. \nLogging off...');
        await console.log('The application has been shut down through user input.');
        await client.destroy();
    }
});