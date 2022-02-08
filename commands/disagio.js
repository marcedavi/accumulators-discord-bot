const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const Voice = require('@discordjs/voice')
const common = require('../common')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disagio')
		.setDescription('Per quando ti sei incarognato'),
	async execute(client, interaction) {
        
        // Create buttons collector
        const collector = interaction.channel.createMessageComponentCollector({ componentType: 'BUTTON' });

        collector.on('collect', async (i) => {

            // Join voice channel
            let connection = await common.joinMemberVoiceChannel(client, i.member)
    
            if(connection === null) {
                i.reply({content: 'Entra nel canale lurida merda', ephemeral: true})
                return
            }
    
            // Play sound
            await common.playSound(client, connection, client.sounds[i.customId], Voice.StreamType.Arbitrary)
    
            // Defer update to avoid replying
            i.deferUpdate()
        });

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
                        .setCustomId('bestemmia|')
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

            await interaction.reply({ content: 'I nostri blerp disagiati.', ephemeral: false, components: rows });
        
        }
	},
};