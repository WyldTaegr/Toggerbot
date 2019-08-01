const { id } = require('../../config.json')

import Discord from 'discord.js';
import { Command, GameClient } from '../../index';
import { Stage, Game, ActiveMenu, roleEmbed, Roles } from './src/game';
import { shuffle, isUndefined, isNull } from '../../utils';
import { CycleNight } from './src/Night';
import { _Player } from './src/player';

const day = new Discord.Attachment('images/tos/day.png');

async function firstDay(game: Game) {
    if (game.assignments.size < game.players.length) return console.error("Didn't complete player assignments", game.assignments)
    game.counter++;
    game.stage = Stage.Discussion;
    let playerList = ''
    game.alive.map(member => member.nickname ? member.nickname : member.user.username).forEach(value => {playerList = playerList.concat(value, '\n')})

    let counter = 15;
    function dayEmbed() { 
        const embed = new Discord.RichEmbed()
            .setTitle(`Day ${game.counter}`)
            .attachFile(day)
            .setThumbnail('attachment://day.png')
            .setColor('#ffff00')
            .setDescription('Welcome to Town of Salem!')
            .addField("Players participating in this game:", playerList)

            if (counter > 0) embed.setFooter(`The first night will begin in ${counter} seconds`);
        return embed;
    }
    
    const message = await game.chat!.send(dayEmbed()) as Discord.Message;
    
    counter -= 5;
    const countdown = setInterval(() => {
        message.edit(dayEmbed());
        if (counter === 0) {
            clearInterval(countdown);
            CycleNight(game);
        } else {
            counter -= 5;

        }
    }, 5000);
}

async function createChannels(game: Game) {
    const client: GameClient = require('../../index');
    const guildId = client.games.findKey((test) => !isNull(test.moderator) && test.moderator === game.moderator)
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
        game.mafia.setParent(game.category)
    game.jail = await client.guild.createChannel('Jail', {type: 'text', permissionOverwrites: [ { id: game.role.id, deny: ['VIEW_CHANNEL'] } ]}) as Discord.TextChannel;
        game.jail.setParent(game.category)
    game.graveyard = await client.guild.createChannel('Graveyard', {type: 'text', permissionOverwrites: [ { id: game.role.id, deny: ['VIEW_CHANNEL'] } ]}) as Discord.TextChannel;
        game.graveyard.setParent(game.category)
}

module.exports = new Command({
    name: 'start',
    aliases: undefined,
    description: 'Starts the Town Of Salem game! Assigns roles to all players and begins Night 1.',
    usage: '`tos' + id + 'start`',
    guildOnly: true,
    cooldown: 10,
    requireArgs: false,
    execute(message: Discord.Message) {
        const client: GameClient = require("../../index.ts");
        //@ts-ignore
        const game = client.games.get(message.author.partOfTos);
        if (isUndefined(game)) return;

        if (game.stage === Stage.Ended) return message.reply('Setup a game first!');
        if (message.channel != game.chat) return message.channel.send('Wrong channel, my dood.');

        message.delete();

        if (game.stage != Stage.Setup) return message.channel.send(`The game has already begun, <@${message.author.id}>!`).then(message => setTimeout(() => (message as Discord.Message).delete() , 3000));
        if (game.players.length > game.roles.length) return message.reply('You need to add more roles first!').then(message => setTimeout(() => (message as Discord.Message).delete() , 3000));

        game.chat.overwritePermissions(game.moderator!, { 'SEND_MESSAGES': false})

        if (game.players.length <= 5) message.channel.send('This is gonna be a pretty lame game, just saying.');
        client.handler.removeMenu(game.activeMenuIds.get(ActiveMenu.Setup));
        message.channel.send('Shuffling roles...');
        game.roles = shuffle(game.roles);
        message.channel.send('Assigning to players...');
        game.players.forEach(async (member, index) => {
            const Player = Roles.get(game.roles[index])
            if (isUndefined(Player)) return;
            const user: Discord.User = member.user
            //@ts-ignore
            const player: _Player = new Player(user, index)
            player.input = await message.guild.createChannel(`secret ${member.user.discriminator}`, {type: "text", permissionOverwrites: [{ id: game.role!.id, deny: ['VIEW_CHANNEL']}, { id: user.id, allow: ['VIEW_CHANNEL', 'READ_MESSAGES', 'READ_MESSAGE_HISTORY', 'SEND_MESSAGES', 'ADD_REACTIONS']}]}) as Discord.TextChannel;
            await player.input.setParent(game.category!)
            await game.assignments.set(member, player);
            player.input.send(roleEmbed(player.view))
        });

        const startGame = setInterval(() => {
            if (game.assignments.size < game.players.length) return;
            if (!game.chat) return console.error('tos!start: game.chat is not defined');
            game.chat.bulkDelete(game.chat.messages.size);
            clearInterval(startGame)
            createChannels(game);
            firstDay(game);
        }, 1000)
    }
})