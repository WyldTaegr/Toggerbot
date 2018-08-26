const Discord = require('discord.js');

module.exports = {
    name: "end",
    description: 'Ends a Town Of Salem game. Only executable by moderator',
    execute(message) {
        const client = require("../../index.js");
        const game = client.games.get(message.guild.id);
        if (!game.running) return message.reply("Wow you really don't like this game.");
        if (message.member != game.moderator) return message.reply("Ask the faggot in charge");
        if (message.channel != game.botChannel) return message.reply('Wrong channel my dood');
        game.botChannel.delete();
        game.category.delete();
        const end = new Discord.RichEmbed()
            .setTitle('**The game of Town Of Salem has just finished!**')
            .setDescription(`This game was run by: ${game.moderator.nickname ? game.moderator.nickname : game.moderator.user.username}`)
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg');
            //TO-DO: Add game info (ie players with their respective roles)
        game.origin.send(end);
        game.reset();
    }
}