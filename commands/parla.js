const { SlashCommandBuilder } = require('@discordjs/builders')
const Voice = require('@discordjs/voice')
const fs = require('fs')
const common = require('../common')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('parla')
        .setDescription('Legge una frase ad alta voce')
        .addStringOption(option =>
            option.setName('voce')
                .setDescription('Voce con cui il bot parlerà')
                .setRequired(true)
                .addChoice('Bianca', 'Bianca')
                .addChoice('Carla', 'Carla')
                .addChoice('Giorgio', 'Giorgio'))
        .addStringOption(option =>
            option.setName('testo')
                .setDescription('La frase che il bot dirà')
                .setRequired(true)
        ),
    async execute(client, interaction) {

        // Join voice channel
        let connection = await common.joinMemberVoiceChannel(client, interaction.member)

        if(connection === null) {
            interaction.reply({content: 'Devi essere in un canale', ephemeral: true})
            return
        }

        const voce = interaction.options.getString('voce')
        const testo = interaction.options.getString('testo')

        let audio = await common.synthesize('mp3', voce, testo)

        if(!audio)
            return

        fs.writeFileSync("./parla.mp3", audio, function(err) {
            if (err)
                return console.log(err)
        })

        // Play sound
        let playing = await common.playAudio(client, connection, "./parla.mp3", Voice.StreamType.Arbitrary)

        if(!playing)
            return
            
        interaction.reply({content: testo, ephemeral: true})

    },
};