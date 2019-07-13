const { id } = require('../../config.json');

import Discord from 'discord.js';
import { Command } from '../../index';
import { Game, Stage } from './src/game';
import { isNull } from 'util';
//@ts-ignore
import { Menu } from 'reaction-core';

const initializeGame = async function (message: Discord.Message, game: Game) {
    const client = require('../../index');

    if(isNull(game.moderator)) return;

    game.category = await message.guild.createChannel('Town Of Salem', 'category') as Discord.CategoryChannel;
    game.announcements = await message.guild.createChannel('gods-decree', 'text') as Discord.TextChannel;
    game.announcements.setParent(game.category);

    const welcome = new Discord.RichEmbed()
            .setTitle('**Welcome To Salem!**')
            .setDescription(`This game is run by: ${game.moderator.nickname || game.moderator.user.username}`)
            .setColor('#ffff00')
            .setTimestamp();
        const gameChannel = await game.announcements.send(welcome) as Discord.Message;

    const setupButtons = [
        { //tos!join
            emoji: '📥',
            run: async (user: Discord.User, message: Discord.Message) => {
                const member: Discord.GuildMember = await message.guild.fetchMember(user)
                let notification: Discord.Message;
                if (game.players.includes(member)) {
                    notification = await message.channel.send(`You are already in the game, ${member.nickname || user.username}!`) as Discord.Message;
                //@ts-ignore
                } else if (user.partOfTos) {
                    notification = await message.channel.send(`You are part of a game on a different server, ${member.nickname || user.username}!`) as Discord.Message;
                } else {
                    game.players.push(member)
                    //@ts-ignore
                    user.partOfTos = message.guild.id;
                    notification = await message.channel.send(`${member.nickname || user.username} has joined the game!`) as Discord.Message;
                    message.edit(setupEmbed());
                }
                setTimeout(() => notification.delete(), 5000)
            }
        },
        { //tos!leave
            emoji: '📤',
            run: async (user: Discord.User, message: Discord.Message) => {
                const member: Discord.GuildMember = await message.guild.fetchMember(user);
                let notification: Discord.Message;
                if (!game.players.includes(member)) {
                    notification = await message.channel.send(`You're not in the game, ${member.nickname || user.username}!`) as Discord.Message;
                } else if (member == game.moderator) {
                    notification = await message.channel.send("You can't leave the game, you're the moderator!") as Discord.Message;
                } else {
                    game.players.splice(game.players.indexOf(message.member), 1);
                    //@ts-ignore
                    user.partOfTos = false;
                    notification = await message.channel.send(`${member.nickname || user.username} has left the game!`) as Discord.Message;
                    message.edit(setupEmbed())
                }
                setTimeout(() => notification.delete(), 5000)
            }
        }
    ]
    function setupEmbed() {
        const playerNames = game.players.map((member: Discord.GuildMember) => member.nickname || member.user.username)
            .toString()
            .replace(/,/g, '\n');
        const roleNames = game.roles.map((role: string) => role.charAt(0).toUpperCase() + role.slice(1))
            .toString()
            .replace(/,/g, '\n');

        return new Discord.RichEmbed()
            .setTitle('Town of Salem')
            .setColor('#ffff00')
            .setDescription(`Moderator: ${game.moderator!.nickname || game.moderator!}`)
            .addField('Players:', playerNames, true)
            .addField('Roles:', roleNames || 'No roles yet lol', true)
    }
    const setup = new Menu(setupEmbed, setupButtons)
    client.handler.addMenus(setup)
    //@ts-ignore
    game.announcements.sendMenu(setup).then(message => game.activeMenuId = message.id)

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
    execute(message: Discord.Message) {
        const client = require("../../index.ts");
        const game: Game = client.games.get(message.guild.id);

        if (game.running) return message.reply("Stop being a sore-ass loser");
        //@ts-ignore
        if (message.author.partOfTos && message.author.partOfTos != message.guild.id) return message.reply("You're already part of a game on a different server!");

        game.origin = message.channel as Discord.TextChannel;
        game.running = true;
        game.stage = Stage.Setup;
        game.moderator = message.member;
        game.players.push(message.member);
        //@ts-ignore
        message.author.partOfTos = message.guild.id;
        
        initializeGame(message, game);
        
    }
})