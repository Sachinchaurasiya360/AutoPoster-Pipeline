"use server";

import * as cheerio from "cheerio";

// Detect if a page likely needs JavaScript rendering
function needsJsRendering(url: string): boolean {
  const jsHeavySites = [
    "linkedin.com",
    "wellfound.com",
    "angel.co",
    "lever.co",
    "greenhouse.io",
    "workday.com",
    "myworkdayjobs.com",
  ];
  return jsHeavySites.some((site) => url.includes(site));
}

// Scrape with simple HTTP fetch + Cheerio
async function scrapeStatic(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove noise
  $("script, style, nav, footer, header, iframe, noscript").remove();

  // Extract text from common job content areas
  const selectors = [
    '[class*="job"]',
    '[class*="posting"]',
    '[class*="description"]',
    '[class*="career"]',
    '[class*="vacancy"]',
    '[id*="job"]',
    '[id*="posting"]',
    "article",
    "main",
    ".content",
    "#content",
  ];

  let text = "";
  for (const selector of selectors) {
    const el = $(selector);
    if (el.length > 0) {
      text += el.text() + "\n";
    }
  }

  // Fallback: get body text if nothing matched
  if (!text.trim()) {
    text = $("body").text();
  }

  // Clean up whitespace
  text = text.replace(/\s+/g, " ").trim();

  // Limit to first 8000 chars to stay within AI context limits
  return text.slice(0, 8000);
}

// Scrape with Playwright for JS-heavy pages
async function scrapeDynamic(url: string): Promise<string> {
  const { chromium } = await import("playwright");

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Remove noise elements
    await page.evaluate(() => {
      const selectors = ["script", "style", "nav", "footer", "header", "iframe", "noscript"];
      selectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => el.remove());
      });
    });

    const text = await page.evaluate(() => {
      const jobSelectors = [
        '[class*="job"]',
        '[class*="posting"]',
        '[class*="description"]',
        "article",
        "main",
      ];

      let content = "";
      for (const sel of jobSelectors) {
        const els = document.querySelectorAll(sel);
        els.forEach((el) => {
          content += el.textContent + "\n";
        });
      }

      if (!content.trim()) {
        content = document.body.textContent || "";
      }

      return content.replace(/\s+/g, " ").trim();
    });

    return text.slice(0, 8000);
  } finally {
    await browser.close();
  }
}

export async function scrapeJobPage(url: string): Promise<string> {
  if (needsJsRendering(url)) {
    try {
      return await scrapeDynamic(url);
    } catch {
      // Fallback to static if Playwright fails
      console.warn("Playwright scraping failed, falling back to static scraping");
      return await scrapeStatic(url);
    }
  }

  return await scrapeStatic(url);
}
