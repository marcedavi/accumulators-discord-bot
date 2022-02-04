const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const stream = require('sodium/lib/stream');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disagio')
		.setDescription('Per quando ti sei incarognato'),
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

        // For each message
        for(let i = 0; i < array_of_chunks.length; i += 5) {
            let rows = []
            // For each row
            for(let j = 0; j < 5 && i*5+j < array_of_chunks.length; j++) {
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