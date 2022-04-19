const { SlashCommandBuilder } = require('@discordjs/builders')
const common = require('../common')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tette')
        .setDescription('Posta un\'immagine con delle tette'),
    async execute(client, interaction) {

        await interaction.deferReply();

        if (Date.now() - client.lastTitsRedgifsRequest > 30000) {
            console.log("Requesting redgifs")
            client.lastTitsRedgifsRequest = Date.now()
            client.titsImages = await common.getRedgifs('https://api.redgifs.com/v2/gifs/search?search_text=Tits&order=top7&type=i&count=80')
        }

        interaction.editReply({files: [client.titsImages[Math.floor(Math.random() * client.titsImages.length)].urls.hd]})

    },
};