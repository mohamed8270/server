const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Product = require('./models/product.model');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
const port  = process.env.PORT || 3000;
const localhostUrl = `http://localhost:${port}`;

//Connect to MongoDB
mongoose.connect(process.env.MONGO_DB,
{useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log('MongoDB is Connected'));

// Products Database Fetch
app.get('/products', async (req, res) => {
    try {
        const amazonProducts = await Product.find();
        res.json(amazonProducts);
    } catch (error) {
        res.status(500).send({ message: "An error occurred while fetching the courses", error: error.message });
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
        const response = await result.response;
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