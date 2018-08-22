const fs = require('fs');
const { prefix } = require('../../config.json');
const Discord = require('discord.js');
const game = new Discord.Client();
game.roles = new Discord.Collection();

const roleFiles = fs.readdirSync('./commands/tos/roles').filter(file => file.endsWith('.js'));
for (file of roleFiles) {
    const role = require(`./roles/${file}`);
    game.roles.set(role.id, role)
}

module.exports = {
    name: "view",
    aliases: ['v'],
    description: 'See more information about a specific role in Town of Salem.',
    usage: `${prefix}view [Role]`,
    execute(message, args) {
        if(!args.length) {
            message.reply('Stop your rarded shenanigans');
            return;
        }

        const role = game.roles.get(args[0]);
        if (!role) {
            message.reply('that\'s not a role, faggot');
            return;
        }
        const embed = new Discord.RichEmbed()
            .setTitle(role.name)
            .setThumbnail(role.pictureUrl)
            .setColor(role.color)
            .addField('Alignment', role.alignment, false)
            .addField('Abilities', role.abilities, false)
            .addField('Attributes', role.attributes, false)
            .addField('Goal', role.goal, false)

        message.channel.send(embed);

    }
}