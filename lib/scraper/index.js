const axios = require('axios');
const cheerio = require('cheerio');
const {extractPrice} = require('../utils/utils');
const {extractCurrency} = require('../utils/utils');
const {extractDescription} = require('../utils/utils');

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

        const currentPrice = extractPrice(
            $('.priceToPay span.a-price-whole'),
            $('.a.size.base.a-color-price'),
            $('.a-button-selected .a-color-base'),
        );

        const originalPrice = extractPrice(
            $('#priceblock_ourprice'),
            $('.a-price.a-text-price span.a-offscreen'),
            $('#listPrice'),
            $('#priceblock_dealprice'),
            $('.a-size-base.a-color-price')
        );

        // const outOfStock = $('#availability span').text().trim().toLowerCase() === 'Currently Unavailable';
        const outOfStock = $('#availability span').text().trim();

        const images = $('#imgBLKFront').attr('data-a-dynamic-image') ||
                      $('#landingImage').attr('data-a-dynamic-image') ||
                      '{}'
        const imageURL = Object.keys(JSON.parse(images));

        const currency = extractCurrency(
            $('.a-price-symbol')
        );

        const discoutPercentage = $('.savingsPercentage').text().replace(/[-%]/g, "");
        // console.log(discoutPercentage);

        const description = extractDescription($);

        const stars = $('#acrCustomerReviewLink span').text().trim();
        // console.log(stars);

        const brand = $('#bylineInfo').text().trim();
        // console.log(brand);

        const data = {
            url,
            image: imageURL[0],
            title,
            description: description,
            currency: currency || '₹',
            currentPrice: Number(currentPrice) || Number(originalPrice),
            originalPrice: Number(originalPrice) || Number(currentPrice),
            priceHistory: [],
            discoutPercentage: Number(discoutPercentage),
            category: 'category',
            reviewsCount: 50,
            stars: stars,
            brand: brand,
            isOutOfStock: outOfStock,
            lowestPrice: Number(currentPrice) || Number(originalPrice),
            highestPrice: Number(originalPrice) || Number(currentPrice),
            averagePrice: Number(currentPrice) || Number(originalPrice),
        };

        // console.log(data);
     
        return data;

    } catch (error) {
        throw new Error(`Failed to Scrape Data: ${error.message}`);
    }
}

module.exports = scrapeAmazonProduct;