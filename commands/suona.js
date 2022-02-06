const { SlashCommandBuilder } = require('@discordjs/builders');
const Voice = require('@discordjs/voice')
const common = require('../common')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('suona')
		.setDescription('Riproduce un suono disagiato'),
	async execute(client, interaction) {
        
        if(!interaction.isButton()) {
            interaction.reply({content: 'Non usare questo comando, usa "/disagio", merdaccia.', ephemeral: true})
            return
        }

        // Join voice channel
        let connection = await common.joinMemberVoiceChannel(client, interaction.member)

        if(connection === null) {
            interaction.reply({content: 'Entra nel canale lurida merda', ephemeral: true})
            return
        }

        // Play sound
        await common.playSound(client, connection, client.sounds[interaction.customId.split('|')[1]], Voice.StreamType.Arbitrary)

        // Defer update to avoid replying
        interaction.deferUpdate()

	},
};