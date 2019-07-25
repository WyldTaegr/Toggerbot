const { id } = require('../../config.json');

import Discord from 'discord.js';
import { Command } from '../../index';
import { Game, Stage } from './src/game';
import { initializeGame } from "./src/Initial";

module.exports = new Command({
    name: "tos",
    aliases: ['game', 'setup'],
    description: `Setup a game of Town Of Salem, with you as the moderator.`,
    usage: '`tos' + id + 'tos`',
    cooldown: 10,
    guildOnly: true,
    requireArgs: false,
    execute(message: Discord.Message) {
        const client = require("../../index.ts");
        const game: Game = client.games.get(message.guild.id);

        if (message.guild === client.guild) return message.reply("Can't root a game from the developmet server!");

        if (game.stage !== Stage.Ended) return message.reply("Stop being a sore-ass loser");
        //@ts-ignore
        if (message.author.partOfTos && message.author.partOfTos != message.guild.id) return message.reply("You're already part of a game on a different server!");

        game.origin = message.channel as Discord.TextChannel;
        game.stage = Stage.Setup;
        game.moderator = message.author
        
        initializeGame(message, game);
        
    }
})