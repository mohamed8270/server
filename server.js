const express = require('express');
const cors = require('cors');
const Product = require('./models/product.model');
const connectToDB = require('./mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();
const isValidAmazonProductURL = require('./lib/utils/valid_url_check');
const scrapeAmazonProduct = require('./lib/scraper');

const app = express();
app.use(cors());
app.use(express.json());
const port  = process.env.PORT || 3000;
const localhostUrl = `http://localhost:${port}`;

// Products Database Fetch
app.get('/products', async (req, res) => {
    try {
        connectToDB();
        const amazonProducts = await Product.find();
        res.json(amazonProducts);
    } catch (error) {
        res.status(500).send({ message: "An error occurred while fetching the products", error: error.message });
    }
});

// Product details by ID
app.get('/products/details/:id', async (req, res) => {
    try {
        connectToDB();
        const productID = req.params.id;
        const amazonproduct = await Product.findById(productID);
        if(!amazonproduct){
            res.status(404).json({message: 'Procut Details not found'});
        }
        res.json(amazonproduct);
    } catch (error) {
        res.status(500).send({ message: "An error occurred while fetching the product details", error: error.message });
    }
});

// Get similar products
app.get('/products/similar/product/:id', async (req, res) => {
    try {
        connectToDB();
        const productID = req.params.id;
        const similarproduct = await Product.find({_id: {$ne: productID},}).limit(10);
        if(!similarproduct){
            res.status(404).json({message: 'Product not found'});
        }
        res.json(similarproduct);
    } catch (error) {
        res.status(500).send({ message: "An error occurred while fetching the product details", error: error.message });
    }
});

// Insert amazon product
app.post('/products/amazon', async (req, res) => {
    const amazonurl = req.body.url;
    console.log(amazonurl);
    try {
        console.log("Hello");
        const validURL = isValidAmazonProductURL(amazonurl);
        console.log(validURL);
        if(!validURL){
            res.status(404).json({message: "Enter a valid amazon URL"});
        }
        const scrapeamazondata = await scrapeAmazonProduct(amazonurl);
        console.log(scrapeamazondata);
    } catch (error) {
        res.status(500).send({ message: "An error occurred while getting the product details", error: error.message });
    }
});

// GenAI
const apikey = process.env.API_KEY;
const genAI = new GoogleGenerativeAI(apikey);
const model = genAI.getGenerativeModel({model: "gemini-pro"});

app.post('/generate', async (req, res) => {
    const prompt = req.body.prompt;
    console.log(prompt);
    // const prompt = "Write me syllabus for college level algebra";

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        res.json({
            status: 'success',
            text,
        });
    } catch (error) {
        res.json({
            status: 'error',
            message: error.message,
        });
    }
});

app.listen(port, () => {
    console.log(`server listening on port ${port}`);
    console.log(`Localhost URL: ${localhostUrl}`);
})