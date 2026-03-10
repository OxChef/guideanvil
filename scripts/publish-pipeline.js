import { execSync } from "child_process";

const game = process.argv[2];
const topic = process.argv[3];

if (!game || !topic) {
  console.log("Usage: node scripts/publish-pipeline.js <game> <topic>");
  process.exit(1);
}

function runCommand(command) {
  return execSync(command, { encoding: "utf8" });
}

try {
  console.log("Step 1: Friday generates guide JSON...");
  const fridayOutput = runCommand(`node scripts/friday-json.js ${game} ${topic}`);

  console.log("Step 2: Vision reviews JSON...");
  const escapedJson = JSON.stringify(JSON.parse(fridayOutput));
  const visionOutput = runCommand(`node scripts/vision-review.js '${escapedJson}'`);

  console.log(visionOutput);

  if (!visionOutput.includes("Decision: APPROVED")) {
    console.log("Pipeline stopped. Vision did not approve publishing.");
    process.exit(0);
  }

  console.log("Step 3: Edith publishes guide...");
  runCommand(`node scripts/edith-publisher.js '${escapedJson}' --build --git`);

  console.log("Pipeline completed successfully.");
} catch (error) {
  console.error("Pipeline failed.");
  console.error(error.message);
  process.exit(1);
}
