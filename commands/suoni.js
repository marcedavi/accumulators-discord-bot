const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Voice = require('@discordjs/voice')
const fs = require('fs')
const common = require('../common');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('suoni')
		.setDescription('Interfaccia per riprodurre i nostri suoni'),
	async execute(client, interaction) {
        
        // Split blerps object into chunks
        const chunksize = 5;
        const array_of_chunks = Object.keys(client.sounds).reduce((c, k, i) => {
            if (i % chunksize == 0) {
                c.push(Object.fromEntries([[k, client.sounds[k]]]));
            } else {
                c[c.length - 1][k] = client.sounds[k];
            }
            return c;
        }, []);

        // Build and send each message
        for(let i = 0; i < array_of_chunks.length; i += 5) {
            let rows = []

            let maxActionRows = 5

            if(i === 0) {
                maxActionRows = 4

                let row = new MessageActionRow()
                row.addComponents(
                    new MessageButton()
                        .setCustomId('bestemmia')
                        .setLabel('Bestemmia')
                        .setStyle('DANGER')
                );
                rows.push(row)
            }

            // For each row
            // I feel like that i*maxActionRows+j is gonna give problems
            for(let j = 0; j < maxActionRows && i*maxActionRows+j < array_of_chunks.length; j++) {
                let row = new MessageActionRow()
                // For each blerp
                for(let key in array_of_chunks[i*5+j]) {
                    row.addComponents(
                        new MessageButton()
                            .setCustomId(key)
                            .setLabel(key)
                            .setStyle('PRIMARY')
                    );
                }
                rows.push(row)
            }

            await interaction.reply({ content: 'I nostri suoni', ephemeral: false, components: rows });
            
            const message = await interaction.fetchReply()

            // Create a button collector for each message
            const collector = message.createMessageComponentCollector({ componentType: 'BUTTON' });

            collector.on('collect', async (i) => {

                // Join voice channel
                let connection = await common.joinMemberVoiceChannel(client, i.member)
        
                if(connection === null) {
                    i.reply({content: 'Entra nel canale lurida merda', ephemeral: true})
                    return
                }
        
                // Defer reply to avoid replying
                i.deferUpdate()

                let audio = null

                // Se è stato premuto il pulsante "bestemmia"
                if(i.customId === 'bestemmia') {
                    const bestemmia = await common.getBestemmia()

                    if(!bestemmia)
                        return

                    const buffer = await common.synthesize('mp3', 'Giorgio', bestemmia)

                    fs.writeFileSync("./bestemmia.mp3", buffer, function(err) {
                        if (err)
                            return console.log(err)
                    })

                    audio = './bestemmia.mp3'
                } else {
                    audio = client.sounds[i.customId]
                }

                // Play sound
                common.playAudio(client, connection, audio, Voice.StreamType.Arbitrary)
            });

        }

	},
};