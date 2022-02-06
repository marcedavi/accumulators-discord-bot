const { SlashCommandBuilder } = require('@discordjs/builders')
const Voice = require('@discordjs/voice')
const axios = require('axios')
const fs = require('fs')
const common = require('../common')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bestemmia')
        .setDescription('Se non bestemmio guarda'),
    async execute(client, interaction) {

        // Join voice channel
        let connection = await common.joinMemberVoiceChannel(client, interaction.member)

        if(connection === null) {
            interaction.reply({content: 'Entra nel canale lurida merda', ephemeral: true})
            return
        }
        
        // Request random bestemmia
        let response = await axios.get('https://bestemmie.org/api/random/')

        if (response.status !== 200)
            return

        // Request tts to AWS Polly
        let data = await client.polly.synthesizeSpeech({
            'Text': response.data.bestemmia,
            'OutputFormat': 'mp3',
            'VoiceId': 'Giorgio',
            'Engine': 'standard'
        }).promise().catch(() => {})

        if(!data || !(data.AudioStream instanceof Buffer))
            return

        // Play sound
        await common.playSound(client, connection, [data.AudioStream], Voice.StreamType.Arbitrary)

        // Defer update to avoid replying
        interaction.reply({content: response.data.bestemmia, ephemeral: true})

    },
};