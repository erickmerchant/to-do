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
	button,
} = h.html;

export default async function ({ urls }) {
	return render(
		html.lang("en-US")(
			head(
				meta.charset("utf-8"),
				meta.name("viewport").content("width=device-width, initial-scale=1"),
				title("To Do List"),
				link.rel("stylesheet").href(urls["/styles.css"]),
				script.type("module").src(urls["/app.js"]),
			),
			body(todoApp()),
		),
	);
}
