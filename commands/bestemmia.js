const { SlashCommandBuilder } = require('@discordjs/builders')
const Voice = require('@discordjs/voice')
const axios = require('axios')
const fs = require('fs')
const common = require('../common')
const AWS = require('aws-sdk')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bestemmia')
        .setDescription('Se non bestemmio guarda')
        .addStringOption(option =>
            option.setName('voce')
                .setDescription('Voce da stronzo o da puttana')
                .setRequired(true)
                .addChoice('puttana', 'puttana')
                .addChoice('stronzo', 'stronzo')),
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

        const voce = interaction.options.getString('voce')

        // Create AWS Polly
        polly = new AWS.Polly({
            signatureVersion: 'v4',
            region: voce === 'stronzo' ? 'eu-west-3' : 'eu-central-1'
        })

        // Request tts to AWS Polly
        let data = await polly.synthesizeSpeech({
            'Text': response.data.bestemmia,
            'OutputFormat': 'ogg_vorbis',
            'VoiceId': voce === 'stronzo' ? 'Giorgio' : 'Bianca',
            'Engine': voce === 'stronzo' ? 'standard' : 'neural'
        }).promise().catch((error) => {console.log(error)})

        if(!data || !(data.AudioStream instanceof Buffer))
            return

        fs.writeFileSync("./bestemmia.mp3", data.AudioStream, function(err) {
            if (err) {
                return console.log(err)
            }
            console.log("The file was saved!")
        })

        // Play sound
        await common.playSound(client, connection, "./bestemmia.mp3", Voice.StreamType.Arbitrary)

        // Defer update to avoid replying
        interaction.reply({content: response.data.bestemmia, ephemeral: true})

    },
};