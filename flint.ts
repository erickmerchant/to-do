import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import flint from "@flint/framework";
import index from "./index.ts";

const app = flint("public", "dist")
  .route("/", index)
  .file("/styles.css", css)
  .file("/app.js", js);

export default app;

if (import.meta.main) {
  app.run();
}
