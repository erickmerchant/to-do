import type { FlintRouteContext } from "@flint/framework";
import { h } from "@handcraft/lib";
import { render } from "@handcraft/lib/render";

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

export default function ({ params }: FlintRouteContext) {
  return render(
    html.lang("en-US")(
      head(
        meta.charset("utf-8"),
        meta.name("viewport").content("width=device-width, initial-scale=1"),
        title("To Do List"),
        link.rel("stylesheet").href("/styles.css?inline"),
        script.type("module").src("/to-do-app.js?inline"),
      ),
      body(
        todoApp
          .year(params.year ?? false)
          .month(params.month ?? false)
          .day(params.day ?? false),
      ),
    ),
  );
}
