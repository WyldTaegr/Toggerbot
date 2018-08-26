module.exports = {
    name: "leave",
    description: "Leave the Town Of Salem Game on the server, if you are part of it",
    execute(message) {
        const client = require('../../index.js');
        const game = client.games.get(message.guild.id);
        if (!game.running) return message.channel.send("There's no game to leave.");
        if (message.channel != game.botChannel) return message.channel.send('Wrong channel, my dood.');
        if (!game.players.includes(message.member)) return message.reply("You're not in the game!");
        if (message.member == game.moderator) return message.reply("You can't leave, you're the moderator!");
        if (!game.starting) return message.channel.send("My man, you are already in too deep.");
        game.players.splice(game.players.indexOf(message.member), 1);
        message.channel.send(`${message.member.nickname ? message.member.nickname : message.author.username} has left the game`)
    }
}