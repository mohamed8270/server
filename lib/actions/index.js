const Product = require("../../models/product.model");
const connectToDB = require("../../mongoose");
const scrapeAmazonProduct = require("../scraper");
const { getLowestPrice, getHighestPrice, getAveragePrice } = require("../utils/utils");
const {generateEmailBody, sendEmail} = require("../nodemailer/index");
// const { revalidatePath } = require('next/cache');

const scrapeAndStoreProduct = async (productUrl) => {
    if(!productUrl) return true;
    try {
        connectToDB();
        const scrapedProduct = await scrapeAmazonProduct(productUrl);

        if(!scrapedProduct) return;

        let product = scrapedProduct;

        const existingProduct = await Product.findOne({url: scrapedProduct.url});

        if(existingProduct){
            const updatedPriceHistory = [
                ...existingProduct.priceHistory,
                {price: scrapedProduct.currentPrice},
            ]

            product = {
                ...scrapedProduct,
                priceHistory: updatedPriceHistory,
                lowestPrice: getLowestPrice(updatedPriceHistory),
                highestPrice: getHighestPrice(updatedPriceHistory),
                averagePrice: getAveragePrice(updatedPriceHistory),
            }
        }

        const newProduct = await Product.findOneAndUpdate(
            {url: scrapedProduct.url},
            product,
            {upsert: true, new: true},
        );

        // revalidatePath(`/products/${newProduct._id}`);

    } catch (error) {
        console.log(`Failed to create or update product: ${error.message}`);
    }
}

const addUserEmailToProduct = async (productId, userEmail) => {
    try {
        const product = await Product.findById(productId);

        if(!product) return;

        const userExists = product.users.some((user) => user.email === userEmail);

        if(!userExists) {
            product.users.push({email: userEmail});

            await product.save();

            const emailContent = await generateEmailBody(product, "WELCOME");

            await sendEmail(emailContent, [userEmail]);
        }
    } catch (error) {
        console.log(`Error adding email ${error.message}`);
    }
}

module.exports = {
    scrapeAndStoreProduct,
    addUserEmailToProduct,
}