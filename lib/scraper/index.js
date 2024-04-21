const axios = require('axios');
const cheerio = require('cheerio');

const scrapeAmazonProduct = async (url) => {
    if(!url) return;

    const username = process.env.BRIGHT_DATA_USERNAME;
    const password = process.env.BRIGHT_DATA_PASSWORD;
    const port = 222225;
    const session_id = (1000000 * Math.random()) | 0;
    const options = {
        auth: {
            username: `${username}-session-${session_id}`,
            password,
        },
        host: 'brd.superproxy.io',
        port,
        rejectUnauthorized: false,
    }

    try {
        const response = await axios.get(url, options);
        const $ = cheerio.load(response.data);

        const title = $('#title').text().trim();
        console.log(title);

        return title;
    } catch (error) {
        throw new Error(`Failed to Scrape Data: ${error.message}`);
    }
}

module.exports = scrapeAmazonProduct;