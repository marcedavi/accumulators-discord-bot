const Voice = require('@discordjs/voice')
const axios = require('axios')
const AWS = require('aws-sdk')

/*
Join the voice channel the member is in and return the VoiceConnection
Returns null if the user is not in a voice channel
*/
module.exports = {
    getBestemmia: async () => {
        // Request random bestemmia
        let response = await axios.get('https://bestemmie.org/api/random/')

        if (response.status !== 200)
            return null

        return response.data.bestemmia
    },
    joinMemberVoiceChannel: async (client, member) => {

        // Check if we're already in the channel
        let connection = Voice.getVoiceConnection(member.voice.channelId);
    
        if(typeof connection !== 'undefined')
            return connection
    
        // Fetch channel
        const channel = await client.channels.fetch(member.voice.channelId).catch(() => {});
    
        if (!channel)
            return null;
    
        // Join channel and return connection
        connection = Voice.joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false
        });
    
        return connection
    
    },
    synthesize: async (format, voice, text) => {
        // Create AWS Polly
        polly = new AWS.Polly({
            signatureVersion: 'v4',
            region: voice === 'Bianca' ? 'eu-central-1' : 'eu-west-3'
        })

        // Request tts to AWS Polly
        let data = await polly.synthesizeSpeech({
            'Text': text,
            'OutputFormat': format,
            'VoiceId': voice,
            'Engine': voice === 'Bianca' ? 'neural' : 'standard'
        }).promise().catch((error) => {console.log(error)})

        if(!data || !(data.AudioStream instanceof Buffer))
            return null

        return data.AudioStream
    },
    playAudio: async (client, connection, audioResource, streamType) => {
        connection.subscribe(client.audioPlayer);
                    
        console.log('Player subscribed')

        // Play sound
        const resource = Voice.createAudioResource(audioResource, {
            inputType: streamType,
        });

        console.log('Audio resource created')

        let playing = await Voice.entersState(client.audioPlayer, Voice.AudioPlayerStatus.Idle, 1e3)
            .then(() => {
                console.log('Not playing')
                return false
            })
            .catch((error) => {
                console.log('Already playing')
                return true
            });

        if(!playing) {
            client.audioPlayer.play(resource)
            console.log('playing')
        }
        return !playing
    }
} 