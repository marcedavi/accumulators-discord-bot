const { SlashCommandBuilder } = require('@discordjs/builders')
const common = require('../common')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('foto')
        .setDescription('Posta un\'immagine')
        .addStringOption(option =>
            option.setName('soggetto')
                .setDescription('Soggetto della foto')
                .setRequired(true)
                .addChoice('Culo', 'Ass')
                .addChoice('Tette', 'Tits')
                .addChoice('Pene', 'Big+Dick')
                .addChoice('Puccacchia', 'Pussy')
                .addChoice('Trans', 'Trans')),
    async execute(client, interaction) {

        await interaction.deferReply();

        const query = interaction.options.getString('soggetto')

        if (!(query in client.photos)) {
            url = 'https://api.redgifs.com/v2/gifs/search?search_text=' + query + '&order=rand&type=i&count=10'

            data = await common.getRedgifs(url)
            client.photos[query] = {}
            client.photos[query].lastRequest = Date.now()
            client.photos[query].pages = data.pages
            client.photos[query].images = data.gifs
        } else if (Date.now() - client.photos[query].lastRequest > 10000) {

            url = 'https://api.redgifs.com/v2/gifs/search?search_text=' + query + '&order=rand&type=i&count=10&page=' + Math.floor(Math.random() * Math.min(client.photos[query].pages, 100) + 1)

            data = await common.getRedgifs(url)
            client.photos[query] = {}
            client.photos[query].lastRequest = Date.now()
            client.photos[query].pages = data.pages
            client.photos[query].images = data.gifs
        }

        interaction.editReply({files: [client.photos[query].images[Math.floor(Math.random() * client.photos[query].images.length)].urls.hd]})

    },
};