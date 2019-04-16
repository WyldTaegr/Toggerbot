const { id } = require('../../config.json');

import { Command } from '../../index';
import Discord from 'discord.js';

module.exports = new Command({
    name: 'poke',
    aliases: undefined,
    description: 'Poke somebody',
    usage: "`s" + id + "poke [User Mention]",
    guildOnly: false,
    cooldown: 2,
    args: false,
    execute(message: Discord.Message) {
        if (!message.mentions.users.size) {
            message.author.send('You touched yourself.');
        }
        
        message.mentions.users.map((user: Discord.User) => {
            user.send('Somebody touched you.');
            console.log(`${message.author.username} touched ${user.username}`)
        });
    }
})