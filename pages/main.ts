import { h } from "@handcraft/lib/templating";
import { type APIParams } from "../api.ts";

const {
  html,
  head,
  meta,
  title,
  link,
  script,
  body,
  "to-do-app": todoApp,
} = h.html;

export default function (
  { params }: { params: APIParams },
) {
  return html.lang("en-US")(
    head(
      meta.charset("utf-8"),
      meta.name("viewport").content("width=device-width, initial-scale=1"),
      title("To Do List"),
      link.rel("stylesheet").href("/pages/styles.css"),
      script.type("module").src("/elements/to-do-app.js"),
    ),
    body(
      todoApp
        .year(params.year ?? false)
        .month(params.month ?? false)
        .day(params.day ?? false),
    ),
  );
}
