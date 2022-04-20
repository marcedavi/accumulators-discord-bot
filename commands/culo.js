const { SlashCommandBuilder } = require('@discordjs/builders')
const common = require('../common')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('culo')
        .setDescription('Posta un\'immagine con un culo'),
    async execute(client, interaction) {

        await interaction.deferReply();

        if (Date.now() - client.lastAssRedgifsRequest > 30000) {
            console.log("Requesting redgifs")
            client.lastAssRedgifsRequest = Date.now()
            client.assImages = await common.getRedgifs('https://api.redgifs.com/v2/gifs/search?search_text=Ass&order=rand&type=i&count=80')
        }

        interaction.editReply({files: [client.assImages[Math.floor(Math.random() * client.assImages.length)].urls.hd]})

    },
};