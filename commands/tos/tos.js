const Discord = require('discord.js');
const initializeGame = async function (message, game) {
    game.category = await message.guild.createChannel('Town Of Salem', 'category');
    game.botChannel = await message.guild.createChannel('gods-hand', 'text');
    game.botChannel.setParent(game.category);
    const welcome = new Discord.RichEmbed()
            .setTitle('**Welcome To Salem!**')
            .setDescription(`This game is run by: ${game.moderator.nickname ? game.moderator.nickname : game.moderator.user.username}`)
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg');
        game.botChannel.send(welcome);
}

module.exports = {
    name: "tos",
    description: `Setup a game of Town Of Salem, with you as the moderator.`,
    execute(message) {
        const client = require("../../index.js");
        const game = client.games.get(message.guild.id);
        if (game.running) return message.reply("Stop being a sore-ass loser");
        game.origin = message.channel;
        game.running = true;
        game.starting = true;
        game.moderator = message.member;
        game.players.push(message.member);
        
        //create tos category, voice channel, bot channel private mafia text channel
        initializeGame(message, game);
        
    }
}