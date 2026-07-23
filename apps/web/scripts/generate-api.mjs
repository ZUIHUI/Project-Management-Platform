import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";

const schemaUrl = new URL("../../api/openapi/openapi.yaml", import.meta.url);
const outputUrl = new URL("../src/shared/api/schema.d.ts", import.meta.url);
const checkOnly = process.argv.includes("--check");

const ast = await openapiTS(schemaUrl);
const generated = astToString(ast);
const outputPath = fileURLToPath(outputUrl);

if (checkOnly) {
  let existing = "";
  try {
    existing = await readFile(outputUrl, "utf8");
  } catch {
    // A missing generated file is contract drift.
  }

  if (existing !== generated) {
    console.error("Generated API types are stale. Run `npm --workspace apps/web run generate:api`.");
    process.exitCode = 1;
  } else {
    console.log("Generated API types match the OpenAPI document.");
  }
} else {
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputUrl, generated, "utf8");
  console.log(`Generated ${outputPath}`);
}
