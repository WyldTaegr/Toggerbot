const Discord = require('discord.js');

module.exports = {
    name: 'status',
    aliases: ['now'],
    cooldown: 10,
    guildOnly: true,
    execute(message) {
        const client = require('../../index.js');
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.reply("There's no game!");
        if (message.channel != game.botChannel) return message.channel.send('Wrong channel, my dood.');

        const playerNames = game.players.map(member => member.nickname || member.user.username)
            .toString()
            .replace(',', '\n');
        const roleNames = game.roles.map(role => role.charAt(0).toUpperCase() + role.slice(1))
            .toString()
            .replace(',', '\n');

        const status = new Discord.RichEmbed()
            .setTitle('**Town Of Salem**')
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .setDescription(`Moderator: ${game.moderator.nickname || game.moderator.user.username}`)
            .addField('Players:', playerNames, true)
            .addField('Roles:', roleNames || 'No roles yet lol', true)

        game.botChannel.send(status)
    }
}