---
name: SEO Optimizer
description: Search Engine Optimization specialist for content strategy, technical SEO, keyword research, and ranking improvements. Use when optimizing website content, improving search rankings, conducting keyword analysis, or implementing SEO best practices. Expert in on-page SEO, meta tags, schema markup, and Core Web Vitals.
---

# SEO Optimizer

Comprehensive guidance for search engine optimization across content, technical implementation, and strategic planning.

## When to Use This Skill

- Optimizing website content for search engines
- Conducting keyword research and analysis
- Implementing technical SEO improvements
- Creating SEO-friendly meta tags and descriptions
- Auditing websites for SEO issues
- Improving Core Web Vitals and page speed
- Implementing schema markup (structured data)
- Planning content strategy for organic traffic

## Keyword Research & Strategy

**Primary Keyword Selection:**
- Focus on search intent (informational, navigational, transactional, commercial)
- Balance search volume with competition
- Target long-tail keywords for quick wins

**Content Optimization Formula:**
- Primary keyword: 1-2% density (natural placement)
- Include in: Title tag, H1, first paragraph, URL, meta description
- Use semantic variations and related terms

## On-Page SEO

**Title Tag:** Under 60 characters, keyword near beginning, compelling
```html
<title>Ultimate Guide to React Hooks - Learn useEffect & useState</title>
```

**Meta Description:** 150-160 chars, includes keywords, call-to-action
```html
<meta name="description" content="Master React Hooks with our comprehensive guide. Learn useState, useEffect, and custom hooks with practical examples.">
```

**URL Structure:**
```
/blog/react-hooks-guide
/products/running-shoes
```

**Image Optimization:**
```html
<img src="/images/diagram-800w.webp" alt="Descriptive keyword-rich alt text" width="800" height="600" loading="lazy" />
```

## Technical SEO

**Schema Markup:**
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Complete Guide to React Hooks",
  "datePublished": "2024-01-15",
  "author": { "@type": "Person", "name": "Jane Developer" }
}
```

**Common Schema Types:** Article, Product, FAQ, HowTo, Organization, LocalBusiness, BreadcrumbList, Review

**Robots.txt:**
```
User-agent: *
Disallow: /admin/
Sitemap: https://example.com/sitemap.xml
```

**Canonical Tags:**
```html
<link rel="canonical" href="https://example.com/original-page">
```

## Core Web Vitals

- **LCP** (< 2.5s): Optimize images, use CDN, minimize render-blocking
- **FID** (< 100ms): Minimize JS execution, defer non-critical scripts
- **CLS** (< 0.1): Set image dimensions, avoid inserting content above existing

**Page Speed:**
```html
<link rel="preload" href="/fonts/main.woff2" as="font" crossorigin>
<script src="/js/analytics.js" async></script>
<script src="/js/main.js" defer></script>
```

## Content Quality (E-E-A-T)

- Demonstrate author expertise with credentials
- Cite authoritative sources
- Keep content accurate and up-to-date
- Show real experience and original insights

**Content Length Guidelines:**
- Blog posts: 1,500-2,500 words
- Product pages: 300-500 words minimum
- Category pages: 500-1,000 words

## Internal Linking

- Use descriptive anchor text
- 3-5 internal links per 1,000 words
- Maintain logical hierarchy
- Update old content with new links

## Topic Clusters & Pillar Pages

```
Pillar Page: "Complete Guide to React"
  ├── Cluster: "React Hooks Tutorial"
  ├── Cluster: "React Context API Guide"
  ├── Cluster: "React Performance Optimization"
  └── Cluster: "React Testing Best Practices"
```

## SEO Content Checklist

- [ ] Primary keyword in title tag (under 60 chars)
- [ ] Meta description (150-160 chars, compelling)
- [ ] H1 tag with primary keyword
- [ ] URL slug optimized and readable
- [ ] Images compressed with descriptive alt text
- [ ] 3-5 internal links to relevant content
- [ ] Schema markup implemented
- [ ] Mobile-friendly and responsive
- [ ] Page speed optimized (< 3s load time)
- [ ] Canonical tag set correctly
- [ ] Social sharing meta tags (Open Graph, Twitter Card)

## Local SEO

```json
{
  "@type": "LocalBusiness",
  "name": "Tech Solutions Inc",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "San Francisco"
  },
  "telephone": "+1-415-555-0123"
}
```

## Monitoring Tools

- Google Search Console (performance, indexing)
- Google Analytics 4 (traffic, conversions)
- PageSpeed Insights (Core Web Vitals)
- Ahrefs/SEMrush (keywords, backlinks)
- Screaming Frog (technical audits)
