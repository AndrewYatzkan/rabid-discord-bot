module.exports = {
	name: 'args-info',
	description: 'DEV: Return information about arguments passed to command',
	args: true,
	usage: '<arg1> [...<argN>]',
	execute(message, args) {
		if (args[0] === 'foo') {
			return message.channel.send('bar');
		}

		message.channel.send(`NEW: Arguments: ${args}\nNumber of arguments: ${args.length}`);
	},
};

