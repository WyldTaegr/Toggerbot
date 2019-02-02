const { id } = require('../../config.json');

import Discord from 'discord.js';
import { Command } from '../../index';
import { Game, Stage } from './src/game';

const initializeGame = async function (message: Discord.Message, game: Game) {
    game.category = await message.guild.createChannel('Town Of Salem', 'category');
    game.announcements = await message.guild.createChannel('gods-decree', 'text') as Discord.TextChannel;
    game.announcements.setParent(game.category);

    const welcome = new Discord.RichEmbed()
            .setTitle('**Welcome To Salem!**')
            .setDescription(`This game is run by: ${game.moderator.nickname || game.moderator.user.username}`)
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .setTimestamp();
        const gameChannel = await game.announcements.send(welcome) as Discord.Message;

    const gameLink = new Discord.RichEmbed()
            .setTitle('**Town of Salem has started!**')
            .setDescription(`This game is run by: ${game.moderator.nickname || game.moderator.user.username}
                             Join the game: ${gameChannel.url}`)
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .setTimestamp();
        message.channel.send(gameLink);
}

module.exports = new Command({
    name: "tos",
    aliases: ['game', 'setup'],
    description: `Setup a game of Town Of Salem, with you as the moderator.`,
    usage: '`tos' + id + 'tos`',
    cooldown: 10,
    guildOnly: true,
    args: false,
    execute(message) {
        const client = require("../../index.ts");
        const game: Game = client.games.get(message.guild.id);

        if (game.running) return message.reply("Stop being a sore-ass loser");
        if (message.author.partOfTos && message.author.partOfTos != message.guild.id) return message.reply("You're already part of a game on a different server!");

        game.origin = message.channel;
        game.running = true;
        game.stage = Stage.Setup;
        game.moderator = message.member;
        game.players.push(message.member);
        message.author.partOfTos = message.guild.id;
        
        initializeGame(message, game);
        
    }
})