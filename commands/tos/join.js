module.exports = {
    name: "join",
    aliases: ['enter'],
    description: 'Join the Town Of Salem Game on the server, if there is one',
    cooldown: 3,
    guildOnly: true,
    execute(message) {
        const client = require('../../index.js');
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.reply('Start a game first!');
        if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');
        if (game.stage != 'setup') return message.channel.send(`Oops, you're too late, ${message.member.nickname || message.author.username}!`);
        if (game.players.includes(message.member)) return message.reply("You're already in the game!");
        if (message.author.partOfTos) return message.reply('You are part of a game of Town Of Salem on a different server!');

        game.players.push(message.member);
        message.author.partOfTos = message.guild.id;
        message.channel.send(`${message.member.nickname || message.author.username} has joined the game`)
        
    }
}