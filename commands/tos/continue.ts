const { id } = require('../../config.json');

import Discord from 'discord.js';
import { Command, GameClient } from '../../index';
import { isUndefined } from '../../utils';
import { Stage } from './src/game';
import { ProcessTrial } from './src/Trial';
import { CycleNight } from './src/Night';

module.exports = new Command ({
    name: 'continue',
    aliases: ['c'],
    description: 'As the moderator, either conclude a trial or proceed into the next night.',
    usage: '`tos' + id + 'continue`',
    guildOnly: true,
    cooldown: 6,
    requireArgs: false,
    execute(message: Discord.Message) {
      const client: GameClient = require("../../index.ts");
      const game = client.games.get(message.guild.id);
      if (isUndefined(game)) return;

      if (game.stage = Stage.Ended) return message.reply('Setup a game first!');
      if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');
      if (message.author != game.moderator) return message.reply("Ask the guy in charge");
      if (game.stage == Stage.Trial) return ProcessTrial(game);
      else if (game.stage == Stage.Day) return CycleNight(game);
      else return message.reply("Water you trying to continue?");
    }
  })