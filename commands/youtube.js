const { SlashCommandBuilder } = require('@discordjs/builders')
const Voice = require('@discordjs/voice')
const Discord = require('discord.js')
const common = require('../common')
const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('youtube')
        .setDescription('Riproduce l\'audio di un video di youtube')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Link del video')
                .setRequired(true)),
    async execute(client, interaction) {

        // Join voice channel
        let connection = await common.joinMemberVoiceChannel(client, interaction.member)

        if(connection === null) {
            interaction.reply({content: 'Entra nel canale lurida merda', ephemeral: true})
            return
        }

        const link = interaction.options.getString('link')

        // Get stream
        let stream = null
        try {
            stream = ytdl(link, {
                filter: 'audioonly'
            })
        } catch (error) {
            interaction.reply({content: 'Non riesco ad accedere a questo video. Riprova con un link diverso.', ephimeral: true})
        }

        if(!stream)
            return

        // Play sound
        const playing = await common.playAudio(client, connection, stream, Voice.StreamType.Arbitrary)

        if(!playing)
            return

        // Reply with controls
        let row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('stop')
                .setLabel('Stop')
                .setStyle('PRIMARY'))
        
        await interaction.reply({content: 'Playing', ephemeral: false, components: [row]})
        
        const message = await interaction.fetchReply()

        // Create button collector
        const collector = message.createMessageComponentCollector({ componentType: 'BUTTON', time: 3600000 });

        collector.on('collect', async (i) => {
            await client.audioPlayer.stop()
            await interaction.deleteReply()

            client.audioPlayer = Voice.createAudioPlayer();

            collector.stop()
        });


    },
};