import dotenv from "dotenv";
dotenv.config();
import { map } from "extra-promise";
import { findMigrationFilenames, readMigrationFile } from "migration-files";
import { migrate } from "@blackglory/better-sqlite3-migrations";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
const __dirname = dirname(fileURLToPath(import.meta.url));
import { db } from "./db.js";

async function initDB() {
  console.log("initializing database " + db.name);
  const filenames = await findMigrationFilenames(join(__dirname, "migrations"));
  const migrations = await map(filenames, readMigrationFile);
  migrate(db, migrations);
  console.log("database initialized at " + db.name);
}

(async () => {
  console.log(process.env.DB_DIR);
  await initDB();
})();
