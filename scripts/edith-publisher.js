import fs from "fs";
import path from "path";
import { execSync } from "child_process";

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeYamlString(value) {
  return String(value).replace(/"/g, '\\"');
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

const overwrite = hasFlag("--overwrite");
const runBuild = hasFlag("--build");
const runGit = hasFlag("--git");

const jsonArg = process.argv.find((arg) => arg.trim().startsWith("{"));

if (!jsonArg) {
  console.error(
    "Usage: node scripts/edith-publisher.js '<json>' [--overwrite] [--build] [--git]"
  );
  process.exit(1);
}

let input;
try {
  input = JSON.parse(jsonArg);
} catch (error) {
  console.error("Invalid JSON input.");
  process.exit(1);
}

const requiredFields = ["title", "description", "game", "slug", "category"];
const missing = requiredFields.filter(
  (field) => !input[field] || String(input[field]).trim() === ""
);

if (missing.length > 0) {
  console.error(`Missing required fields: ${missing.join(", ")}`);
  process.exit(1);
}

const title = String(input.title).trim();
const description = String(input.description).trim();
const game = slugify(input.game);
const slug = slugify(input.slug);
const category = String(input.category).trim();
const tags = Array.isArray(input.tags)
  ? input.tags.map((t) => String(t).trim()).filter(Boolean)
  : [];
const draft = input.draft === true;
const today = new Date().toISOString().slice(0, 10);

const sections =
  Array.isArray(input.sections) && input.sections.length > 0
    ? input.sections
    : [
        { heading: "Overview", body: "Add overview here." },
        { heading: "How to Get It", body: "Explain the best method here." },
        { heading: "Best Strategy", body: "Explain the optimal strategy here." },
        { heading: "Tips", body: "Add practical tips here." },
      ];

const safeSections = sections.map((section) => ({
  heading: section.heading ? String(section.heading).trim() : "Section",
  body: section.body ? String(section.body).trim() : "",
}));

const fileName = `${game}-${slug}.md`;
const filePath = path.join("src", "content", "guides", fileName);

if (fs.existsSync(filePath) && !overwrite) {
  console.error(`File already exists: ${filePath}`);
  console.error("Use --overwrite to replace the existing file.");
  process.exit(1);
}

const content = `---
title: "${escapeYamlString(title)}"
description: "${escapeYamlString(description)}"
game: "${game}"
slug: "${slug}"
category: "${escapeYamlString(category)}"
tags:
${tags.length ? tags.map((tag) => `  - ${tag}`).join("\n") : "  - guide"}
pubDate: ${today}
updatedDate: ${today}
draft: ${draft ? "true" : "false"}
---

# ${title}

${safeSections
  .map((section) => `## ${section.heading}\n\n${section.body}`)
  .join("\n\n")}
`;

fs.writeFileSync(filePath, content, "utf8");
console.log(`Guide written: ${filePath}`);

if (runBuild) {
  try {
    console.log("Running build...");
    execSync("npm run build", { stdio: "inherit" });
    console.log("Build successful.");
  } catch (error) {
    console.error("Build failed. File was written, but build did not pass.");
    process.exit(1);
  }
}

if (runGit) {
  try {
    console.log("Running git add/commit/push...");
    execSync("git add .", { stdio: "inherit" });
    execSync(`git commit -m "Publish guide: ${title.replace(/"/g, "")}"`, {
      stdio: "inherit",
    });
    execSync("git push", { stdio: "inherit" });
    console.log("Git push successful.");
  } catch (error) {
    console.error("Git step failed.");
    process.exit(1);
  }
}
