const { id } = require('../../config.json');
const fs = require('fs');

roleNames = [];
const roleFiles = fs.readdirSync('./commands/tos/roles').filter(file => file.endsWith('.js'));
for (file of roleFiles) { //List of all roles currently added to the bot
    const { View } = require(`./roles/${file}`);
    roleNames.push(View.name.toLowerCase());
}

module.exports = {
    name: 'add',
    description: 'Add a role to the Town Of Salem game. Only executeable by moderator.',
    guildOnly: true,
    usage: `tos${id}add [Role]`, //NOTE: prefix before id depends on folder name!
    execute(message, args) {
        const client = require('../../index.js');
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.reply('Start a game first!');
        if (message.channel != game.announcements) return message.channel.send('Wrong channel, my dood.');
        if (game.stage != 'setup') return message.channel.send(`The game has already begun, ${message.member.nickname || message.author.username}!`);
        if (message.member != game.moderator) return message.reply("Ask the faggot in charge");
        if (game.players.length <= game.roles.length) message.channel.send('Note: there are more roles than there are players! Upon starting, roles will randomly be chosen from the role pool.');
        
        const role = args[0].toLowerCase();

        if (!roleNames.includes(role)) return message.reply('That role is not available yet!');

        game.roles.push(role);
        message.channel.send('Role `' + role.charAt(0).toUpperCase() + role.slice(1) + '` Added to the game!')
    }
}