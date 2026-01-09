require('dotenv').config();
const mongoose = require('mongoose');
const Article = require('../models/Article');
const slugify = require('slugify');

const sampleArticles = [
    {
        title: "Top 10 Technology Trends Shaping 2026",
        category: "Technology",
        trendingTopic: "Technology trends",
        content: `# Top 10 Technology Trends Shaping 2026

The technology landscape is evolving at an unprecedented pace. Here are the top trends defining 2026.

## 1. Artificial Intelligence Integration

AI is no longer a futuristic concept—it's embedded in our daily lives. From smart assistants to automated workflows, AI is transforming how we work and live.

## 2. Quantum Computing Advances

Quantum computers are moving from research labs to practical applications, solving complex problems that classical computers cannot handle.

## 3. 5G and Beyond

The rollout of 5G networks continues globally, enabling faster connectivity and powering IoT devices.

## 4. Sustainable Tech

Green technology is becoming a priority, with companies focusing on renewable energy and eco-friendly solutions.

## 5. Cybersecurity Evolution

As threats become more sophisticated, cybersecurity measures are advancing to protect our digital infrastructure.

## 6. Extended Reality (XR)

Virtual and augmented reality technologies are creating immersive experiences in gaming, education, and business.

## 7. Edge Computing

Processing data closer to its source reduces latency and improves efficiency in IoT applications.

## 8. Blockchain Applications

Beyond cryptocurrency, blockchain is revolutionizing supply chains, healthcare, and finance.

## 9. Autonomous Vehicles

Self-driving technology continues to advance, promising safer and more efficient transportation.

## 10. Biotechnology Innovations

The intersection of biology and technology is leading to breakthroughs in healthcare and agriculture.`,
        metaTitle: "Top 10 Technology Trends Shaping 2026 | AugCodex",
        metaDescription: "Discover the most important technology trends of 2026, from AI integration to quantum computing and sustainable tech solutions.",
        keyword: "technology trends 2026",
        faqs: [
            {
                question: "What is the most important tech trend in 2026?",
                answer: "AI integration stands out as the most transformative trend, affecting nearly every industry and aspect of daily life."
            },
            {
                question: "How will 5G impact technology?",
                answer: "5G enables faster connectivity, lower latency, and supports the growth of IoT devices and smart cities."
            }
        ]
    },
    {
        title: "Essential Health Tips for a Better Lifestyle in 2026",
        category: "Health",
        trendingTopic: "Health and wellness",
        content: `# Essential Health Tips for a Better Lifestyle in 2026

Your health is your wealth. Here are essential tips to maintain optimal health in 2026.

## Nutrition Fundamentals

Eating a balanced diet rich in fruits, vegetables, whole grains, and lean proteins is the foundation of good health.

### Key Nutritional Guidelines

- Eat 5-7 servings of fruits and vegetables daily
- Choose whole grains over refined grains
- Include lean proteins in every meal
- Stay hydrated with 8-10 glasses of water daily

## Regular Exercise

Physical activity is crucial for maintaining a healthy body and mind.

### Recommended Exercise Routine

- 150 minutes of moderate aerobic activity per week
- Strength training 2-3 times per week
- Flexibility exercises daily
- Include rest days for recovery

## Mental Health Matters

Mental wellness is as important as physical health.

### Mental Health Practices

- Practice mindfulness and meditation
- Maintain social connections
- Get 7-9 hours of quality sleep
- Manage stress through healthy coping mechanisms

## Preventive Care

Regular check-ups and screenings can catch health issues early.

### Essential Health Screenings

- Annual physical examinations
- Dental check-ups twice yearly
- Vision and hearing tests
- Age-appropriate cancer screenings

## Conclusion

Implementing these health tips can significantly improve your quality of life. Start small and build sustainable habits.`,
        metaTitle: "Essential Health Tips for Better Lifestyle 2026 | AugCodex",
        metaDescription: "Discover essential health tips including nutrition, exercise, mental wellness, and preventive care for a healthier lifestyle in 2026.",
        keyword: "health tips 2026",
        faqs: [
            {
                question: "How much exercise do I need per week?",
                answer: "Adults should aim for at least 150 minutes of moderate aerobic activity or 75 minutes of vigorous activity per week, plus strength training twice weekly."
            },
            {
                question: "What are the most important health screenings?",
                answer: "Essential screenings include annual physicals, blood pressure checks, cholesterol tests, and age-appropriate cancer screenings."
            }
        ]
    },
    {
        title: "Smart Finance Strategies for Building Wealth in 2026",
        category: "Finance",
        trendingTopic: "Personal finance",
        content: `# Smart Finance Strategies for Building Wealth in 2026

Financial freedom starts with smart money management. Here's your guide to building wealth in 2026.

## Budgeting Basics

Creating and sticking to a budget is the first step toward financial success.

### The 50/30/20 Rule

- 50% for needs (housing, food, utilities)
- 30% for wants (entertainment, dining out)
- 20% for savings and debt repayment

## Emergency Fund

Build a safety net to protect against unexpected expenses.

### Emergency Fund Guidelines

- Save 3-6 months of living expenses
- Keep funds in a high-yield savings account
- Only use for true emergencies
- Replenish after withdrawals

## Investment Strategies

Growing your wealth requires smart investing.

### Investment Principles

- Start early to benefit from compound interest
- Diversify your portfolio
- Consider index funds for long-term growth
- Rebalance annually

## Debt Management

Eliminating high-interest debt accelerates wealth building.

### Debt Reduction Strategies

- Pay off high-interest debt first
- Consider debt consolidation
- Avoid new debt while paying off existing balances
- Negotiate lower interest rates when possible

## Retirement Planning

It's never too early to plan for retirement.

### Retirement Savings Tips

- Contribute to employer-matched 401(k)
- Open an IRA for additional savings
- Increase contributions with salary raises
- Review and adjust plans annually

## Conclusion

Building wealth requires discipline, patience, and smart financial decisions. Start implementing these strategies today.`,
        metaTitle: "Smart Finance Strategies for Building Wealth 2026 | AugCodex",
        metaDescription: "Learn effective finance strategies including budgeting, investing, debt management, and retirement planning to build wealth in 2026.",
        keyword: "finance strategies 2026",
        faqs: [
            {
                question: "How much should I save for emergencies?",
                answer: "Financial experts recommend saving 3-6 months of living expenses in an easily accessible emergency fund."
            },
            {
                question: "When should I start investing?",
                answer: "The best time to start investing is as soon as possible to maximize the benefits of compound interest over time."
            }
        ]
    }
];

async function createSampleArticles() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected!\n');

        for (const articleData of sampleArticles) {
            const slug = slugify(articleData.title, { lower: true, strict: true });

            // Check if article already exists
            const existing = await Article.findOne({ slug });
            if (existing) {
                console.log(`✓ Article already exists: ${articleData.title}`);
                continue;
            }

            const article = new Article({
                ...articleData,
                slug,
                isPublished: true,
                publishedAt: new Date(),
                views: Math.floor(Math.random() * 100)
            });

            await article.save();
            console.log(`✓ Created: ${articleData.title}`);
        }

        console.log('\n✓ All sample articles created!');
        console.log('Visit https://www.augcodex.site to see them!');

        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createSampleArticles();
