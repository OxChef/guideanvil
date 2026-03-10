import fs from "fs";
import path from "path";

const rawInput = process.argv[2];

if (!rawInput) {
  console.error("Usage: node scripts/vision-review.js '<json>'");
  process.exit(1);
}

let input;
try {
  input = JSON.parse(rawInput);
} catch (error) {
  console.error("Invalid JSON input.");
  process.exit(1);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function similarity(a, b) {
  const aa = new Set(normalize(a).split("-"));
  const bb = new Set(normalize(b).split("-"));
  const intersection = [...aa].filter((x) => bb.has(x)).length;
  const union = new Set([...aa, ...bb]).size;
  return union === 0 ? 0 : intersection / union;
}

const guidesDir = path.join("src", "content", "guides");
const files = fs.existsSync(guidesDir)
  ? fs.readdirSync(guidesDir).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
  : [];

const game = slugify(input.game || "");
const slug = slugify(input.slug || "");
const title = String(input.title || "").trim();
const description = String(input.description || "").trim();
const category = String(input.category || "").trim();
const tags = Array.isArray(input.tags) ? input.tags.filter(Boolean) : [];
const relatedSlugs = Array.isArray(input.relatedSlugs) ? input.relatedSlugs.filter(Boolean) : [];
const sections = Array.isArray(input.sections) ? input.sections : [];

const errors = [];
const warnings = [];
const findings = [];

if (!title) errors.push("Missing title.");
if (!description) errors.push("Missing description.");
if (!game) errors.push("Missing game.");
if (!slug) errors.push("Missing slug.");
if (!category) errors.push("Missing category.");

if (description && description.length < 80) {
  warnings.push("Description is very short.");
}

if (tags.length < 2) {
  warnings.push("Too few tags.");
}

if (sections.length < 4) {
  errors.push("Not enough sections. Minimum is 4.");
}

const thinSections = sections.filter((section) => {
  const body = String(section.body || "").trim();
  return body.length < 60;
});

if (thinSections.length > 1) {
  warnings.push("Multiple sections are too thin.");
}

const existingSlugs = [];
const similarSlugs = [];

for (const file of files) {
  const fileSlug = file
    .replace(`${game}-`, "")
    .replace(/\.mdx?$/, "");

  existingSlugs.push(fileSlug);

  if (fileSlug === slug) {
    errors.push(`Slug already exists: ${slug}`);
  } else {
    const score = similarity(fileSlug, slug);
    if (score >= 0.5) {
      similarSlugs.push({ slug: fileSlug, score });
    }
  }
}

if (similarSlugs.length > 0) {
  warnings.push(
    `Similar slugs found: ${similarSlugs
      .map((s) => `${s.slug} (${s.score.toFixed(2)})`)
      .join(", ")}`
  );
}

if (relatedSlugs.length < 2) {
  warnings.push("Too few relatedSlugs. Minimum recommended is 2.");
}

const validRelated = relatedSlugs.filter((item) => existingSlugs.includes(item));
if (relatedSlugs.length > 0 && validRelated.length === 0) {
  warnings.push("None of the relatedSlugs currently exist.");
}

const searchIntent = normalize(input.searchIntent || "");
if (!searchIntent) {
  warnings.push("Missing searchIntent.");
}

if (errors.length > 0) {
  findings.push("Decision: REJECT");
} else if (warnings.length > 0) {
  findings.push("Decision: REVISE");
} else {
  findings.push("Decision: APPROVED");
}

if (errors.length) {
  findings.push("");
  findings.push("Errors:");
  for (const err of errors) findings.push(`- ${err}`);
}

if (warnings.length) {
  findings.push("");
  findings.push("Warnings:");
  for (const warn of warnings) findings.push(`- ${warn}`);
}

console.log(findings.join("\n"));
