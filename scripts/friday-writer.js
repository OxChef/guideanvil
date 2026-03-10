import { execSync } from "child_process";

const game = process.argv[2];
const topic = process.argv[3];

if (!game || !topic) {
  console.log("Usage: node scripts/friday-writer.js <game> <topic>");
  process.exit(1);
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const slug = slugify(topic);

const title =
  topic
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") +
  " in " +
  game.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase());

const json = {
  title: title,
  description: `Complete guide about ${topic.replace("-", " ")} in ${game.replace("-", " ")}.`,
  game: game,
  slug: slug,
  category: "Guide",
  tags: ["guide", game],
  sections: [
    {
      heading: "Overview",
      body: `This guide explains ${topic.replace("-", " ")} in ${game.replace("-", " ")}.`,
    },
    {
      heading: "How It Works",
      body: `Understanding the mechanics behind ${topic.replace("-", " ")} is important for efficient gameplay.`,
    },
    {
      heading: "Best Strategy",
      body: `Use the most efficient strategy depending on your progression stage.`,
    },
    {
      heading: "Tips",
      body: `Avoid common mistakes and focus on efficient routes and upgrades.`,
    },
  ],
};

const cmd = `node scripts/edith-publisher.js '${JSON.stringify(
  json
)}' --build --git`;

console.log("Running publisher...");
execSync(cmd, { stdio: "inherit" });
