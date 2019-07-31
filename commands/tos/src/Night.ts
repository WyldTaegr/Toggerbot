import Discord from "discord.js";
import { Game, Stage, ActiveMenu } from "./game";
import { isNull } from "../../../utils";
import { isUndefined, emojis as _emojis } from "../../../utils";
//@ts-ignore
import { Menu } from 'reaction-core';
import { CycleDeaths } from "./Day";
import { _Player, Selection } from "./player";

const night = new Discord.Attachment('images/tos/night.png')

export async function CycleNight(game: Game) {
    const client = require('../../../index.ts')
    game.stage = Stage.Night;

    game.alive.forEach((playerMember: Discord.GuildMember) => {
        const player = game.assignments.get(playerMember)
        if (isUndefined(player)) return console.error("CycleNight: GuildMember without Player assignment");
        
        const buttons: Object[] = [];

        const playerList = game.alive;

        let playerSelection = '';

        playerList.forEach((member) => {
            const receiver = game.assignments.get(member);
                if (isUndefined(receiver)) return;
            playerSelection = playerSelection.concat(receiver.emoji, ' - ');

            playerSelection = playerSelection.concat(`<@${member.user.id}> \n`);
            if ((player.selection === Selection.others && game.assignments.get(member) !== player) || (player.selection === Selection.self && game.assignments.get(member) === player)) buttons.push({
                emoji: receiver.emoji,
                run: async (user: Discord.User, message: Discord.Message) => {
                    if (isUndefined(player.input)) return console.error("CycleNight: Player.input is not defined");
                    if ((player.selection === Selection.others && player === receiver) ||
                        player.selection === Selection.self && player !== receiver) return console.error(`CycleNight: ${player.user.username} targeted ${member.user.username} when they should not have been able to.`);
                    player.target = member; //Used to keep track of whether the person has already selected a target
                    const embed = new Discord.RichEmbed()
                        .setTitle(`You have targeted *${member.nickname || member.user.username}* for tonight.`)
                        .setColor('#ff0000')
                        .setThumbnail(player.view.pictureUrl);
                    player.input.send(embed);
                }
            })
        })

        const embed = new Discord.RichEmbed()
            .setTitle(`Night ${game.counter}`)
            .setDescription('You have 30 seconds to do something.')
            .setColor('#562796')
            .attachFile(night)
            .setThumbnail('attachment://night.png')
            .addField('Alive:', playerSelection)
            .setFooter('Set your target for tonight by reacting below');
        const message = new Menu(embed, buttons);
        client.handler.addMenus(message);
        // @ts-ignore
        player.input.sendMenu(message).then(message => player.activeMenuId = message.id);
    })
    let counter = 30;
    function nightEmbed() {
        const embed = new Discord.RichEmbed()
            .setTitle(`Night ${game.counter}`)
            .attachFile(night)
            .setThumbnail('attachment://night.png')
            .setColor('#562796')
            .setTimestamp()
        if (counter > 0) embed.setDescription(`${counter} seconds until dawn breaks!`);
        return embed;
    }
    const message = await game.announcements!.send(nightEmbed()) as Discord.Message;
    counter -= 5;
    const countdown = setInterval(() => {
        message.edit(nightEmbed())
        if (counter === 0) {
            clearInterval(countdown);
            game.route()
        } else counter -= 5;
    }, 5000);
}

export async function ProcessNight(game: Game) {
    const client = require('../../../index.ts')

    if (isNull(game.announcements)) return;

    game.stage = Stage.Processing;
        client.handler.removeMenu(game.activeMenuIds.get(ActiveMenu.Night));
        const message = await game.announcements.send('Processing the night...') as Discord.Message;
        game.announcements.startTyping();
        game.players.forEach((member) => {
            const player = game.assignments.get(member);
            if (player && !isNull(player.target)) {
                const priority = player.priority - 1; //Subtract 1 for array indexing!
                const target = game.assignments.get(player.target);
                if (isUndefined(target)) return;
                game.actions[priority].push({
                    agent: player, 
                    receiver: target,
                    game: game
                });
                player.target = null; //clean-up for next cycle
            }
        })
        for (const priority of game.actions) {
            for (const action of priority) {
                if (action.agent.alive) action.agent.action(action);
            }
        }
        game.actions = [[], [], [], [], []]
        game.counter++;
        setTimeout(() => {
            game.announcements!.stopTyping(true);
            message.delete();
            CycleDeaths(game);
        }, 3000);
}