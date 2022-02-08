const { SlashCommandBuilder } = require('@discordjs/builders')
const Voice = require('@discordjs/voice')
const fs = require('fs')
const common = require('../common')
const AWS = require('aws-sdk')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('professa')
        .setDescription('Professa il verbo del signore')
        .addStringOption(option =>
            option.setName('voce')
                .setDescription('Voce da stronzo o da puttana')
                .setRequired(true)
                .addChoice('puttana', 'puttana')
                .addChoice('stronzo', 'stronzo'))
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

        const voce = interaction.options.getString('voce')
        const testo = interaction.options.getString('testo')

        // Create AWS Polly
        polly = new AWS.Polly({
            signatureVersion: 'v4',
            region: voce === 'stronzo' ? 'eu-west-3' : 'eu-central-1'
        })

        // Request tts to AWS Polly
        let data = await polly.synthesizeSpeech({
            'Text': testo,
            'OutputFormat': 'ogg_vorbis',
            'VoiceId': voce === 'stronzo' ? 'Giorgio' : 'Bianca',
            'Engine': voce === 'stronzo' ? 'standard' : 'neural'
        }).promise().catch((error) => {console.log(error)})

        if(!data || !(data.AudioStream instanceof Buffer))
            return

        fs.writeFileSync("./professa.mp3", data.AudioStream, function(err) {
            if (err) {
                return console.log(err)
            }
            console.log("The file was saved!")
        })

        // Play sound
        await common.playSound(client, connection, "./professa.mp3", Voice.StreamType.Arbitrary)

        // Defer update to avoid replying
        interaction.reply({content: testo, ephemeral: true})

    },
};