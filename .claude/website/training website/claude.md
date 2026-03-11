AI Education Knowledge Hub – Development Guidelines

This project is a Hebrew AI Education Knowledge Hub website that centralizes tutorials, tools, prompts, and practical ideas for educators who want to integrate AI into teaching and school leadership.

The site is intended primarily for:

Teachers

Homeroom teachers

Pedagogical coordinators

School leaders

Educators interested in using AI to improve teaching, learning, assessment, and workflow efficiency.

The site must be clear, calm, professional, and easy to expand over time.

Claude must follow the rules in this document when generating or modifying code.

Core Principles

Build a scalable knowledge hub, not a static website.

Code must be modular, clean, and maintainable.

Content must be data-driven, not hardcoded in components.

The site must be fully Hebrew and RTL.

Design must be modern, calm, and professional — never childish.

UX must be extremely clear for non-technical educators.

The system must allow easy addition of new content.

Technology Stack

The project must use:

Next.js (App Router)

TypeScript

Tailwind CSS

React

RTL layout

Modular component architecture

Optional libraries allowed:

shadcn/ui

lucide-react

RTL and Hebrew Requirements

The entire site must support RTL layout.

Requirements:

dir="rtl" in layout

Hebrew typography

Proper spacing and alignment

Components must visually support RTL

No broken layouts in RTL

Text should be:

clear

concise

friendly

professional

accessible to educators

Design Philosophy

The design should feel:

calm

modern

professional

minimal

structured

Avoid:

childish icons

overly colorful palettes

cluttered layouts

excessive animation

generic template look

Prefer:

whitespace

clean card layouts

subtle hover interactions

clear typography hierarchy

modern minimal icons

Color Style

Use calm and soft colors.

Preferred palette:

soft blue

sage green

white

light gray

dark text for readability

Accent colors should be subtle.

Website Structure

Main navigation must include:

Home

Start Here

Tutorials

Tools

Pedagogical Uses

Prompts

Downloads

Blog

About

Contact

Navigation must be:

clear

sticky

mobile-friendly

Page Overview
Home

Purpose:
Introduce the site and help users start quickly.

Sections:

Hero section
AI in education explanation
Quick entry buttons
Featured content
New content
CTA to explore tutorials

Start Here

Onboarding page for educators new to AI.

Include:

What is AI in education

How teachers can use it

5 simple starting uses

How to write prompts

Ethics and responsible use

Tutorials

Central tutorials hub.

Each tutorial card must include:

title

description

difficulty

duration

audience

category

Add:

search

filtering

category browsing

Tools

AI tools library.

Each tool card must include:

tool name

description

advantages

limitations

Hebrew support indicator

free/paid status

external link

related tutorial

Pedagogical Uses

Organized by teaching needs.

Examples:

lesson planning

lesson hooks

differentiation

worksheet creation

alternative assessment

practice & review

student feedback

project learning

Each section should include tools, tutorials, and prompts.

Prompts

Prompt library organized by role:

teachers

homeroom teachers

coordinators

school leaders

lesson creation

differentiation

feedback

assessment

Each prompt card includes:

prompt title

goal

copy button

example output

customization tips

Downloads

Downloadable materials such as:

presentations

worksheets

templates

prompt sheets

Google Forms

checklists

Each item should have description and download link.

Blog

Educational content updates.

Examples:

tool reviews

quick classroom ideas

AI teaching tips

comparisons between tools

About

Personal introduction page.

Include:

professional background

educational philosophy

vision for AI in education

Contact

Include:

contact form

workshop request

email

WhatsApp group invitation

WhatsApp Community Section

The site must include a WhatsApp community invitation block.

Content should appear in relevant sections (Home and Contact).

Text:

נעים מאוד, אני מיטל, מנהלת בית הספר אורט בית הערבה, ופועלת מתוך אמונה שחינוך טוב הוא כזה שמצליח לפתוח הזדמנויות לכל תלמיד.

אני מאמינה מאוד בשילוב טכנולוגיה ובינה מלאכותית כדי לחזק הוראה משמעותית ולהקל על עבודת הצוות החינוכי.

בקבוצת הווטסאפ אשתף מדי פעם:

• מצגות קצרות להסבר על כלים
• דוגמאות לשימוש פדגוגי בכיתה
• רעיונות ליישום מהיר למורים
• הדרכות שאני מעבירה וניתן להירשם אליהן

🔹 להצטרפות לקבוצה:
https://chat.whatsapp.com/HhAL8L2I2jCH1CW1Iehr4J?mode=hq1tswa

This block should be styled as a highlighted call-to-action card.

Component System

Reusable components must include:

Navbar

Footer

Hero

SectionHeader

TutorialCard

ToolCard

PromptCard

DownloadCard

BlogCard

TagBadge

SearchBar

Filters

CTASection

ContactForm

WhatsAppCTA

Data Driven Content

All content must be stored in data files.

Example structure:

data/
tutorials.ts
tools.ts
prompts.ts
downloads.ts
blog.ts
pedagogy.ts

Components should map over these datasets.

Never hardcode lists inside UI components.

TypeScript Models

Define types such as:

Tutorial
Tool
Prompt
DownloadItem
BlogPost
PedagogyCategory

Use strict typing.

UX Principles

Navigation must be intuitive.

Users should always know:

where they are

what to do next

how to find relevant content

Use:

clear headings

card layouts

simple filters

visible CTAs

Responsive Design

The site must work well on:

desktop

tablet

mobile

Mobile layout should:

stack cards

simplify navigation

maintain RTL integrity

Code Quality

Code must be:

clean

modular

readable

scalable

Avoid:

duplicate logic

overly large components

hardcoded content

messy folder structures

SEO Basics

Each page must include:

title

description

semantic headings

structured layout

Accessibility

Ensure:

good color contrast

accessible buttons

semantic HTML

keyboard navigation support

Development Expectations

Claude should act as:

senior frontend developer

UX designer

system architect

Before writing code:

design architecture

define data models

plan components

then implement

Expected Output

When implementing features, Claude should:

create proper components

maintain RTL support

use TypeScript

respect project architecture

avoid breaking existing structure
You are building a multi-file project.

IMPORTANT OUTPUT RULES:

1. Never generate a very long response.
2. If the output may be long, split it into multiple steps.
3. Generate files one by one.
4. Do not exceed the output token limit.

WORKFLOW:

Step 1 – First show the project structure only.

Example:

project-name/
index.html
styles.css
script.js
components/
data/

Step 2 – Wait for confirmation before generating files.

Step 3 – Generate files ONE BY ONE in separate responses.

Each response should include only one file.

Example format:

FILE: index.html
```html
code here

Step 4 – After each file ask if you should continue.

Step 5 – Never generate the entire project in one response.

DESIGN RULES:

• Use modern and clean UI
• Avoid childish icons
• Use minimalistic modern icons
• Interface should feel suitable for high school students
• Keep layout clear and readable
• Prefer simple and accessible design

CONTENT RULES (for educational content):

• Language should be simple and clear
• Break explanations into small steps
• After explanations add short understanding questions
• Prefer multiple choice questions
• Support students with attention difficulties
• Use visuals where possible

PROJECT OUTPUT:

At the end also generate:

A single HTML page that organizes the outputs in tabs

Separate export files if needed (forms, worksheets etc.)

Remember:
Always split long outputs.
Never exceed the token limit.


---

## למה הפרומפט הזה מאוד יעיל
הוא גורם לקלוד:

- לבנות **מבנה פרויקט קודם**
- לחכות לאישור
- ליצור **קובץ אחד בכל פעם**
- לא לעבור את מגבלת ה-token

וזה בדיוק מה שמונע את השגיאה שקיבלת.

---

💡 טיפ קטן מניסיון:  
אם את עובדת הרבה עם Claude Code, כדאי ליצור גם קובץ נוסף בשם:

`OUTPUT_LIMIT_RULE.md`

שבו כתוב רק:


Never generate more than one file per response.
If output is long, split into multiple responses.