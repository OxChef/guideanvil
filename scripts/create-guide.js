import fs from "fs";
import path from "path";

const game = process.argv[2];
const slug = process.argv[3];
const title = process.argv[4];

if (!game || !slug || !title) {
  console.log("Usage: node create-guide.js <game> <slug> <title>");
  process.exit(1);
}

const fileName = `src/content/guides/${game}-${slug}.md`;

const content = `---
title: "${title}"
description: ""
game: "${game}"
slug: "${slug}"
category: "Guide"
tags:
  - guide
pubDate: ${new Date().toISOString().slice(0,10)}
updatedDate: ${new Date().toISOString().slice(0,10)}
draft: false
---

# ${title}

## Overview

Write overview here.

## Strategy

Explain the strategy.

## Tips

Helpful tips.
`;

fs.writeFileSync(fileName, content);

console.log("Guide created:", fileName);
