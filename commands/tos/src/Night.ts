import Discord from "discord.js";
import { Game, Stage } from "./game";
import { shuffle, isNull } from "../../../utils";
import { isUndefined, emojis as _emojis } from "../../../utils";
//@ts-ignore
import { Menu } from 'reaction-core';
import { CycleDay } from "./Day";

export function CycleNight(game: Game) {
  const client = require('../../../index.ts')
  game.stage = Stage.Night;
  const buttons: Object[] = [];
  
  const playerList = game.alive;

  let playerSelection = '';

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
              const { View } = require(`../roles/${agent.name}`);
              const failureReason = agent.checkSelection(receiver);
              if (failureReason) return dm.send(failureReason);
              agent.target = member; //Used to keep track of whether the person has already selected a target
              const embed = new Discord.RichEmbed()
                  .setTitle(`You have targeted *${member.nickname || member.user.username}* for tonight.`)
                  .setColor(View.color)
                  .setThumbnail(View.pictureUrl);
              dm.send(embed);
          }
      })
  })

  const embed = new Discord.RichEmbed()
      .setTitle(`${game.stage} ${game.counter}`)
      .setDescription('You have 30 seconds to do something.')
      .setColor('#ffff00')
      .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
      .addField('Alive:', playerSelection)
      .setFooter('Set your target for tonight by reacting below');
  const message = new Menu(embed, buttons);
  client.handler.addMenus(message);
  // @ts-ignore
  game.announcements.sendMenu(message).then(message => game.activeMenuId = message.id);

  setTimeout(() => {
      ProcessNight(game);
  }, 30000);
}

export function ProcessNight(game: Game) {
    const client = require('../../../index.ts')

    if (isNull(game.announcements)) return;

    game.stage = Stage.Processing;
        client.handler.removeMenu(game.activeMenuId);
        game.announcements.send('Processing the night...');
        game.announcements.startTyping();
        game.players.forEach((member) => {
            const player = game.assignments.get(member);
            if (player && !isNull(player.target)) {
                const priority = player.priority - 1; //Subtract 1 for array indexing!
                const target = game.assignments.get(player.target);
                if (isUndefined(target)) return;
                game.actions[priority].push({
                    agent: player, 
                    receiver: target && target,
                });
                player.target = null; //clean-up for next cycle
            }
        })
        for (const priority of game.actions) {
            for (const action of priority) {
                if (action.agent.checkAction()) action.agent.action(action);
            }
        }
        game.announcements.stopTyping(true);
        CycleDay(game);
}