import { Stage, Game } from "./game";
import { isUndefined, isNull, shuffle, emojis as _emojis } from "../../../utils";
import Discord from 'discord.js';
//@ts-ignore
import { Menu } from "reaction-core";
import { CycleTrial } from "./Trial";

export function CycleDay(game: Game) {
  const client = require('../../../index.ts');
  game.stage = Stage.Day;

  if (isNull(game.announcements)) return;
  //Day Announcement
  const day = new Discord.RichEmbed()
      .setTitle(`${game.stage} ${game.counter}`)
      .setColor('#ffff00')

  game.announcements.send(day);

  //Voting Selection
  const buttons: Object[] = [];
  const playerList = game.alive;
  let playerSelection = "";
  const emojis = shuffle(_emojis);

  playerList.forEach((member, index) => {
      const emoji = emojis[index];
      playerSelection = playerSelection.concat(emoji, ' - ');

      if (member.nickname) {
          playerSelection = playerSelection.concat(member.nickname, ' or ');
      }
      playerSelection = playerSelection.concat(member.user.username, '\n');
      buttons.push({
          emoji: emoji,
          run: async (user: Discord.User, message: Discord.Message) => {
              const dm = await user.createDM();
              //@ts-ignore
              if (user.partOfTos != message.guild.id) return dm.send("You're not playing.");
              const agentMember = message.guild.members.get(user.id);
              if (isUndefined(agentMember)) return;
              const agent = game.assignments.get(agentMember);
              if (isUndefined(agent)) return;
              if (!agent.alive) return dm.send("You can't vote if you're dead!")
              const receiver = game.assignments.get(member);
              if (isUndefined(receiver)) return;

              if (agent.vote == receiver) { //Player selected the person he was already voting for
                  agent.vote = null;
                  receiver.votes -= 1;
                  game.announcements!.send(`<@${user.id}> is no longer voting for <@${member.user.id}>.`);
              } else if (agent == receiver) { //Player selected himself
                  game.announcements!.send(`<@${user.id}> just tried to vote for themselves, what a moron!`)
              } else if(agent.vote == null) { //Player selecting new person, not already voting
                  agent.vote = receiver;
                  receiver.votes += 1;
                  game.announcements!.send(`<@${user.id}> has voted for <@${member.user.id}>!`);
                  if (receiver.votes >= game.alive.length / 2) {
                      game.suspect = receiver;
                      CycleTrial(game);
                  }
              } else { //Player selecting a new person, already voting for a different person
                  const oldVote = agent.vote;
                  oldVote.votes -= 1;
                  agent.vote = receiver;
                  receiver.votes += 1;
                  game.announcements!.send(`<@${user.id}> has changed his vote to <@${member.user.id}>!`);
                  if (receiver.votes >= game.alive.length / 2) {
                      game.suspect = receiver;
                      CycleTrial(game);
                  }
              }
          }
      })
  })
  const embed = new Discord.RichEmbed()
      .setTitle(`${game.stage} ${game.counter}`)
      .setDescription('Vote for someone to lynch!')
      .setColor('#ffff00')
      .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
      .addField('Suspects', playerSelection)
      .setFooter('Vote for someone by reacting below');
  const message = new Menu(embed, buttons);
  client.handler.addMenus(message);
  // @ts-ignore
  game.announcements.sendMenu(message).then(message => game.activeMenuId = message.id);
}