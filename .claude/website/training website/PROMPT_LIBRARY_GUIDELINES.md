# PROMPT_LIBRARY_GUIDELINES.md

## Teacher Prompt Library – Implementation Guidelines

### Project Goal
Build a dedicated module in the website called:

**ספריית פרומפטים למורים (Teacher Prompt Library)**

This module should serve as a practical prompt library for educators who use AI tools in teaching, planning, assessment, feedback, and classroom management.

The goal is to let any teacher:

1. Enter the prompts page
2. Find a relevant prompt quickly
3. Copy it with one click
4. Paste it into ChatGPT or another AI tool
5. Use it immediately

---

## Route
Create a dedicated page at:

`/prompts`

Page title in Hebrew:

**ספריית פרומפטים למורים**

Short intro text under the title:

ספריית הפרומפטים מרכזת ניסוחים מוכנים לשימוש בבינה מלאכותית עבור אנשי חינוך.  
ניתן לבחור פרומפט לפי סוג המשימה, להעתיק אותו ולהשתמש בו מיד בכלי AI שונים.

---

## Functional Requirements

### Main features
The prompts page must include:

- clear page header
- short explanation text
- search bar
- category filters
- audience filter
- difficulty filter
- responsive prompt cards grid
- copy-to-clipboard button on each prompt

---

## Prompt Categories
Create at least the following categories:

- תכנון שיעור
- יצירת דפי עבודה
- יצירת מצגות
- שאלות ותרגול
- הערכה ומשוב
- דיפרנציאציה
- פעילויות כיתה
- למידה עצמאית
- חשיבה ביקורתית
- חיסכון בזמן למורים

Each prompt must belong to at least one category.

---

## Data Layer
Store prompts in a dedicated data file.

Recommended file:

`src/data/prompts.ts`

Do not hardcode prompt content inside UI components.

Use a typed structure.

### Prompt type
```ts
export type PromptDifficulty = "beginner" | "intermediate" | "advanced";

export type PromptItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  promptText: string;
  audience: string;
  difficulty: PromptDifficulty;
};