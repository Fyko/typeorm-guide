import { config } from 'dotenv';
import { join } from 'path';
config({ path: join(process.cwd(), '.env')});

import { createConnection } from 'typeorm';
import Guild from './entities/Guild';
import { Client, Intents, Constants, Message } from 'discord.js';

const client = new Client({
	ws: {
		intents: [
			Intents.FLAGS.GUILDS,
			Intents.FLAGS.GUILD_MESSAGES
		]
	}
});

client.on(Constants.Events.DEBUG, console.debug);
client.on(Constants.Events.CLIENT_READY, () => console.log(`${client.user?.tag} (${client.user?.id}) has logged in!`));

/*
After the video, I refactored this:
```js
let guild = await Guild.findOne({ id: msg.guild.id });
if (!guild) {
	guild = await Guild.create({ id: msg.guild.id }).save();
}
```
into this fucntion below:
*/
async function getGuild(id: string): Promise<Guild> {
	const guild = await Guild.findOne({ id });
	if (guild) return guild;
	return Guild.create({ id }).save();
}

client.on(Constants.Events.MESSAGE_CREATE, async (msg: Message) => {
	if (!msg.guild || msg.author.bot) return;

	if (msg.content === '!!ping') {
		return msg.reply('pong!');
	}

	// create our database document
	if (msg.content === '!!create') {
		const existing = await Guild.findOne({ id: msg.guild.id });
		if (existing) return msg.reply('datase document already exists!');

		const guild = await Guild.create({ id: msg.guild.id }).save();
		console.dir(guild);
		return msg.reply(`created a guild entry with the id of \`${guild.id}\`.`);
	}

	// returns the command prefix
	if (msg.content === '!!prefix') {
		const { prefix } = await getGuild(msg.guild.id);
		return msg.reply(`the command prefix is \`${prefix}\`.`);
	}

	// changes the command prefix
	if (msg.content === '!!changeprefix') {
		const guild = await getGuild(msg.guild.id);

		// added after recording the video
		const [, prefix] = msg.content.slice(guild.prefix.length).split(/ +/);
		if (!prefix) return msg.reply(`please provide a new prefix! Example: \`${guild.prefix}changeprefix pfx?\`.`);

		guild.prefix = prefix;
		await guild.save();

		return msg.reply(`changed the prefix to \`${guild.prefix}\`.`);
	}

});

async function bootstrap(): Promise<void> {
	await createConnection();
	client.login();
}

bootstrap();