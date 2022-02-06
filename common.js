const Voice = require('@discordjs/voice')

/*
Join the voice channel the member is in and return the VoiceConnection
Returns null if the user is not in a voice channel
*/
module.exports = {

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

    playSound: async (client, connection, audioResource, streamType) => {
        connection.subscribe(client.audioPlayer);
                    
        // Play sound
        const resource = Voice.createAudioResource(audioResource, {
            inputType: streamType,
        });

        await Voice.entersState(client.audioPlayer, Voice.AudioPlayerStatus.Idle, 1e3)
            .then(() => client.audioPlayer.play(resource))
            .catch(() => console.log('Already playing'));
    }
} 