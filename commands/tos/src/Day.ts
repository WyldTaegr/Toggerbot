import { Stage, Game, ActiveMenu } from "./game";
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
    let embed: Discord.RichEmbed = new Discord.RichEmbed()
        .setColor('#ff0000')
    switch (death.killers) {
        case 1:
            embed.setTitle(`${player.user.username} was killed last night.`);
            break;
        case 2:
            embed.setTitle(`${player.user.username} was brutally murdered last night.`)
            break;
        default:
            embed.setTitle(`${player.user.username} was slaughtered last night.`)
    }
    let message: Discord.Message = await game.announcements!.send(embed) as Discord.Message;
    embed.setDescription(death.cause);
    let timer = 3000;
    setTimeout(async () => {
        message = await message.edit(embed);
        embed.setColor(player.view.color);
    }, timer);
    
    
    timer += 3000;
    if (!player.will) {
        setTimeout(() => game.announcements!.send('We could not find a last will.'), timer)
    } else {
        setTimeout(() => {
            if (!game.announcements) return console.error('CycleDeaths: game.announcements is not defined when describing a will')
            game.announcements.send('We found a will next to their body.')
            game.announcements.send(player.will);
        }, timer)
    }

    if (death.deathNotes.length !== 0) {
        timer += 3000;
        setTimeout(() => {
            game.announcements!.send('We found a death note next to their body.')
            death.deathNotes.forEach(deathNote => game.announcements!.send(deathNote));
        }, timer)
    }

    timer += 3000;
    const role = player.name.charAt(0).toUpperCase() + player.name.slice(1);
    setTimeout(() => {
        game.announcements!.send(`<@${player.user.id}>'s role was ${"`" + role + "`"}.`);
        message.edit(embed)
    }, timer)
}

export async function CycleDeaths(game: Game) {
    game.stage = Stage.Deaths;
    if (game.deaths.size === 0) return CycleDiscussion(game);
    const embed = new Discord.RichEmbed()
        .setTitle(`Day ${game.counter}`)
        .attachFile(day)
        .setThumbnail('attachment://day.png')
        .setColor('#ffff00')
        .setTimestamp();
    game.announcements!.send(embed)
    const deaths = game.deaths.keys()
    let result = deaths.next()
    setTimeout(() => {
        DisplayDeath(result.value, game);
        result = deaths.next();
        const displayDeaths = setInterval(() => {
            if (result.done) {
                clearInterval(displayDeaths)
                CycleDiscussion(game)
            } else {
                DisplayDeath(result.value, game);
                result = deaths.next();
            }
    }, 15000)}, 3000)
}

async function CycleDiscussion(game: Game) {
    if (!game.announcements) return console.error("Discussion stage: announcements channel not defined");

    game.stage = Stage.Discussion;
    let counter = 30;
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
    const discussion = await game.announcements.send(discussionEmbed()) as Discord.Message;
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

    if (isNull(game.announcements)) return;
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
                if (!game.announcements) return console.error("CycleVoting: game.announcements is undefined");

                if (agent.vote == receiver) { //Player selected the person he was already voting for
                    agent.vote = null;
                    receiver.votes -= 1;
                    game.announcements.send(`<@${user.id}> is no longer voting for <@${member.user.id}>.`);
                } else if (agent == receiver) { //Player selected himself
                    game.announcements.send(`<@${user.id}> just tried to vote for themselves, what a moron!`).then(message => setTimeout(() => (message as Discord.Message).delete() , 3000));
                } else if(agent.vote == null) { //Player selecting new person, not already voting
                    agent.vote = receiver;
                    receiver.votes += 1;
                    game.announcements.send(`<@${user.id}> has voted for <@${member.user.id}>!`);
                    if (receiver.votes >= game.alive.length / 2) {
                        game.suspect = receiver;
                        game.route()
                    }
                } else { //Player selecting a new person, already voting for a different person
                    const oldVote = agent.vote;
                    oldVote.votes -= 1;
                    agent.vote = receiver;
                    receiver.votes += 1;
                    game.announcements!.send(`<@${user.id}> has changed his vote to <@${member.user.id}>!`);
                    if (receiver.votes >= game.alive.length / 2) {
                        game.suspect = receiver;
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
            .setDescription(`Vote for someone to lynch! ${counter > 0 ? "(" + counter + ")" : ""}`)
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
    const vote = await game.announcements.sendMenu(message);
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