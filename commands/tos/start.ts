const { id } = require('../../config.json')

import Discord from 'discord.js';
import { Command, GameClient } from '../../index';
import { Stage, Game, ActiveMenu } from './src/game';
import { shuffle, isUndefined, isNull } from '../../utils';
import { CycleNight } from './src/Night';

function firstDay(game: Game) {
    game.counter++;
    game.stage = Stage.Day;
    let playerList = ''
    game.alive.map(member => member.nickname ? member.nickname : member.user.username).forEach(value => {playerList = playerList.concat(value, '\n')})
    const day = new Discord.RichEmbed()
        .setTitle(`${game.stage} ${game.counter}`)
        .setColor('#ffff00')
        .setDescription('Welcome to Town of Salem!')
        .addField("Players participating in this game:", playerList)
        .setFooter("The first night will begin in 15 seconds");
    game.announcements!.send(day)
}

async function createChannels(game: Game) {
    const client: GameClient = require('../../index');
    const guildId = client.games.findKey('moderator', game.moderator)
    const guild = client.guilds.get(guildId);
    if (isUndefined(guild)) return;
    
    if (isNull(game.role)) return console.log("start.ts: 29")

    const mafiaOptions: Array<Discord.ChannelCreationOverwrites | Discord.PermissionOverwrites> = [
        {
            id: game.role.id,
            deny: ['VIEW_CHANNEL'],
        },
    ]
    game.mafiaMembers.map(member => {
        mafiaOptions.push({ id: member.user.id, allow: ['VIEW_CHANNEL']})
    })
    
    if (isUndefined(client.guild)) return console.log ("start.ts: 41");
    if (isNull(game.category)) return console.log("start.ts: 42")

    game.mafia = await client.guild.createChannel('Mafia', {type: 'text', permissionOverwrites: mafiaOptions}) as Discord.TextChannel;
        game.mafia.setParent(game.category!)
    game.jail = await client.guild.createChannel('Jail', {type: 'text', permissionOverwrites: [ { id: game.role.id, deny: ['VIEW_CHANNEL'] } ]}) as Discord.TextChannel;
        game.jail.setParent(game.category!)
    game.graveyard = await client.guild.createChannel('Graveyard', {type: 'text', permissionOverwrites: [ { id: game.role.id, deny: ['VIEW_CHANNEL'] } ]}) as Discord.TextChannel;
        game.graveyard.setParent(game.category!)
}

module.exports = new Command({
    name: 'start',
    aliases: undefined,
    description: 'Starts the Town Of Salem game! Assigns roles to all players and begins Night 1.',
    usage: '`tos' + id + 'start`',
    guildOnly: true,
    cooldown: 10,
    requireArgs: false,
    async execute(message: Discord.Message) {
        const client: GameClient = require("../../index.ts");
        //@ts-ignore
        const game = client.games.get(message.author.partOfTos);
        if (isUndefined(game)) return;

        if (game.stage === Stage.Ended) return message.reply('Setup a game first!');
        if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');

        message.delete();

        if (game.stage != Stage.Setup) return message.channel.send(`The game has already begun, ${message.member.nickname || message.author.username}!`).then(message => setTimeout(() => (message as Discord.Message).delete() , 3000));
        if (game.players.length > game.roles.length) return message.reply('You need to add more roles first!').then(message => setTimeout(() => (message as Discord.Message).delete() , 3000));

        if (game.players.length <= 5) message.channel.send('This is gonna be a pretty lame game, just saying.');
        client.handler.removeMenu(game.activeMenuIds.get(ActiveMenu.Setup));
        message.channel.send('Shuffling roles...');
        game.roles = shuffle(game.roles);
        message.channel.send('Assigning to players...');
        await game.players.forEach(async (member, index) => {
            const { Player } = require(`./roles/${game.roles[index]}.ts`);
            const user: Discord.User = member.user
            const player = new Player(user)
            player.input = await message.guild.createChannel(member.nickname ? member.nickname : user.username, {type: "text", permissionOverwrites: [{ id: game.role!.id, deny: ['VIEW_CHANNEL']}, { id: user.id, allow: ['VIEW_CHANNEL']}]})
            player.input.setParent(game.category)
            game.assignments.set(member, player);
        });
        createChannels(game);
        message.channel.send('The game has begun!');
        firstDay(game);
        setTimeout(() => {
            CycleNight(game);
        }, 15000);
    }
})