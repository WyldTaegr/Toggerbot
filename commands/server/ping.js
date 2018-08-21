module.exports = {
    name: 'ping',
    aliases: ['p'],
    description: 'Ping!',
    cooldown: 2,
    execute(message) {
        message.channel.send('SEX!');
    }
}