const Product = require("../../models/product.model");
const connectToDB = require("../../mongoose");
const { generateEmailBody, sendEmail } = require("../nodemailer");
const scrapeAmazonProduct = require("../scraper");
const { getLowestPrice, getHighestPrice, getAveragePrice, getEmailNotifType } = require("../utils/utils");

const GET = async () => {
    try {
        connectToDB();

        const products = await Product.find({});

        if(!products) throw new Error("No product fetched");

        // ===================== 1 SCRAPE LATEST PRODUCT DETAILS & UPDATE DB
        const updatedProducts = await Promise.all(
            products.map(async (currentProduct) => {
                // scrape product
                const scrapedProduct = await scrapeAmazonProduct(currentProduct.url);

                if(!scrapedProduct) return;

                const updatedPriceHistory = [
                    ...currentProduct.priceHistory,
                    {
                        price: scrapedProduct.currentPrice,
                    },
                ];

                const product = {
                    ...scrapedProduct,
                    priceHistory: updatedPriceHistory,
                    lowestPrice: getLowestPrice(updatedPriceHistory),
                    highestPrice: getHighestPrice(updatedPriceHistory),
                    averagePrice: getAveragePrice(updatedPriceHistory),
                };

                // update products in db
                const updatedProduct = await Product.findOneAndUpdate(
                    {
                        url: product.url,
                    },
                    product
                );

                // ======================== 2 CHECK EACH PRODUCTS STATUS & SEND MAIL
                const emailNotifyType = getEmailNotifType(
                    scrapedProduct,
                    currentProduct,
                );

                if(emailNotifyType && updatedProduct.users.length > 0) {
                    const productInfo = {
                        title: updatedProduct.title,
                        url: updatedProduct.url,
                    };

                    // construct emailcontent
                    const emailContent = await generateEmailBody(productInfo, emailNotifyType);
                    // Get array of users email
                    const userEmails = updatedProduct.users.map((user) => user.email);
                    // Send email notification
                    await sendEmail(emailContent, userEmails);
                }

                return updatedProduct;
            })
        );

        return res.json({
            message: "Ok",
            data: updatedProducts,
        });
    } catch (error) {
        throw new Error(`Failed to get all products: ${error.message}`);
    }
}

module.exports = {GET};