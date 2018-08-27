const { id } = require('../../config.json');

module.exports = {
    name: 'remove',
    description: 'Remove a role added to the game. Only executable by moderator.',
    guildOnly: true,
    usage: `tos${id}add [Role]`,
    execute(message, args) {
        const client = require('../../index.js');
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.reply('Start a game first!');
        if (message.channel != game.botChannel) return message.channel.send('Wrong channel, my dood.');
        if (game.stage != 'setup') return message.channel.send(`The game has already begun, ${message.member.nickname || message.author.username}!`);
        if (message.member != game.moderator) return message.reply("Ask the faggot in charge");
        
        const role = args[0].toLowerCase();
        if(!game.roles.includes(role)) return message.reply('No such role is currently added to the game!');

        game.roles.splice(game.roles.lastIndexOf(role), 1);
        message.channel.send('One instance of `' + role.charAt(0).toUpperCase() + role.slice(1) + '` has been removed from the game.');
    }
}