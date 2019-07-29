import { isNull, isUndefined } from "../../../utils";
import Discord from 'discord.js';
import { GameClient } from "../../..";
import { Game, ActiveMenu } from "./game";
//@ts-ignore
import { Menu } from "reaction-core";

export async function initializeGame(message: Discord.Message, game: Game) {
    const client: GameClient = require('../../../index');

    if (isUndefined(client.guild)) return console.log("Initial.ts: 11");

    await client.guild!.createRole({ name: message.guild.name }).then(role => game.role = role);
    if (isNull(game.role)) return console.log("Initial.ts: 14")
    if (isNull(game.moderator)) return console.log("Initial.ts: 15");

    game.category = await client.guild!.createChannel(message.guild.name, {type: "category", permissionOverwrites: [{id: game.role!.id, allow: ['VIEW_CHANNEL']}]}) as Discord.CategoryChannel;
    game.announcements = await client.guild!.createChannel('announcements', {type: 'text', permissionOverwrites: [{ id: game.role.id, allow: ["VIEW_CHANNEL", "READ_MESSAGES", "READ_MESSAGE_HISTORY"]}, {id: game.moderator.id, allow: ["SEND_MESSAGES"]}]} ) as Discord.TextChannel;
    game.announcements.setParent(game.category);
    
    const invitation = await game.announcements!.createInvite();
    const inviteLink = invitation.url;
    
    //@ts-ignore
    message.author.pending = message.guild.id;
    message.author.createDM().then(dm => dm.send(`You're hosting the game here: ${inviteLink}`));

    const setupButtons = [
        { //tos!leave
            emoji: '📤',
            run: async (user: Discord.User, message: Discord.Message) => {
                const member: Discord.GuildMember = await message.guild.fetchMember(user);
                let notification: Discord.Message;
                if (!game.players.includes(member)) {
                    notification = await message.channel.send(`You're not in the game, <@${member.user.id}>!`) as Discord.Message;
                } else if (user == game.moderator) {
                    notification = await message.channel.send(`You can't leave the game, <@${game.moderator.id}>, you're the moderator!`) as Discord.Message;
                } else {
                    game.players.splice(game.players.indexOf(message.member), 1);
                    //@ts-ignore
                    user.partOfTos = false;
                    notification = await message.channel.send(`<@${member.user.id}> has left the game!`) as Discord.Message;
                    member.kick();
                    message.edit(game.setupEmbed())
                }
                setTimeout(() => notification.delete(), 5000)
            }
        }
    ]
    const setup = new Menu(game.setupEmbed(), setupButtons)
    client.handler.addMenus(setup)
    //@ts-ignore
    game.announcements.sendMenu(setup).then(message => {
        game.setup = message as Discord.Message;
        game.activeMenuIds.set(ActiveMenu.Setup, message.id);
    })

    const joinButton = [
        {
            emoji: '📥',
            run: async (user: Discord.User, message: Discord.Message) => {
                const memberOrigin: Discord.GuildMember = await message.guild.fetchMember(user);
                let member: Discord.GuildMember | undefined = undefined;
                let invitation: Discord.Message | undefined = undefined;
                try {
                    member = await client.guild!.fetchMember(user)
                } catch(error) {};
                let notification: Discord.Message;
                if (member && game.players.includes(member)) {
                    notification = await message.channel.send(`You are already in the game, <@${memberOrigin.user.id}>!`) as Discord.Message;
                //@ts-ignore
                } else if (user.partOfTos) {
                    notification = await message.channel.send(`You are part of a game on a different server, <@${memberOrigin.user.id}>!`) as Discord.Message;
                } else {
                    //@ts-ignore
                    user.pending = message.guild.id;
                    notification = await message.channel.send(`An invitation has been sent, <@${memberOrigin.user.id}>.`) as Discord.Message;
                    const dm = await user.createDM();
                    const embed = new Discord.RichEmbed()
                        .setColor("#ffff00")
                        .setTitle("Town of Salem")
                        .setDescription(`Join the game: ${inviteLink}`)
                        .setFooter("Invite expires after 20 seconds");
                    invitation = await dm.send(embed) as Discord.Message;
                }
                setTimeout(() => notification.delete(), 5000);
                    setTimeout(() => {
                        //@ts-ignore
                        user.pending = undefined;
                        invitation && invitation.delete()
                    }, 20000)
            }
        }

    ]

    const gameLink = new Discord.RichEmbed()
            .setTitle('**Town of Salem has started!**')
            .setDescription(`This game is run by: ${game.moderator!.username}
                             Join the game by reacting below!`)
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .setTimestamp();
    const gameInvite = new Menu(gameLink, joinButton)
        client.handler.addMenus(gameInvite)
        //@ts-ignore
        message.channel.sendMenu(gameInvite);
}