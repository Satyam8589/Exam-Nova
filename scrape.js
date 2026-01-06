import axios from "axios";
import * as cheerio from "cheerio";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://govtjobsalert.in/";

async function fetchHTML(url) {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "Mozilla/5.0"
    }
  });
  return cheerio.load(data);
}

/* ---------------------------
   STEP 1: GET LATEST JOB LINKS
-----------------------------*/
async function getLatestJobLinks() {
  const $ = await fetchHTML(BASE_URL);
  const links = [];

  // Select all h3 headings that contain job links
  $("h3 a").each((_, el) => {
    const href = $(el).attr("href");
    const title = $(el).text().trim();

    if (href && title && href.includes("govtjobsalert.in")) {
      links.push({
        title: title,
        url: href
      });
    }
  });

  // Remove duplicates and limit to first 50 jobs
  const uniqueLinks = [...new Map(links.map(j => [j.url, j])).values()];
  return uniqueLinks.slice(0, 50);
}

/* ---------------------------
   STEP 2: PARSE JOB DETAILS
-----------------------------*/
async function parseJobDetails(job) {
  const $ = await fetchHTML(job.url);
  const data = {
    title: job.title,
    url: job.url,
    organization: null,
    importantDates: {},
    applicationFee: {},
    ageLimit: null,
    eligibility: [],
    salary: null,
    selectionProcess: [],
    applyLink: job.url,
    description: ""
  };

  // Extract from main content
  const mainContent = $("article, .entry-content, .post-content").first();
  
  // Try to extract structured data from tables or lists
  $("table tr, ul li, ol li").each((_, el) => {
    const text = $(el).text().trim();
    const textLower = text.toLowerCase();

    if (textLower.includes("organization") || textLower.includes("conducting body")) {
      data.organization = text.split(":")[1]?.trim() || null;
    }
    if (textLower.includes("age limit")) {
      data.ageLimit = text.split(":")[1]?.trim() || null;
    }
    if (textLower.includes("salary") || textLower.includes("pay scale")) {
      data.salary = text.split(":")[1]?.trim() || null;
    }
    if (textLower.includes("qualification") || textLower.includes("eligibility")) {
      const qual = text.split(":")[1]?.trim();
      if (qual) data.eligibility.push(qual);
    }
    if (textLower.includes("application fee")) {
      data.applicationFee.raw = text.split(":")[1]?.trim() || null;
    }
    if (textLower.includes("last date") || textLower.includes("closing date")) {
      data.importantDates.lastDate = text.split(":")[1]?.trim() || null;
    }
    if (textLower.includes("start date") || textLower.includes("opening date")) {
      data.importantDates.startDate = text.split(":")[1]?.trim() || null;
    }
  });

  // Extract description (first 2000 chars)
  data.description = mainContent.text().replace(/\s+/g, " ").trim().slice(0, 2000);

  // Try to find apply link
  const applyButton = $("a:contains('Apply Online'), a:contains('Official Website'), a:contains('Click Here')").first();
  if (applyButton.length) {
    data.applyLink = applyButton.attr("href") || job.url;
  }

  return data;
}

/* ---------------------------
   MAIN SCRAPER
-----------------------------*/
async function scrape() {
  console.log("🔍 Fetching latest jobs from govtjobsalert.in...");
  const jobs = await getLatestJobLinks();

  console.log(`📌 Found ${jobs.length} job listings`);
  const results = [];

  for (let i = 0; i < Math.min(jobs.length, 30); i++) {
    const job = jobs[i];
    try {
      console.log(`➡️  [${i + 1}/${Math.min(jobs.length, 30)}] Scraping: ${job.title.substring(0, 60)}...`);
      const details = await parseJobDetails(job);
      results.push(details);
      
      // Add delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`❌ Failed: ${job.title}`);
      console.error(`   Error: ${err.message}`);
    }
  }

  const outputPath = path.join(__dirname, "src", "data", "jobs.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n✅ Successfully scraped ${results.length} jobs`);
  console.log(`📁 Data saved to: ${outputPath}`);
}

scrape();
