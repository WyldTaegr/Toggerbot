const fs = require('fs');
const { id } = require('../../config.json');
const Discord = require('discord.js');

roles = new Discord.Collection();
const roleFiles = fs.readdirSync('./commands/tos/roles').filter(file => file.endsWith('.js'));
for (file of roleFiles) {
    const role = require(`./roles/${file}`).view;
    roles.set(role.name.toLowerCase(), role)
}

module.exports = {
    name: "role",
    aliases: ['r', 'view'],
    description: 'See more information about a specific role in Town of Salem.',
    usage: `tos${id}role [Role]`, //NOTE: prefix before id depends on folder name!
    cooldown: 3,
    execute(message, args) {
        if(!args.length) {
            message.reply('Stop your rarded shenanigans');
            return;
        }

        const role = roles.get(args[0]);
        if (!role) {
            message.reply('that\'s not a role, faggot');
            return;
        }
        const embed = new Discord.RichEmbed()
            .setTitle(role.name)
            .setThumbnail(role.pictureUrl)
            .setColor(role.color)
            .setDescription(`Alignment: ${role.alignment} (${role.category})`)
            .addField('Abilities', role.abilities, true)
            .addField('Commands', role.commands, true)
            .addField('Attributes', role.attributes, false)
            .addField('Goal', role.goal, false)

        message.channel.send(embed);

    }
}