const { id } = require('../../config.json')

import Discord from 'discord.js';
import { Command } from '../../index';

module.exports = new Command({
    name: 'kill',
    aliases: undefined,
    description: 'Kills the bot safely by resetting all edited objects and logging out',
    usage: "`s" + id + "kill`",
    guildOnly: false,
    cooldown: 0,
    args: false,
    async execute(message: Discord.Message) {
        const client = require('../../index.ts');

        if (message.author.id != '179697448300576778') return message.reply("I don't answer to you.");

        message.author.send('Ending games of Town Of Salem...')
        for (const gameArray of client.games) {
            const game = gameArray[1];
            if (game.running) {
                const end = new Discord.RichEmbed()
                    .setTitle('**The game of Town Of Salem has been forced to end.**')
                    .setDescription(`This game was run by: ${game.moderator.nickname || game.moderator.user.username}`)
                    .setColor('#ffff00')
                    .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
                    .setTimestamp();
                    //TO-DO: Add game info (ie players with their respective roles)
                game.announcements.delete();
                game.category.delete();
                game.origin.send(end);
                game.reset();
            }
        }
        
        await message.author.send('Kill confirmed. \nLogging off...');
        await console.log('The application has been shut down through user input.');
        await client.destroy('481493171587514378');
    }
});