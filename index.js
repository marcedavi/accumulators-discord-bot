const fs = require('fs')
const Discord = require('discord.js')
const Voice = require('@discordjs/voice')
const config = require('./config.json')

// Create client
const client = new Discord.Client({ 
    intents: new Discord.Intents(32767) // All intents
});

// Create player
const player = Voice.createAudioPlayer();

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

	if (!interaction.isCommand() && !interaction.isButton()) return;

    // Ugliest way ever of handling buttons but i have no time
    if(interaction.isButton()) {

        // Get VoiceConnection
        let connection = Voice.getVoiceConnection(interaction.member.voice.channelId);

        // Join channel if needed
        if(typeof connection === 'undefined') {
            const channel = await client.channels.fetch(interaction.member.voice.channelId)
                .catch(() => interaction.reply({content: 'Entra nel canale lurida merda', ephemeral: true}));

            if (!channel) return console.error('The channel does not exist!');

            connection = Voice.joinVoiceChannel({
                channelId: channel.id,
                guildId: channel.guild.id,
                adapterCreator: channel.guild.voiceAdapterCreator,
                selfDeaf: false,
                selfMute: false
            });

            connection.subscribe(player);
        }

        // Play sound
        const resource = Voice.createAudioResource(client.sounds[interaction.customId], {
            inputType: Voice.StreamType.Arbitrary,
        });

	    await Voice.entersState(player, Voice.AudioPlayerStatus.Idle, 1e3)
            .then(() => player.play(resource))
            .catch(() => console.log('Already playing'));

        // Defer update to avoid replying
        interaction.deferUpdate()

        return
    }

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