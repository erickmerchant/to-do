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

export default function () {
  return render(
    html.lang("en-US")(
      head(
        meta.charset("utf-8"),
        meta.name("viewport").content("width=device-width, initial-scale=1"),
        title("To Do List"),
        link.rel("stylesheet").href("/styles.css"),
        script.type("module").src("/app.js"),
      ),
      body(todoApp()),
    ),
  );
}
