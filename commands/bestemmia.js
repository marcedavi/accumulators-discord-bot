const { SlashCommandBuilder } = require('@discordjs/builders')
const Voice = require('@discordjs/voice')
const axios = require('axios')
const fs = require('fs')
const AWS = require('aws-sdk')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bestemmia')
        .setDescription('Se non bestemmio guarda'),
    async execute(client, interaction) {

        let response = await axios.get('https://bestemmie.org/api/random/')

        if (response.status !== 200)
            return

        const Polly = new AWS.Polly({
            signatureVersion: 'v4',
            region: 'us-east-1'
        })

        Polly.synthesizeSpeech({
            'Text': response.data.bestemmia,
            'OutputFormat': 'mp3',
            'VoiceId': 'Giorgio'
        }, async (err, data) => {
            if (err) {
                console.log(err.code)
            } else if (data) {
                if (data.AudioStream instanceof Buffer) {

                    fs.writeFileSync("./bestemmia.mp3", data.AudioStream, function(err) {
                        if (err) {
                            return console.log(err)
                        }
                        console.log("The file was saved!")
                    })

                    // Get VoiceConnection
                    let connection = Voice.getVoiceConnection(interaction.member.voice.channelId);

                    // Join channel if needed
                    if (typeof connection === 'undefined') {
                        const channel = await client.channels.fetch(interaction.member.voice.channelId)
                            .catch(() => interaction.reply({ content: 'Entra nel canale lurida merda', ephemeral: true }));

                        if (!channel) return console.error('The channel does not exist!');

                        connection = Voice.joinVoiceChannel({
                            channelId: channel.id,
                            guildId: channel.guild.id,
                            adapterCreator: channel.guild.voiceAdapterCreator,
                            selfDeaf: false,
                            selfMute: false
                        });

                        connection.subscribe(client.audioPlayer);
                    }

                    // Play sound
                    const resource = Voice.createAudioResource('./bestemmia.mp3', {
                        inputType: Voice.StreamType.Arbitrary,
                    });

                    await Voice.entersState(client.audioPlayer, Voice.AudioPlayerStatus.Idle, 1e3)
                        .then(() => client.audioPlayer.play(resource))
                        .catch(() => console.log('Already playing'));

                    // Defer update to avoid replying
                    interaction.reply({content: 'Amen'})
                    interaction.deleteReply()

                }
            }
        })

    },
};