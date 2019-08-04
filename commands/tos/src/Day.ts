import { Stage, Game, ActiveMenu, findRole } from "./game";
import { isUndefined, isNull } from "../../../utils";
import Discord from 'discord.js';
//@ts-ignore
import { Menu } from "reaction-core";
import { _Player } from "./player";

const day = new Discord.Attachment('images/tos/day.png')

async function DisplayDeath(player: _Player, game: Game) {
    const death = game.deaths.get(player);
    if (!death) return console.error(`CycleDeaths: ${player.user.username} was passed as killed but has no assigned death object`);
    game.deaths.delete(player);
    const embed: Discord.RichEmbed = new Discord.RichEmbed()
        .setColor('#ff0000')
    switch (death.killers) {
        case 0:
            embed.setTitle(`${player.user.username} has died.`);
        case 1:
            embed.setTitle(`${player.user.username} was killed last night.`);
            break;
        case 2:
            embed.setTitle(`${player.user.username} was brutally murdered last night.`)
            break;
        default:
            embed.setTitle(`${player.user.username} was slaughtered last night.`)
    }
    let message: Discord.Message = await game.chat!.send(embed) as Discord.Message;
    let timer = 0
    if (death.cause) {
        embed.setDescription(death.cause);
        timer += 3000;
        setTimeout(async () => {
            message = await message.edit(embed);
            embed.setColor(player.view.color);
        }, timer);
    }
    
    timer += 3000;
    if (!player.will) {
        setTimeout(() => game.chat!.send('We could not find a last will.'), timer)
    } else {
        setTimeout(() => {
            if (!game.chat) return console.error('CycleDeaths: game.chat is not defined when describing a will')
            game.chat.send('We found a will next to their body.')
            game.chat.send(player.will);
        }, timer)
    }

    if (death.deathNotes.length !== 0) {
        timer += 3000;
        setTimeout(() => {
            game.chat!.send('We found a death note next to their body.')
            death.deathNotes.forEach(deathNote => game.chat!.send(deathNote));
        }, timer)
    }

    timer += 3000;
    const role = findRole(player.name);
    setTimeout(() => {
        game.chat!.send(`<@${player.user.id}>'s role was ${"`" + role + "`"}.`);
        message.edit(embed)
    }, timer)
}

export async function CycleDeaths(game: Game) {
    if (game.deaths.size === 0) return CycleDiscussion(game);
    if (game.stage === Stage.Night) {
        const embed = new Discord.RichEmbed()
            .setTitle(`Day ${game.counter}`)
            .attachFile(day)
            .setThumbnail('attachment://day.png')
            .setColor('#ffff00')
            .setTimestamp();
        game.chat!.send(embed)
    }
    const deaths = game.deaths.keys()
    let result = deaths.next()
    setTimeout(() => {
        DisplayDeath(result.value, game);
        result = deaths.next();
        const displayDeaths = setInterval(() => {
            if (result.done) {
                clearInterval(displayDeaths)
                game.trials = 3;
                game.route();
            } else {
                DisplayDeath(result.value, game);
                result = deaths.next();
            }
    }, 15000)}, 3000)
}

export async function CycleDiscussion(game: Game) {
    if (!game.chat) return console.error("CycleDiscussion: game.chat not defined");

    game.stage = Stage.Discussion;
    let counter = 45;
    function discussionEmbed() {
        const embed = new Discord.RichEmbed()
            .setTitle(`Day ${game.counter}`)
            .attachFile(day)
            .setThumbnail('attachment://day.png')
            .setColor('#ffff00')
            .setDescription('Discussion');
        if (counter > 0) embed.setFooter(`Voting begins in ${counter} seconds.`);
        return embed;
    }
    const discussion = await game.chat.send(discussionEmbed()) as Discord.Message;
    counter -= 5;
    const countdown = setInterval(() => {
        discussion.edit(discussionEmbed());
        if (counter === 0) {
            clearInterval(countdown);
            CycleVoting(game);
        } else {
            counter -= 5;
        }
    }, 5000)
}

export async function CycleVoting(game: Game) {
    const client = require('../../../index.ts');

    if (isNull(game.chat)) return;
    game.stage = Stage.Voting;

    //Voting Selection
    const buttons: Object[] = [];
    const playerList = game.alive;

    playerList.forEach((member) => {
        const player = game.assignments.get(member);
        if (!player) return console.error("CycleVoting: Member has no assigned player");
        buttons.push({
            emoji: player.emoji,
            run: async (user: Discord.User, message: Discord.Message) => {
                const agentMember = message.guild.members.get(user.id);
                if (isUndefined(agentMember)) return;
                const agent = game.assignments.get(agentMember);
                if (isUndefined(agent)) return;
                if (!agent.alive) return console.error(`CycleVoting: ${user.username} voted in the trial as a dead man`)
                const receiver = game.assignments.get(member);
                if (isUndefined(receiver)) return console.error(`CycleVoting: ${member.user.username} has no assigned player object`);
                if (!game.chat) return console.error("CycleVoting: game.chat is undefined");

                if (agent.vote == receiver) { //Player selected the person he was already voting for
                    agent.vote = null;
                    receiver.votes -= 1;
                    game.chat.send(`<@${user.id}> is no longer voting for <@${member.user.id}>.`);
                } else if (agent == receiver) { //Player selected himself
                    game.chat.send(`<@${user.id}> just tried to vote for themselves, what a moron!`).then(message => setTimeout(() => (message as Discord.Message).delete() , 3000));
                } else if(agent.vote == null) { //Player selecting new person, not already voting
                    agent.vote = receiver;
                    receiver.votes += 1;
                    game.chat.send(`<@${user.id}> has voted for <@${member.user.id}>!`);
                    if (receiver.votes >= game.alive.length / 2) {
                        game.suspect = receiver;
                        vote.edit(voteEmbed());
                        clearInterval(countdown);
                        game.route()
                    }
                } else { //Player selecting a new person, already voting for a different person
                    const oldVote = agent.vote;
                    oldVote.votes -= 1;
                    agent.vote = receiver;
                    receiver.votes += 1;
                    game.chat!.send(`<@${user.id}> has changed his vote to <@${member.user.id}>!`);
                    if (receiver.votes >= game.alive.length / 2) {
                        game.suspect = receiver;
                        vote.edit(voteEmbed());
                        clearInterval(countdown);
                        game.route()
                    }
                }
            }
        })
    })
    function voteEmbed() {
        let playerSelection = "";
        playerList.forEach(member => {
            const player = game.assignments.get(member);
            if (!player) return console.error("CycleVoting: Member has no assigned player");

            playerSelection = playerSelection.concat(player.emoji, ' - ');
            playerSelection = playerSelection.concat(`<@${member.id}> (${player.votes})\n`);
        })
        const embed = new Discord.RichEmbed()
            .setTitle(`Day ${game.counter}`)
            .setDescription(`There ${game.trials > 1 ? "are" : "is"} ${game.trials} trial${game.trials > 1 ? "s" : ""} left today. ${counter > 0 ? "(" + counter + ")" : ""}`)
            .setColor('#ffff00')
            .attachFile(day)
            .setThumbnail('attachment://day.png')
            .addField('Suspects', playerSelection)
            .setFooter('Vote for someone by reacting below');
        return embed;
    }
    
    let counter = 30;

    const message = new Menu(voteEmbed(), buttons);
    client.handler.addMenus(message);
    // @ts-ignore
    const vote = await game.chat.sendMenu(message);
    game.activeMenuIds.set(ActiveMenu.Accuse, vote.id);
    counter -= 5;
    const countdown = setInterval(() => {
        vote.edit(voteEmbed());
        if (counter === 0) {
            clearInterval(countdown);
            game.route();
        } else {
            counter -= 5;
        }
    }, 5000);
}