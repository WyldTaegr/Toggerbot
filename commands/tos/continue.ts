const { id } = require('../../config.json');

import Discord from 'discord.js';
import { Command, GameClient } from '../../index';
import { isUndefined } from '../../utils';
import { Stage } from './src/game';

module.exports = new Command ({
    name: 'continue',
    aliases: ['c'],
    description: 'As the moderator, either conclude a trial or proceed into the next night.',
    usage: '`tos' + id + 'continue`',
    guildOnly: true,
    cooldown: 6,
    args: false,
    execute(message: Discord.Message) {
      const client: GameClient = require("../../index.ts");
      const game = client.games.get(message.guild.id);
      if (isUndefined(game)) return;

      if (!game.running) return message.reply('Setup a game first!');
      if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');
      if (message.member != game.moderator) return message.reply("Ask the faggot in charge");
      if (game.stage == Stage.Trial) return game.processTrial();
      else if (game.stage == Stage.Day) return game.cycleNight();
      else return message.reply("Water you trying to continue?");
    }
  })