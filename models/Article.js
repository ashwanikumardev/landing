const mongoose = require('mongoose');
const slugify = require('slugify');

const articleSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        index: true,
    },
    content: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
        enum: ['Technology', 'Health', 'Finance', 'Business', 'Lifestyle', 'Education', 'Travel', 'Food', 'Entertainment'],
        index: true,
    },
    metaTitle: {
        type: String,
        required: true,
        maxlength: 60,
    },
    metaDescription: {
        type: String,
        required: true,
        maxlength: 160,
    },
    keyword: {
        type: String,
        required: true,
    },
    faqs: [{
        question: String,
        answer: String,
    }],
    trendingTopic: {
        type: String,
        required: true,
    },
    publishedAt: {
        type: Date,
        default: Date.now,
    },
    isPublished: {
        type: Boolean,
        default: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    thumbnail: {
        type: String,
        default: null,
    },
    thumbnailGeneratedAt: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

// Index for better query performance
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ isPublished: 1, publishedAt: -1 });

// Pre-save hook to generate slug if not provided
articleSchema.pre('save', function (next) {
    if (!this.slug && this.title) {
        this.slug = slugify(this.title, {
            lower: true,
            strict: true,
            remove: /[*+~.()'"!:@]/g,
        });
    }
    next();
});

// Method to get excerpt
articleSchema.methods.getExcerpt = function (length = 200) {
    const plainText = this.content.replace(/[#*`\[\]]/g, '');
    return plainText.length > length
        ? plainText.substring(0, length) + '...'
        : plainText;
};

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;
