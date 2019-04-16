const { id } = require('../../config.json');

import { Command } from "../../index";
import Discord from 'discord.js';

module.exports = new Command({
    name: 'ping',
    aliases: undefined,
    description: 'Ping!',
    usage: "`s" + id + "ping",
    guildOnly: false,
    cooldown: 2,
    args: false,
    execute(message: Discord.Message) {
        message.channel.send('Pong!');
    }
});