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
                requestOptions: {
                    headers: {
                        Cookie: '__Secure-1PAPISID=I_uBu-O-2NPq4QP0/Ar5jeZrkixVHTfkOF;__Secure-1PSID=IggV7sLRNfuYXY1yf_wy-1AVcRnMaXF1TTluVB864Uv2iDBqRvcxGi_nf6Kkoqr28fqxvQ.;__Secure-3PAPISID=I_uBu-O-2NPq4QP0/Ar5jeZrkixVHTfkOF;__Secure-3PSID=IggV7sLRNfuYXY1yf_wy-1AVcRnMaXF1TTluVB864Uv2iDBq2k5V_QNIDU7NmzergQFv4g.;__Secure-3PSIDCC=AJi4QfGvG-vVlOOaOmr_NZs05vwZ3aTvN-DKQ4m8kubvL6TvR_kHbVsaj8Bqr5CHF5gSafc8H1pZ;APISID=xOZBk7weyJwi5mx2/AjSsqicxi9Yw-a5rJ;HSID=A-mkqjr7CGyjDWwtW;LOGIN_INFO=AFmmF2swRQIgaPfcH6ODoYLW5tRi-O_3m-ojPynAmXHl_Ju7OHtwsNkCIQDyY2wMTgvn-NVcrgoNkJBwNLhvINE-aHWD5uva-MGWzQ:QUQ3MjNmd0NYX0V4OWhPWTZxeHFkX1JFWkJpLVZ0Xzk5Z203SVNvb2JXakU2SmVpeE9FejBSdDc1ZnBfOHZvRldCOE1zcFFadnJWSVNTczFEM0Z5bVdKTV9UOEMtRnBzX19nVk13bWtld3Q1aG1jbHlhUGFvS01sdFJ6WFgwdXlxMHJ1SkdtWUtrSXJ4SFJqTjE2U1JNTEtQY3RnNFR3RDVEeUdlMUZ6QnJOMV9vWEVGbFpvanZFLXRXQTNmVHdYTnRualphMnIxcGUzTlpXbi1ZS0Q4NFJ2Z2tsdnl5RXRhdw==;PREF=tz=Europe.Rome&f6=40000000&f5=30000;SAPISID=I_uBu-O-2NPq4QP0/Ar5jeZrkixVHTfkOF;SID=IggV7sLRNfuYXY1yf_wy-1AVcRnMaXF1TTluVB864Uv2iDBqiBnWew47tnHpFXLquZFRAA.;SIDCC=AJi4QfHr1Fgdxo9LJAnhoNJvJj-20xPv_NwPhubxF02CMhC0tsRVvOvRfmtlH3cg0FPJKS_ykHsq;SSID=AjKm0c2Eryo4Lol4h;VISITOR_INFO1_LIVE=zctaw5qOrzs;YSC=HI57Ru9-uUw;'
                    }
                },
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