const Discord = require('discord.js');

module.exports = {
    name: "end",
    description: 'Ends a Town Of Salem game. Only executable by moderator',
    cooldown: 10,
    guildOnly: true,
    execute(message) {
        const client = require("../../index.js");
        const game = client.games.get(message.guild.id);

        if (!game.running) return message.reply("Wow you really don't like this game.");
        if (message.member != game.moderator) return message.reply("Ask the faggot in charge");
        if (message.channel != game.announcements) return message.reply('Wrong channel my dood');

        const end = new Discord.RichEmbed()
            .setTitle('**The game of Town Of Salem has just finished!**')
            .setDescription(`This game was run by: ${game.moderator.nickname || game.moderator.user.username}`)
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .setTimestamp();
            //TO-DO: Add game info (ie reveal the roles of each player)

        for (const player of game.players) {
            player.user.partOfTos = false;
        }
        game.announcements.delete();
        game.category.delete();
        game.origin.send(end);
        game.reset();
    }
}