module.exports = {
    name: "join",
    aliases: ['enter'],
    description: 'Join the Town Of Salem Game on the server, if there is one',
    cooldown: 10,
    guildOnly: true,
    execute(message) {
        const client = require('../../index.js');
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.reply('Start a game first!');
        if (message.channel != game.botChannel) return message.channel.send('Wrong channel, my dood.');
        if (!game.starting) return message.channel.send(`Oops, you're too late, ${message.member.nickname || message.author.username}!`);
        if (game.players.includes(message.member)) return message.reply("You're already in the game!");

        game.players.push(message.member);
        message.channel.send(`${message.member.nickname || message.author.username} has joined the game`)
        
    }
}