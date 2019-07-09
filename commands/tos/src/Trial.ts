import { Stage, Game } from "./game";

import { isUndefined } from "../../../utils";

import Discord from 'discord.js';
//@ts-ignore
import { Menu } from 'reaction-core';
import { CycleNight } from "./Night";
import { CycleDay } from "./Day";

export function CycleTrial(game: Game) {
  const client = require('../../../index.ts');
  game.stage = Stage.Trial;
  client.hander.removeMenu(game.activeMenuId);
  game.resetVotes();
  const trial = new Discord.RichEmbed()
      .setTitle(`${game.suspect!.user.username} is on trial`)
      .setDescription('Is he guilty or innocent?')
      .addField('','☠️ - Guilty \n ❎ - Innocent \n ⬜️ - Abstain');
  const buttons = [
      {
          emoji: '☠️',
          run: async (user: Discord.User, message: Discord.Message) => {
              const dm = await user.createDM();
              const agentMember = message.guild.members.get(user.id);
              if (isUndefined(agentMember)) return;
              const agent = game.assignments.get(agentMember);
              if (isUndefined(agent)) return;
              if (!agent.alive) return dm.send("You can't vote if you're dead!");
              if (game.guiltyVote.includes(agent)) return dm.send('You have already voted guilty.');
              if (game.innocentVote.includes(agent)) {
                  game.innocentVote.splice(game.innocentVote.findIndex(player => player == agent), 1);
                  game.guiltyVote.push(agent);
                  dm.send("You have changed your vote to guilty.");
                  game.announcements!.send(`${agent.user.username} has changed their vote.`);
              } else if (agent.votes) { //_Player.votes used to mark a player as abstaining
                  agent.votes = 0;
                  game.guiltyVote.push(agent);
                  dm.send('You have changed your vote to guilty.');
                  game.announcements!.send(`${agent.user.username} has changed their vote.`);
              } else {
                  game.guiltyVote.push(agent);
                  dm.send('You have voted guilty.');
                  game.announcements!.send(`${agent.user.username} has voted.`);
              }
          }
      },
      {
          emoji: '❎',
          run: async (user: Discord.User, message: Discord.Message) => {
              const dm = await user.createDM();
              const agentMember = message.guild.members.get(user.id);
              if (isUndefined(agentMember)) return;
              const agent = game.assignments.get(agentMember);
              if (isUndefined(agent)) return;
              if (!agent.alive) return dm.send("You can't vote if you're dead!");
              if (game.innocentVote.includes(agent)) return dm.send('You have already voted innocent.');
              if (game.guiltyVote.includes(agent)) {
                  game.guiltyVote.splice(game.guiltyVote.findIndex(player => player == agent), 1);
                  game.innocentVote.push(agent);
                  dm.send("You have changed your vote to innocent.");
                  game.announcements!.send(`${agent.user.username} has changed their vote.`);
              } else if (agent.votes) {
                  agent.votes = 0;
                  game.innocentVote.push(agent);
                  dm.send('You have changed your vote to innocent.');
                  game.announcements!.send(`${agent.user.username} has changed their vote.`);
              } else {
                  game.innocentVote.push(agent);
                  dm.send('You have voted innocent.');
                  game.announcements!.send(`${agent.user.username} has voted.`);
              }
          }
      },
      {
          emoji: '⬜️',
          run: async (user: Discord.User, message: Discord.Message) => {
              const dm = await user.createDM();
              const agentMember = message.guild.members.get(user.id);
              if (isUndefined(agentMember)) return;
              const agent = game.assignments.get(agentMember);
              if (isUndefined(agent)) return;
              if (!agent.alive) return dm.send("You can't vote if you're dead!");
              if (game.guiltyVote.includes(agent)) {
                  game.guiltyVote.splice(game.guiltyVote.findIndex(player => player == agent), 1);
                  agent.votes = 1;
                  dm.send("You have abstained.");
                  game.announcements!.send(`${agent.user.username} has changed their vote.`);
              } else if (game.innocentVote.includes(agent)) {
                  game.innocentVote.splice(game.innocentVote.findIndex(player => player == agent), 1);
                  agent.votes = 1;
                  dm.send('You have abstained.');
                  game.announcements!.send(`${agent.user.username} has changed their vote.`)
              } else {
                  agent.votes = 1;
                  dm.send('You have abstained.');
                  game.announcements!.send(`${agent.user.username} has voted.`);
              }
          }
      }
  ]
  const message = new Menu(trial, buttons);
  //@ts-ignore
  game.announcements.sendMenu(message).then(message => game.activeMenuId = message.id);
}

export function ProcessTrial(game: Game) {
  const client = require('../../../index.ts');
  game.stage = Stage.Processing;
  client.hander.removeMenu(game.activeMenuId);
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
      game.announcements!.send(embed);
      game.resetVotes();
      game.death(game.suspect!, "", undefined) //FINISH game
      game.suspect = null;
      CycleNight(game);
  } else {
      const embed = new Discord.RichEmbed()
          .setTitle(`The Town has voted ${game.suspect!.user.username} innocent, ${game.innocentVote.length} to ${game.guiltyVote.length}`)
          .setColor('#ffff00')
          .addField("Those who voted guilty:", convertToString(guiltyList))
          .addField("Those who voted innocent:", convertToString(innocentList))
          .addField("Those who abstained:", convertToString(abstainedList));
      game.announcements!.send(embed);
      game.suspect = null;
      game.resetVotes();
      CycleDay(game);
  }
}