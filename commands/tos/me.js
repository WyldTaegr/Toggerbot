const Discord = require('discord.js');

module.exports = {
    name: 'me',
    description: 'Displays your role in the Town Of Salem game. You should only use this by PMing me!',
    cooldown: 10,
    execute(message) {
        const client = require('../../index.js');

        if (!message.author.partOfTos) return message.reply('You are not in a game of Town Of Salem!');
        const game = client.games.get(message.author.partOfTos);
        if (message.channel.type == 'text') {
            if (message.author.partOfTos != message.guild.id) return message.channel.send('Wrong server, my dood.');
            if (!game.running) return message.reply('There is no game for you to have a role in!');
            
            message.channel.send('Did my man just make a huge mistake?');
        }

        message.reply('Your role is:');
        const { View } = require(`./roles/${game.assignments.get(message.channel.type == 'text' ? message.member : client.guilds.get(message.author.partOfTos).members.get(message.author.id)).name}.js`);
        const embed = new Discord.RichEmbed()
            .setTitle(View.name)
            .setThumbnail(View.pictureUrl)
            .setColor(View.color)
            .setDescription(`Alignment/Category: ${View.alignment} (${View.category})`)
            .addField('Abilities', View.abilities, true)
            .addField('Commands', View.commands, true)
            .addField('Attributes', View.attributes, false)
            .addField('Goal', View.goal, false)
        message.author.send(embed);
    }
}