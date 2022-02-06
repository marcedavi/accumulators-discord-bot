const { SlashCommandBuilder } = require('@discordjs/builders')
const Voice = require('@discordjs/voice')
const axios = require('axios')
const fs = require('fs')
const common = require('../common')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('professa')
        .setDescription('Professa il verbo del signore')
        .addStringOption(option =>
            option.setName('testo')
                .setDescription('Il cazzo che devi professare')
                .setRequired(true)
        ),
    async execute(client, interaction) {

        // Join voice channel
        let connection = await common.joinMemberVoiceChannel(client, interaction.member)

        if(connection === null) {
            interaction.reply({content: 'Entra nel canale lurida merda', ephemeral: true})
            return
        }

        const testo = interaction.options.getString('testo')

        // Request tts to AWS Polly
        let data = await client.polly.synthesizeSpeech({
            'Text': testo,
            'OutputFormat': 'mp3',
            'VoiceId': 'Giorgio',
            'Engine': 'standard'
        }).promise().catch(() => {})

        if(!data || !(data.AudioStream instanceof Buffer))
            return

        // Play sound
        await common.playSound(client, connection, [data.AudioStream], Voice.StreamType.Arbitrary)

        // Defer update to avoid replying
        interaction.reply({content: testo, ephemeral: true})

    },
};