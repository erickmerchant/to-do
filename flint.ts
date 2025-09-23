import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import flint from "@flint/framework";
import index from "./src/index.ts";

const app = flint("src", "dist")
  .route("/", { handler: index })
  .file("/styles.css", { handler: css })
  .file("/app.js", { handler: js });

export default app;

if (import.meta.main) {
  app.run();
}
