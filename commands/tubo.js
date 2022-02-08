const { SlashCommandBuilder } = require('@discordjs/builders')
const Voice = require('@discordjs/voice')
const Discord = require('discord.js')
const fs = require('fs')
const common = require('../common')
const ytdl = require('ytdl-core');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tubo')
        .setDescription('Riproduce gli audio dei videi del tubo')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('Link al video disagiato')
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
        const stream = ytdl(link, {
            filter: 'audioonly'
        })

        // Play sound
        await common.playSound(client, connection, stream, Voice.StreamType.Arbitrary)

        // Reply with controls
        let row = new Discord.MessageActionRow()
        .addComponents(
            new Discord.MessageButton()
                .setCustomId('stop|')
                .setLabel('Stop')
                .setStyle('PRIMARY'))
        interaction.reply({content: 'Playing', ephemeral: false, components: [row]})

        // Create button collector
        const collector = interaction.channel.createMessageComponentCollector({ componentType: 'BUTTON' });

        collector.on('collect', async (i) => {
            await client.audioPlayer.stop()
            await interaction.deleteReply()
        });

    },
};