const { id } = require('../../config.json');

import { Command } from '../../index';

module.exports = new Command({
    name: 'poke',
    aliases: undefined,
    description: 'Poke somebody',
    usage: "`s" + id + "poke [User Mention]",
    guildOnly: false,
    cooldown: 2,
    args: false,
    execute(message) {
        if (!message.mentions.users.size) {
            message.author.send('You touched yourself.');
        }
        
        message.mentions.users.map(user => {
            user.send('Somebody touched you.');
            console.log(`${message.author.username} touched ${user.username}`)
        });
    }
})