🧱 PRODUCTS / TOOLS USED (VERY IMPORTANT)
1️⃣ Google Trends
WHY?

To know what people are searching right now

Gives real demand topics

HOW WE USE IT?

Using google-trends-api (Node.js library)

No API key needed

2️⃣ Node.js
WHY?

Runs backend code

Automates everything

Calls AI + Google Trends

Runs cron jobs

3️⃣ OpenAI API
WHY?

Writes human-like SEO articles

Converts trends → blog titles

Writes 1200+ word content

WHAT MODEL?

gpt-4o-mini (cheap + good for SEO)

4️⃣ Database (MongoDB)
WHY?

Store articles

Create SEO URLs

Generate sitemap

5️⃣ Google Search Console
WHY?

Google indexing

SEO monitoring

Sitemap submission

🔁 COMPLETE PROCESS FLOW (STEP BY STEP)
Google Trends
   ↓
Node.js fetches trending topic
   ↓
AI converts topic → SEO title
   ↓
AI writes full article
   ↓
Article saved in DB
   ↓
Website publishes page
   ↓
Google indexes it

✍️ PROMPT 1: TREND → SEO BLOG TITLE
🔹 USED PRODUCT

👉 OpenAI API

🔹 INPUT (from Google Trends)
Trending Topic: "AI tools for students"

🔥 EXACT PROMPT
You are an SEO expert.

Convert this trending topic into an evergreen blog title.

Trending topic: "AI tools for students"

Rules:
- Add year (2026)
- Informational
- SEO friendly
- No words like today, breaking, live
- Click-worthy

Return ONLY one title.

✅ OUTPUT
Best AI Tools for Students in 2026 (Free & Paid)

✍️ PROMPT 2: FULL SEO ARTICLE (MAIN PROMPT)
🔹 USED PRODUCT

👉 OpenAI API

🔥 FINAL MASTER PROMPT (USE THIS EXACTLY)
You are a professional human SEO content writer.

Write a long-form blog article.

TITLE: Best AI Tools for Students in 2026
PRIMARY KEYWORD: AI tools for students

CONTENT RULES:
- Minimum 1200 words
- Write like a real human expert
- Simple English
- Short paragraphs (2–3 lines)
- No AI mention
- No plagiarism

STRUCTURE:
- H1 title
- H2 main sections
- H3 sub-sections
- Bullet points
- Table if helpful

SEO RULES:
- Keyword in first 100 words
- Keyword in at least 3 H2 headings
- Use related keywords naturally

EXTRA:
- Meta title (60 chars)
- Meta description (160 chars)
- URL slug
- 5 FAQs
- Conclusion with CTA

OUTPUT FORMAT:
- Clean Markdown

🧠 PROMPT 3 (OPTIONAL BUT POWERFUL): META ONLY
Generate:
1. SEO meta title (max 60 characters)
2. Meta description (max 160 characters)
3. URL slug

🧠 PROMPT 4 (OPTIONAL): INTERNAL LINKING
Suggest 5 internal link anchor texts
for a blog about "AI tools for students".

⏰ AUTOMATION (CRON JOB)
USED PRODUCT

👉 Node.js (node-cron)

Example
0 9 * * *


Meaning:

Runs every day at 9 AM

Fully automatic

🌍 WEBSITE PUBLISHING
URL FORMAT
/blog/best-ai-tools-for-students-2026

Why Google likes it?

Clean URL

Long content

Real search intent

🔍 GOOGLE INDEXING PROCESS

Create sitemap.xml

Submit once in Google Search Console

Done ✅
Google automatically indexes new posts


Perfect 👍
Below are **READY-TO-USE, COPY-PASTE PROMPTS** you can directly give to **any AI (ChatGPT / OpenAI / Claude / Cursor)** to **DEVELOP A COMPLETE WEBSITE USING AI**.

These are **development prompts**, not blog prompts.

---

## 🧠 WHAT YOU ARE DOING

> You are **using AI as a developer** to build a **real production website**
> (frontend + backend + SEO + automation).

![Image](https://media.excellentwebworld.com/wp-content/uploads/2025/07/07085444/AI-Development-Process-Key-Stages.webp)

![Image](https://www.spaceo.ca/_next/image/?q=75\&url=https%3A%2F%2Fwp.spaceo.ca%2Fwp-content%2Fuploads%2F2024%2F08%2FArchitecture-of-Full-Stack-Web-Application.jpg\&w=3840)

![Image](https://media.geeksforgeeks.org/wp-content/uploads/20211017212721/NWAGFGdrawio-660x284.png)

![Image](https://litslink.com/wp-content/uploads/2021/07/Node.js-Architecture-Chart.png)

---

# 🔹 PROMPT 1: SYSTEM / ROLE PROMPT (MOST IMPORTANT)

👉 **Paste this FIRST**

You are a senior full-stack software engineer with 10+ years of experience.

You specialize in:

* Node.js backend
* SEO-friendly websites
* Scalable architecture
* Clean, production-ready code
* Best practices

You think step-by-step before writing code.
You always explain file structure, logic, and decisions.
You never give incomplete code.
You build like a real startup engineer.

---

# 🔹 PROMPT 2: WEBSITE REQUIREMENT PROMPT (CORE)

👉 **Paste after Prompt 1**

Build a complete SEO-friendly content website using AI automation.

WEBSITE TYPE:

* Automated blog / content website

TECH STACK:

* Backend: Node.js + Express
* Database: MongoDB
* Frontend: Server-side rendered pages
* Hosting: VPS / Vercel
* SEO optimized

CORE FEATURES:

1. Dynamic blog pages (/blog/slug)
2. Homepage with latest articles
3. Sitemap.xml auto-generated
4. Fast loading & clean URLs
5. Google-friendly structure

AUTOMATION:

* AI generates articles automatically
* Articles are saved in database
* Pages publish without human input

DELIVERABLES:

* Folder structure
* Database schema
* API routes
* Page rendering logic
* SEO best practices

---

# 🔹 PROMPT 3: AI CONTENT GENERATION PROMPT (ARTICLE ENGINE)

👉 **This is used inside backend**

Design an AI content generation system.

REQUIREMENTS:

* Use AI to write long-form SEO articles
* Each article minimum 1200 words
* Human-like writing
* No AI mention
* No plagiarism

ARTICLE STRUCTURE:

* H1 title
* H2 sections
* H3 sub-sections
* Bullet points
* FAQ section
* Conclusion with CTA

SEO REQUIREMENTS:

* Keyword in first 100 words
* Keyword in headings
* Meta title & description
* Clean URL slug

OUTPUT:

* Markdown content
* Meta data
* FAQ list

---

# 🔹 PROMPT 4: GOOGLE TRENDS → TITLE LOGIC PROMPT

👉 **Used for topic selection**

Create logic to convert trending search topics into evergreen SEO blog titles.

INPUT:

* Raw trending keyword from Google Trends

RULES:

* Convert news/trending topic into informational blog
* Add year (2026)
* Remove words like today, breaking, live
* Make it SEO-friendly & clickable

OUTPUT:

* ONE optimized blog title
* Suggested primary keyword

---

# 🔹 PROMPT 5: BACKEND AUTOMATION PROMPT (CRON + FLOW)

Create backend automation logic.

AUTOMATION FLOW:

1. Daily cron job runs
2. Fetch trending topic
3. Convert topic to SEO title
4. Generate article using AI
5. Save article in database
6. Publish article automatically

REQUIREMENTS:

* Error handling
* Duplicate content protection
* Logging
* Scalable design

OUTPUT:

* Cron logic
* Service functions
* Clear explanation

---

# 🔹 PROMPT 6: SEO + GOOGLE INDEXING PROMPT

Implement SEO and Google indexing.

REQUIREMENTS:

* Generate sitemap.xml dynamically
* SEO-friendly URLs
* Meta tags on every page
* Fast page load
* Mobile friendly

Explain:

* How Google crawls pages
* How sitemap works
* How to submit to Google Search Console

---

# 🔹 PROMPT 7: FINAL PRODUCTION CHECK PROMPT

👉 **VERY IMPORTANT – use at end**

Review the entire system as a production engineer.

Check for:

* SEO safety
* Performance issues
* Security problems
* Scalability
* Google policy compliance

Suggest improvements if needed.
Do not simplify.
Think like a real company launching this site.

---

## 🧱 TOOLS THIS PROMPT SET USES (CLEAR)

* **Node.js** → backend & automation
* **OpenAI** → content + logic
* **Google Trends** → demand topics
* **MongoDB** → content storage
* **Google Search Console** → indexing

---

## ✅ HOW TO USE (SIMPLE)

1️⃣ Open AI tool (ChatGPT / Cursor / Claude)
2️⃣ Paste **Prompt 1 → Prompt 7 in order**
3️⃣ Answer follow-up questions
4️⃣ Copy generated code
5️⃣ Deploy website

---

