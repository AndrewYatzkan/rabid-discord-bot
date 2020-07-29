module.exports = {
	name: 'server-info',
	description: 'DEV: Return server information',
	guildOnly: true,
	aliases: ['serverinfo', 'servinfo'],
	execute(message, args) {
		message.channel.send(`Server name: ${message.guild.name}\nTotal members: ${message.guild.memberCount}\nServer establsihed: ${message.guild.createdAt}\nServer Region: ${message.guild.region}`)
	},
};

