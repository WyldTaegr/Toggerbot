const Discord = require('discord.js');

module.exports = {
    name: 'poke',
    description: 'Poke somebody',
    execute(message) {
        if (!message.mentions.users.size) {
            message.author.send('You touched yourself.');
        }
        
        message.mentions.users.map(user => {
            user.send('Somebody touched you.');
            console.log(`${message.author.username} touched ${user.username}`)
        });
    }
}