"use strict"

const fs = require('fs');
const Discord = require('discord.js');
const { id, token } = require('./config.json');
const Game = require("./commands/tos/src/game.js");

const client = new Discord.Client({sync: true});

const games = new Discord.Collection();

client.commands = new Discord.Collection();
const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.name, command);
    }
}

client.prefixes = new Discord.Collection();
for (const folder of commandFolders) {
	const commands = new Discord.Collection(); 
	const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
	commands.set('name', folder);
	for (const file of commandFiles) {
		const command = require(`./commands/${folder}/${file}`);
		commands.set(command.name, command);
	}
	client.prefixes.set(folder, commands);
}


const cooldowns = new Discord.Collection();

client.on('ready', () => {
	console.log('Ready!');
	client.guilds.get("480906166541484033").me.setNickname("Sex Bot");
	for (const guild of client.guilds) {
		const game = new Game();
		games.set(guild[0], game);
	}
	module.exports.games = games;
});

client.on('message', message => {
	if (message.author.bot) return;

	let commandType;
	for (const prefix of client.prefixes) {
		if (message.content.startsWith(prefix[1].get('name') + id)) {
			commandType = prefix[1].get('name');
		}
	}

	if (!commandType) return;

	const args = message.content.slice(commandType.length + id.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.prefixes.get(commandType).get(commandName)
		|| client.prefixes.get(commandType).find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (!timestamps.has(message.author.id)) {
		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}
	else {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	}

	try {
		command.execute(message, args);
	}
	catch (error) {
		console.error(error);
		message.reply('no u');
	}
});

client.login(token);