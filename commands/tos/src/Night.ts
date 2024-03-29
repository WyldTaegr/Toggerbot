import Discord from "discord.js";
import { Game, Stage, ActiveMenu } from "./game";
import { isNull } from "../../../utils";
import { isUndefined, emojis as _emojis } from "../../../utils";
//@ts-ignore
import { Menu } from 'reaction-core';
import { _Player, Selection } from "./player";
import { CycleDeaths } from "./Day";

const night = new Discord.Attachment('images/tos/night.png')

export async function CycleNight(game: Game) {
    const client = require('../../../index.ts')
    game.stage = Stage.Night;

    game.players.forEach((playerMember: Discord.GuildMember) => {
        const player = game.assignments.get(playerMember)
        if (isUndefined(player)) return console.error("CycleNight: GuildMember without Player assignment [1]");
        if (!player.alive) {
            const embed = new Discord.RichEmbed()
                .setTitle(`Night ${game.counter}`)
                .setColor('#562796')
                .attachFile(night)
                .setThumbnail('attachment://night.png')
                .setDescription('You are dead.')
                .setTimestamp()
            return player.input!.send(embed)
        }
        if (player.name === "jailor") return;
        if (player.jailed) return;
        
        const buttons: Object[] = [];

        let playerSelection = '';

        game.alive.forEach((member) => {
            const receiver = game.assignments.get(member);
                if (isUndefined(receiver)) return console.error("CycleNight: GuildMember without Player assignment [2]");
            playerSelection = playerSelection.concat(receiver.emoji, ` - <@${member.user.id}>\n`);
            if (player.selection === Selection.all || (player.selection === Selection.others && receiver !== player) || (player.selection === Selection.self && receiver === player)) buttons.push({
                emoji: receiver.emoji,
                run: async () => {
                    if (isUndefined(player.input)) return console.error("CycleNight: Player.input is not defined");
                    if ((player.selection === Selection.others && player === receiver) ||
                        player.selection === Selection.self && player !== receiver) return console.error(`CycleNight: ${player.user.username} targeted ${member.user.username} when they should not have been able to.`);
                    player.setTarget(receiver);
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
        if (player.name === "doctor" && player.useLimit) {
            player.input!.send("You have 1 self-heal remaining.");
        }
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
    const message = await game.chat!.send(nightEmbed()) as Discord.Message;
    counter -= 5;
    const countdown = setInterval(() => {
        message.edit(nightEmbed())
        if (counter === 0) {
            clearInterval(countdown);
            ProcessNight(game)
        } else counter -= 5;
    }, 5000);
}

async function ProcessNight(game: Game) {
    const client = require('../../../index.ts')

    if (isNull(game.chat)) return;

        client.handler.removeMenu(game.activeMenuIds.get(ActiveMenu.Night));
        const message = await game.chat.send('Processing the night...') as Discord.Message;
        game.chat.startTyping();
        let process = 0;
        game.actions.forEach((player, index, array) => {
            client.handler.removeMenu(player.activeMenuId);
            if (player.alive) player.action(game);
            if (index + 1 === array.length) process++;
        })
        
        const reset = setInterval(() => {
            if (process === 1) {
                clearInterval(reset);
                game.actions.forEach((player, index, array) => {
                    player.visited = [];
                    player.blocked = [];
                    player.healed = [];
                    player.jailed = false;
                    player.target = null;
                    if (index + 1 === array.length) process++;
                })}
        })
        const route = setInterval(() => {
            if (process === 2) {
                clearInterval(route);
                game.counter++;
                game.chat!.stopTyping(true);
                message.delete();
                CycleDeaths(game);
            }
        }, 1000);
}