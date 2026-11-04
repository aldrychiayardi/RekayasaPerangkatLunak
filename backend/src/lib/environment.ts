import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const rootEnv = resolve(process.cwd(), ".env");
const parentEnv = resolve(process.cwd(), "../.env");

if (existsSync(rootEnv)) {
  config({ path: rootEnv });
} else if (existsSync(parentEnv)) {
  config({ path: parentEnv });
} else {
  config();
}
