import { Stage, Game, ActiveMenu } from "./game";

import { isUndefined } from "../../../utils";

import Discord from 'discord.js';
//@ts-ignore
import { Menu } from 'reaction-core';
import { CycleNight } from "./Night";
import { CycleVoting } from "./Day";

export function CycleTrial(game: Game) {
    game.stage = Stage.Trial;
    game.resetVotes();
    const trial = new Discord.RichEmbed()
        .setTitle(`<@${game.suspect!.user.id}> is on trial`)
        .addField('Is he guilty or innocent?','☠️ - Guilty \n ❎ - Innocent \n ⬜️ - Abstain');
    const buttons = [
        {
            emoji: '☠️',
            run: async (user: Discord.User, message: Discord.Message) => {
                const agentMember = message.guild.members.get(user.id);
                if (isUndefined(agentMember)) return console.error("CycleTrial: someone not in the guild voted guilty on a trial");
                const agent = game.assignments.get(agentMember);
                if (isUndefined(agent)) return console.error(`CycleTrial: ${agentMember.user.username} voted guilty but has no assigned player object`);
                if (!agent.alive) return console.error(`CycleTrial: ${agent.user.username} voted guilty as a dead man`);
                if (!agent.input) return console.error(`CycleTrial: ${agentMember.user.username}'s player object has no input channel`)
                if (game.guiltyVote.includes(agent)) return agent.input.send('You have already voted guilty.');
                if (game.innocentVote.includes(agent)) {
                    game.innocentVote.splice(game.innocentVote.findIndex(player => player == agent), 1);
                    game.guiltyVote.push(agent);
                    agent.input.send("You have changed your vote to guilty.");
                    game.chat!.send(`${agent.user.username} has changed their vote.`);
                } else if (agent.votes) { //_Player.votes used to mark a player as abstaining
                    agent.votes = 0;
                    game.guiltyVote.push(agent);
                    agent.input.send('You have changed your vote to guilty.');
                    game.chat!.send(`${agent.user.username} has changed their vote.`);
                } else {
                    game.guiltyVote.push(agent);
                    agent.input.send('You have voted guilty.');
                    game.chat!.send(`${agent.user.username} has voted.`);
                }
            }
        },
        {
            emoji: '❎',
            run: async (user: Discord.User, message: Discord.Message) => {
                const agentMember = message.guild.members.get(user.id);
                if (isUndefined(agentMember)) return console.error("CycleTrial: someone not in the guild voted innocent on a trial");
                const agent = game.assignments.get(agentMember);
                if (isUndefined(agent)) return console.error(`CycleTrial: ${agentMember.user.username} voted innocent but has no assigned player object`);
                if (!agent.alive) return console.error(`CycleTrial: ${agent.user.username} voted innocent as a dead man`);
                if (!agent.input) return console.error(`CycleTrial: ${agentMember.user.username}'s player object has no input channel`);
                if (game.innocentVote.includes(agent)) return agent.input.send('You have already voted innocent.');
                if (game.guiltyVote.includes(agent)) {
                    game.guiltyVote.splice(game.guiltyVote.findIndex(player => player == agent), 1);
                    game.innocentVote.push(agent);
                    agent.input.send("You have changed your vote to innocent.");
                    game.chat!.send(`${agent.user.username} has changed their vote.`);
                } else if (agent.votes) {
                    agent.votes = 0;
                    game.innocentVote.push(agent);
                    agent.input.send('You have changed your vote to innocent.');
                    game.chat!.send(`${agent.user.username} has changed their vote.`);
                } else {
                    game.innocentVote.push(agent);
                    agent.input.send('You have voted innocent.');
                    game.chat!.send(`${agent.user.username} has voted.`);
                }
            }
        },
        {
            emoji: '⬜️',
            run: async (user: Discord.User, message: Discord.Message) => {
                const agentMember = message.guild.members.get(user.id);
                if (isUndefined(agentMember)) return console.error("CycleTrial: someone not in the guild abstained on a trial");
                const agent = game.assignments.get(agentMember);
                if (isUndefined(agent)) return console.error(`CycleTrial: ${agentMember.user.username} voted innocent but has no assigned player object`);
                if (!agent.alive) console.error(`CycleTrial: ${agent.user.username} abstained as a dead man`);
                if (!agent.input) return console.error(`CycleTrial: ${agentMember.user.username}'s player object has no input channel`);
                if (agent.votes) return agent.input.send('You have already abstained.');
                if (game.guiltyVote.includes(agent)) {
                    game.guiltyVote.splice(game.guiltyVote.findIndex(player => player == agent), 1);
                    agent.votes = 1;
                    agent.input.send("You have abstained.");
                    game.chat!.send(`${agent.user.username} has changed their vote.`);
                } else if (game.innocentVote.includes(agent)) {
                    game.innocentVote.splice(game.innocentVote.findIndex(player => player == agent), 1);
                    agent.votes = 1;
                    agent.input.send('You have abstained.');
                    game.chat!.send(`${agent.user.username} has changed their vote.`)
                } else {
                    agent.votes = 1;
                    agent.input.send('You have abstained.');
                    game.chat!.send(`${agent.user.username} has voted.`);
                }
            }
        }
    ]
    const message = new Menu(trial, buttons);
    //@ts-ignore
    game.chat.sendMenu(message).then(message => game.activeMenuIds.set(ActiveMenu.Vote));
}

export function ProcessTrial(game: Game) {
  const client = require('../../../index.ts');
  game.stage = Stage.Processing;
  client.hander.removeMenu(game.activeMenuIds.get(ActiveMenu.Vote));
  const guiltyList = game.guiltyVote.map(player => player.user);
  const innocentList = game.innocentVote.map(player => player.user);
  const abstainedList = game.players.filter(member => !guiltyList.includes(member.user) && !innocentList.includes(member.user)).map(member => member.user);
  function convertToString(list: Discord.User[]) {
      let string = '';
      list.forEach(user => {
          string = string.concat(user.username, '\n');
      })
      return string;
  }
  if (game.guiltyVote.length > game.innocentVote.length) {
      game.suspect!.alive = false;
      const embed = new Discord.RichEmbed()
          .setTitle(`The Town has voted ${game.suspect!.user.username} guilty, ${game.guiltyVote.length} to ${game.innocentVote.length}`)
          .setColor('#ffff00')
          .addField("Those who voted guilty:", convertToString(guiltyList))
          .addField("Those who voted innocent:", convertToString(innocentList))
          .addField("Those who abstained:", convertToString(abstainedList));
      game.chat!.send(embed);
      game.resetVotes();
      //FINISH guilty death announcement
      game.suspect = null;
      CycleNight(game);
  } else {
      const embed = new Discord.RichEmbed()
          .setTitle(`The Town has voted ${game.suspect!.user.username} innocent, ${game.innocentVote.length} to ${game.guiltyVote.length}`)
          .setColor('#ffff00')
          .addField("Those who voted guilty:", convertToString(guiltyList))
          .addField("Those who voted innocent:", convertToString(innocentList))
          .addField("Those who abstained:", convertToString(abstainedList));
      game.chat!.send(embed);
      game.suspect = null;
      game.resetVotes();
      CycleVoting(game);
  }
}