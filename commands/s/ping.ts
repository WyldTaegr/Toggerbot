const { id } = require('../../config.json');

import { Command } from "../../index";

module.exports = new Command({
    name: 'ping',
    aliases: undefined,
    description: 'Ping!',
    usage: "`s" + id + "ping",
    guildOnly: false,
    cooldown: 2,
    args: false,
    execute(message) {
        message.channel.send('Pong!');
    }
});