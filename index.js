import { h, render } from "handcraft/env/server.js";

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

export default async function (_, resolve) {
	return render(
		html.lang("en-US")(
			head(
				meta.charset("utf-8"),
				meta.name("viewport").content("width=device-width, initial-scale=1"),
				title("To Do List"),
				link.rel("stylesheet").href(resolve("/styles.css")),
				script.type("module").src(resolve("/app.js")),
			),
			body(todoApp()),
		),
	);
}
