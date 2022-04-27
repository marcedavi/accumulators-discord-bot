const Voice = require('@discordjs/voice')
const axios = require('axios')
const AWS = require('aws-sdk')

/*
Join the voice channel the member is in and return the VoiceConnection
Returns null if the user is not in a voice channel
*/
module.exports = {
    getRedgifs: async(url) => {

        let response = await axios.get(url)
        
        if (response.status !== 200)
            return null

        return response.data
        
    },
    getInsulto: () => {
        
        starts = [
            "Brutto",
            "Schifoso",
            "Ignobile",
            "Mi fai schifo,",
            "Baciami il culo,",
            "Leccami il cazzo,",
            "Incapace",
            "Viscido",
            "Fetido",
            "Mongoloide",
            "Lo sai cosa sei, vero? Brutto",
            "Inginocchiati,",
            "Impertinente",
            "Infetto",
            "Mi fai ribrezzo,",
            "Sai che sei proprio un",
            "Fammi un bocchino,",
            "Ciucciami la minchia,",
            "Sei proprio un",
            "Non de lo dovrei dire, ma sei un",
            "Viscido",
            "Assomigli tanto ad un",
            "Non sei altro che un",
            "Baciami il culo,",
            "Incapace",
            "Inginocchiati e baciami,",
            "Cattivo",
            "Negro",
            "Fammi un bocchino,"
        ]

        ends = [
            "stronzo",
            "bastardo", 
            "minchione", 
            "figlio di una bagascia", 
            "bastardone", 
            "stronzone",
            "puttaniere",
            "puttaniere",
            "sadomasochista",
            "testa di cazzo", 
            "gallinaio", 
            "analfabeta", 
            "coglionazzo", 
            "pedofilo", 
            "testa di minchia", 
            "cazzone", 
            "scemo di un", 
            "deficiente", 
            "stupido di un", 
            "mongoloide", 
            "fuso mentale", 
            "coglione", 
            "baciaculi", 
            "baciacazzi", 
            "lecchino", 
            "secchione", 
            "figlio di mignotta",
            "omosessuale"
        ]

        return starts[Math.floor(Math.random() * starts.length)] + " " + ends[Math.floor(Math.random() * ends.length)]
        
    },
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

        engine = 'standard'

        switch(voice) {
            case 'Criminale':
                voice = 'Giorgio'
                engine = 'standard'
                text = '<amazon:effect vocal-tract-length="+30%"><prosody pitch="-30%">' + text + '</prosody></amazon:effect>'
                break
            case 'Chipmunk':
                voice = 'Bianca'
                engine = 'standard'
                text = '<amazon:effect vocal-tract-length="-30%"><prosody pitch="+50%">' + text + '</prosody></amazon:effect>'
                break
            default:
                engine = voice === 'Bianca' ? 'neural' : 'standard'
        }
        
        text = '<speak>' + text + '</speak>'

        // Create AWS Polly
        polly = new AWS.Polly({
            signatureVersion: 'v4',
            region: 'eu-central-1'
        })

        // Request tts to AWS Polly
        let data = await polly.synthesizeSpeech({
            'TextType': 'ssml',
            'Text': text,
            'OutputFormat': format,
            'VoiceId': voice,
            'Engine': engine
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