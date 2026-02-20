import css from "@flint/framework/handlers/css";
import js from "@flint/framework/handlers/js";
import method from "@flint/framework/handlers/method";
import json from "@flint/framework/handlers/json";
import flint, { pattern as p } from "@flint/framework";
import main from "./main.ts";
import * as api from "./api.ts";

const app = flint()
  .route("/", main, [])
  .route(p`/:year-:month-:day/`, main)
  .route(
    p`/api/:year-:month-:day/`,
    method.post(json(api.post)).get(json(api.get)),
  )
  .file("/styles.css", css)
  .file("/to-do-app.js", js);

export default app;

if (import.meta.main) {
  app.run();
}
