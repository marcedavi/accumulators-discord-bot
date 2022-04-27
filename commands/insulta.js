const { SlashCommandBuilder } = require('@discordjs/builders')
const Voice = require('@discordjs/voice')
const fs = require('fs')
const common = require('../common')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('insulta')
        .setDescription('Legge un insulto ad alta voce'),
    async execute(client, interaction) {

        // Join voice channel
        let connection = await common.joinMemberVoiceChannel(client, interaction.member)

        if(connection === null) {
            interaction.reply({content: 'Devi essere in un canale', ephemeral: true})
            return
        }

        insulto = common.getInsulto()

        let audio = await common.synthesize('mp3', 'Giorgio', insulto)

        if(!audio)
            return

        fs.writeFileSync("./insulta.mp3", audio, function(err) {
            if (err)
                return console.log(err)
        })

        // Play sound
        let playing = await common.playAudio(client, connection, "./insulta.mp3", Voice.StreamType.Arbitrary)

        if(!playing)
            return
            
        interaction.reply({content: insulto, ephemeral: true})

    },
};