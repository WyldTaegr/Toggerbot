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
        const role = require(`./roles/${game.assignments.get(message.member).name}.js`).view;
        const embed = new Discord.RichEmbed()
            .setTitle(role.name)
            .setThumbnail(role.pictureUrl)
            .setColor(role.color)
            .setDescription(`Alignment/Category: ${role.alignment} (${role.category})`)
            .addField('Abilities', role.abilities, true)
            .addField('Commands', role.commands, true)
            .addField('Attributes', role.attributes, false)
            .addField('Goal', role.goal, false)
        message.author.send(embed);
    }
}