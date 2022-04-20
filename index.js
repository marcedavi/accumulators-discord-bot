const fs = require('fs')
const Discord = require('discord.js')
const Voice = require('@discordjs/voice')
const config = require('./config.json')

// Create client
const client = new Discord.Client({ 
    intents: new Discord.Intents(32767) // All intents
});

// Photos
client.photos = {}

// Create player
client.audioPlayer = Voice.createAudioPlayer();

// Load commands
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}

// Load sounds
client.sounds = {};
const soundFiles = fs.readdirSync('./sounds').filter(file => file.endsWith('.mp3'));
for (const file of soundFiles) {
    client.sounds[`${file}`.slice(0, -4)] = `./sounds/${file}`
}

// On ready
client.once('ready', async () => {
	console.log('Ready!')
});

// On interactionCreate
client.on('interactionCreate', async interaction => {

	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(client, interaction);
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login
client.login(config.token)