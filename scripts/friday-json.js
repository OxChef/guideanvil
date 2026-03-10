const game = process.argv[2];
const topic = process.argv[3];

if (!game || !topic) {
  console.log("Usage: node scripts/friday-json.js <game> <topic>");
  process.exit(1);
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function titleCase(value) {
  return value
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function detectCategory(topic) {
  if (topic.includes("farm")) return "Farming";
  if (topic.includes("boss")) return "Boss Guide";
  if (topic.includes("build")) return "Build Guide";
  if (topic.includes("weapon")) return "Weapons";
  if (topic.includes("armor")) return "Armor";
  if (topic.includes("get")) return "Resources";
  return "Guide";
}

function detectIntent(topic) {
  if (topic.includes("farm")) return "farming";
  if (topic.includes("boss")) return "boss strategy";
  if (topic.includes("build")) return "build optimization";
  if (topic.includes("get")) return "acquisition";
  return "progression";
}

const slug = slugify(topic);
const prettyGame = titleCase(game);
const prettyTopic = titleCase(topic);
const category = detectCategory(topic);
const searchIntent = detectIntent(topic);

const json = {
  title: `${prettyTopic} in ${prettyGame}`,
  description: `Complete ${category.toLowerCase()} for ${topic.replace(/-/g, " ")} in ${game.replace(/-/g, " ")}, including efficient strategies, progression tips, and practical advice for early and mid game players.`,
  game: game,
  slug: slug,
  category: category,
  tags: ["guide", game, topic.split("-")[0], category.toLowerCase()],
  searchIntent: searchIntent,
  relatedSlugs: ["how-to-get-iron", "best-early-weapons"],
  sections: [
    {
      heading: "Overview",
      body: `This guide explains ${topic.replace(/-/g, " ")} in ${game.replace(/-/g, " ")} and focuses on practical, efficient progression for players who want a clear and useful path forward.`
    },
    {
      heading: "Best Early Strategy",
      body: `In the early game, focus on stable and repeatable methods that improve consistency, reduce wasted resources, and help you build momentum without relying on risky or inefficient routes.`
    },
    {
      heading: "Best Mid Game Strategy",
      body: `Once better gear, more map access, or stronger enemies become available, shift into more efficient loops that improve rewards, shorten downtime, and increase overall progression speed.`
    },
    {
      heading: "Tips",
      body: `Avoid inefficient detours, prioritize reliable progression, and combine this route or mechanic with other useful resources whenever possible to maximize overall efficiency.`
    }
  ]
};

console.log(JSON.stringify(json));
