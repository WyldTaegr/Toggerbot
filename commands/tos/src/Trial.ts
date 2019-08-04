import { Stage, Game, ActiveMenu, RoleName, findRole } from "./game";

import { isUndefined, isNull } from "../../../utils";

import Discord from 'discord.js';
//@ts-ignore
import { Menu } from 'reaction-core';
import { GameClient } from "../../..";
import { CycleDeaths } from "./Day";

const logo = new Discord.Attachment('images/tos/logo.png', "logo.png")

export async function CycleDefense(game: Game) {
    if (!game.chat) return console.error("CycleDefense: game.chat is null");
    if (!game.suspect) return console.error("CycleDefense: game.suspect is null [1]");
    game.stage = Stage.Defense;
    game.chat.overwritePermissions(game.role!, {"SEND_MESSAGES": false});
    game.chat.overwritePermissions(game.suspect.user, {"SEND_MESSAGES": true})
    let counter = 20;
    function defenseEmbed() {
        if (!game.suspect) return console.error("CycleDefense: game.suspect is null [2]")
        const embed = new Discord.RichEmbed()
            .setTitle(`The Town has decided to put **${game.suspect.user.username}** on trial.`)
            .setColor("#ffff00")
            .attachFile(logo)
            .setThumbnail("attachment://logo.png")
            .setDescription(`${game.suspect.user.username}, you are on trial for conspiracy against the town.\n**What is your defense?**`)
        if (counter) embed.setFooter(`Judgement begins in ${counter} seconds.`)
        return embed;
    }
    const message = await game.chat.send(defenseEmbed()) as Discord.Message;
    counter -= 5;
    const countdown = setInterval(() => {
        message.edit(defenseEmbed());
        if (!counter) {
            clearInterval(countdown);
            CycleJudgement(game);
        } else counter -= 5;
    }, 5000)
}

async function CycleJudgement(game: Game) {
    const client: GameClient = require("../../../index");
    game.stage = Stage.Judgement;
    if (!game.chat) return console.error("CycleJudgement: game.chat is null");
    if (!game.suspect) return console.error("CycleJudgement: game.suspect is null");
    game.chat.overwritePermissions(game.role!, {"SEND_MESSAGES" : true});
    //@ts-ignore
    game.chat.overwritePermissions(game.suspect.user, {"SEND_MESSAGES": null, "ADD_REACTIONS": false});
    game.resetVotes();
    function judgementEmbed() {
        const embed = new Discord.RichEmbed()
            .setTitle(`The Town may now vote on the fate of **${game.suspect!.user.username}**.`)
            .setColor("#ff0000")
            .attachFile(logo)
            .setThumbnail("attachment://logo.png")
            .setDescription('💀 - Guilty \n ❎ - Innocent');
        if (counter) embed.setFooter(`Judgement: ${counter} seconds left`);
        return embed;
    }
    const buttons: Object[] = [
        {
            emoji: '💀',
            run: async (user: Discord.User, message: Discord.Message) => {
                if (user === game.suspect!.user) return;
                const agentMember = message.guild.members.get(user.id);
                if (isUndefined(agentMember)) return console.error("CycleJudgement: someone not in the guild voted guilty on a trial");
                const agent = game.assignments.get(agentMember);
                if (isUndefined(agent)) return console.error(`CycleJudgement: ${agentMember.user.username} voted guilty but has no assigned player object`);
                if (!game.chat) return console.error("CycleJudgement: game.chat is null [1]");
                if (!agent.alive) return console.error(`CycleJudgement: ${agent.user.username} voted guilty as a dead man`);
                if (game.guiltyVote.includes(agent)) {
                    game.guiltyVote.splice(game.guiltyVote.findIndex(player => player === agent), 1)
                    agent.abstain = true;
                    game.chat.send(`<@${agent.user.id}> has canceled their vote.`)
                } else if (game.innocentVote.includes(agent)) {
                    game.innocentVote.splice(game.innocentVote.findIndex(player => player === agent), 1);
                    game.guiltyVote.push(agent);
                    game.chat.send(`<@${agent.user.id}> has changed their vote.`);
                } else {
                    agent.abstain = false;
                    game.guiltyVote.push(agent);
                    game.chat.send(`<@${agent.user.id}> has voted.`);
                }
            }
        },
        {
            emoji: '❎',
            run: async (user: Discord.User, message: Discord.Message) => {
                if (user === game.suspect!.user) return;
                const agentMember = message.guild.members.get(user.id);
                if (isUndefined(agentMember)) return console.error("CycleJudgement: someone not in the guild voted innocent on a trial");
                const agent = game.assignments.get(agentMember);
                if (isUndefined(agent)) return console.error(`CycleJudgement: ${agentMember.user.username} voted innocent but has no assigned player object`);
                if (!game.chat) return console.error("CycleJudgement: game.chat is null [2]")
                if (!agent.alive) return console.error(`CycleJudgement: ${agent.user.username} voted innocent as a dead man`);
                if (game.innocentVote.includes(agent)) {
                    game.innocentVote.splice(game.innocentVote.findIndex(player => player === agent), 1);
                    agent.abstain = true;
                    game.chat.send(`<@${agent.user.id}> has canceled their vote.`);
                } else if (game.guiltyVote.includes(agent)) {
                    game.guiltyVote.splice(game.guiltyVote.findIndex(player => player === agent), 1);
                    game.innocentVote.push(agent);
                    game.chat.send(`<@${agent.user.id}> has changed their vote.`);
                } else {
                    agent.abstain = false;
                    game.innocentVote.push(agent);
                    game.chat.send(`<@${agent.user.id}> has voted.`);
                }
            }
        },
    ]
    let counter = 20;
    const message = new Menu(judgementEmbed(), buttons);
    client.handler.addMenus(message);
    //@ts-ignore
    const judgement = await game.chat.sendMenu(message);
    game.activeMenuIds.set(ActiveMenu.Vote, judgement.id);
    counter -= 5;
    const countdown = setInterval(() => {
        judgement.edit(judgementEmbed())
        if (!counter) {
            clearInterval(countdown);
            ProcessTrial(game);
        } else counter -= 5;
    }, 5000)
}

function ProcessTrial(game: Game) {
    const client: GameClient = require('../../../index.ts');
    client.handler.removeMenu(game.activeMenuIds.get(ActiveMenu.Vote));
    const guiltyList = game.guiltyVote.map(player => player.user);
    const innocentList = game.innocentVote.map(player => player.user);
    const abstainedList = game.players.filter(member => {
        const player = game.assignments.get(member)
        return player!.abstain && player !== game.suspect;
    }).map(member => member.user);
    function convertToString(list: Discord.User[]) {
        let string = '';
        list.forEach(user => {
            string = string.concat(user.username, '\n');
        })
        return string;
    }
    if (!game.chat) return console.error("ProcessTrial: game.chat is null");
    if (!game.suspect) return console.error("ProcessTrial: game.suspect is null");
    if (game.guiltyVote.length > game.innocentVote.length) {
        const embed = new Discord.RichEmbed()
            .setTitle(`The Town has voted ${game.suspect.user.username} guilty, ${game.guiltyVote.length} to ${game.innocentVote.length}`)
            .setColor('#ffff00')
            .addField("Those who voted guilty:", convertToString(guiltyList) || "None", true)
            .addField("Those who voted innocent:", convertToString(innocentList) || "None", true)
            .addField("Those who abstained:", convertToString(abstainedList) || "None", true);
        game.chat.send(embed);
        game.resetVotes();
        game.stage = Stage.Lynch;
        game.suspect.kill(
            game, 
            "You have died!",
            {
                cause: "",
                killers: 0,
                deathNotes: []
            }
        )
        game.suspect = null;
        CycleDeaths(game);
    } else {
        const embed = new Discord.RichEmbed()
            .setTitle(`The Town has voted ${game.suspect.user.username} innocent, ${game.innocentVote.length} to ${game.guiltyVote.length}`)
            .setColor('#ffff00')
            .addField("Those who voted guilty:", convertToString(guiltyList) || "None", true)
            .addField("Those who voted innocent:", convertToString(innocentList) || "None", true)
            .addField("Those who abstained:", convertToString(abstainedList) || "None", true);
        game.chat.send(embed);
        //@ts-ignore
        game.chat.overwritePermissions(game.suspect.user, {"ADD_REACTIONS": null})
        game.suspect = null;
        game.resetVotes();
        game.trials--;
        game.route();
    }
}
function guilty(game: Game) { //FINISH THIS
    if (!game.chat) return console.error("guilty: game.chat is null [1]");
    if (!game.suspect) return console.error("guilty: game.suspect is null [1]");
    game.stage = Stage.Lynch;
    game.chat.overwritePermissions(game.role!, {"SEND_MESSAGES": false});
    game.chat.overwritePermissions(game.suspect.user, {"SEND_MESSAGES": true})
    setTimeout(() => game.chat!.send("Do you have any last words?"), 1000)
    setTimeout(() => {
        if (!game.chat) return console.error("guilty: game.chat is null [2]");
        if (!game.suspect) return console.error("guilty: game.suspect is null [2]")
        game.chat!.overwritePermissions(game.suspect.user, {"SEND_MESSAGES": false, "ADD_REACTIONS": false});
        game.mafia!.overwritePermissions(game.suspect.user, {"SEND_MESSAGES": false, "ADD_REACTIONS": false});
        game.graveyard!.overwritePermissions(game.suspect.user, {"VIEW_CHANNEL": true, "SEND_MESSAGES": true, "READ_MESSAGE_HISTORY": true})
        game.chat.send(`May God have mercy on your soul, **${game.suspect.user.username}**.`)
    }, 6000)
    setTimeout(async () => {
        if (!game.chat) return console.error("guilty: game.chat is null [3]");
        if (!game.suspect) return console.error("guilty: game.suspect is null [3]");
        const embed = new Discord.RichEmbed()
            .setTitle(`${game.suspect.user.username} has died.`)
            .setColor("#ff0000")
        const message = await game.chat.send(embed) as Discord.Message;
        setTimeout(() => {
            if (!game.chat) return console.error("guilty: game.chat is null [4]");
            if (!game.suspect) return console.error("guilty: game.suspect is null [4]");
            if (game.suspect.will) {
                game.chat.send("We found a will next to their body.");
                game.chat.send(game.suspect.will);
            } else {
                game.chat.send("We could not find a last will.")
            }
        }, 3000)
        setTimeout(() => {
            if (!game.chat) return console.error("guilty: game.chat is null [5]");
            if (!game.suspect) return console.error("guilty: game.suspect is null [5]");
            const role = findRole(game.suspect.name);
            embed.setColor(game.suspect.view.color);
            message.edit(embed);
            game.chat.send(`<@${game.suspect.user.id}>'s role was ${"`" + role + "`"}`)
            game.route();
        }, 6000)
    }, 8000)
}