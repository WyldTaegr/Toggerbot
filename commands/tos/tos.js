const Discord = require('discord.js');
const initializeGame = async function (message, game) {
    game.category = await message.guild.createChannel('Town Of Salem', 'category');
    game.announcements = await message.guild.createChannel('gods-wrath', 'text');
    game.announcements.setParent(game.category);
    game.input = await message.guild.createChannel('gods-hand', 'text', [{
        id: message.guild.roles.find(role => role.name == '@everyone'),    
        denied: 1024
    }]);
    game.input.setParent(game.category);
    const welcome = new Discord.RichEmbed()
            .setTitle('**Welcome To Salem!**')
            .setDescription(`This game is run by: ${game.moderator.nickname || game.moderator.user.username}`)
            .setColor('#ffff00')
            .setThumbnail('https://s3.amazonaws.com/geekretreatimages/wp-content/uploads/2017/12/8710ecd8a710e3b557904bfaadfe055084a0d1d6.jpg')
            .setTimestamp();
        game.announcements.send(welcome);
}

module.exports = {
    name: "tos",
    description: `Setup a game of Town Of Salem, with you as the moderator.`,
    cooldown: 10,
    guildOnly: true,
    execute(message) {
        const client = require("../../index.js");
        const game = client.games.get(message.guild.id);

        if (game.running) return message.reply("Stop being a sore-ass loser");
        if (message.author.partOfTos && message.author.partOfTos != message.guild.id) return message.reply("You're already part of a game on a different server!");

        game.origin = message.channel;
        game.running = true;
        game.stage = 'setup';
        game.moderator = message.member;
        game.players.push(message.member);
        message.author.partOfTos = message.guild.id;
        
        initializeGame(message, game);
        
    }
}