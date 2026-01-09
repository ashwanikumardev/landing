require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('./models/Article');

async function checkArticles() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB\n');

        const count = await Article.countDocuments();
        const articles = await Article.find().sort({ publishedAt: -1 }).limit(10).select('title category publishedAt');

        console.log(`Total articles: ${count}\n`);
        console.log('Recent articles:');
        articles.forEach((a, i) => {
            console.log(`${i + 1}. [${a.category}] ${a.title}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkArticles();
