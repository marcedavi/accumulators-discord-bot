const { SlashCommandBuilder } = require('@discordjs/builders')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('riavvia')
        .setDescription('Riavvia il bot'),
    async execute(client, interaction) {
        await interaction.reply({content: interaction.member.displayName + ' mi sta facendo riavviare', ephemeral: false})

        // Run the bot with PM2 as suggested by DiscordJS.guide
        // It will take care of restarting the bot upon exit
        process.exit(1)
    },
};