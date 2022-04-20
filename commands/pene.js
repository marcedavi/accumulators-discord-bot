const { SlashCommandBuilder } = require('@discordjs/builders')
const common = require('../common')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pene')
        .setDescription('Posta un\'immagine con un pene'),
    async execute(client, interaction) {

        await interaction.deferReply();

        if (Date.now() - client.lastPeneRedgifsRequest > 30000) {
            console.log("Requesting redgifs")
            client.lastPeneRedgifsRequest = Date.now()
            client.peneImages = await common.getRedgifs('https://api.redgifs.com/v2/gifs/search?search_text=Big+Dick&order=rand&type=i&count=80')
        }

        interaction.editReply({files: [client.peneImages[Math.floor(Math.random() * client.peneImages.length)].urls.hd]})

    },
};