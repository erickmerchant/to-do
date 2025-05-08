import "handcraft/dom/classes.js";
import "handcraft/dom/on.js";
import "handcraft/dom/prop.js";
import "handcraft/dom/text.js";
import {define} from "handcraft/define.js";
import {each} from "handcraft/each.js";
import {h, $} from "handcraft/dom.js";
import {watch, effect} from "handcraft/reactivity.js";
import {when} from "handcraft/when.js";

let {
	input: INPUT,
	label: LABEL,
	h1: H1,
	li: LI,
	button: BUTTON,
	ol: OL,
	div: DIV,
} = h.html;
let {title: TITLE, path: PATH, svg: SVG} = h.svg;

define("to-do-app").connected((host) => {
	let state = watch(
		JSON.parse(localStorage.getItem("to-do-app")) ?? {
			showDone: true,
			list: [],
		}
	);
	let dragState = watch({
		item: null,
	});

	state.list = watch(state.list.map((item) => watch(item)));

	effect(() => {
		localStorage.setItem("to-do-app", JSON.stringify(state));
	});

	let heading = H1.classes("title").text("To Do List");
	let showDone = () =>
		DIV.classes("show-done")(
			INPUT.id("show-done")
				.type("checkbox")
				.prop("checked", () => state.showDone)
				.on("change", function () {
					let show = this.checked;

					for (let item of state.list) {
						if (item.isDone) {
							item.isEntering = show;
							item.isLeaving = !show;
						}
					}

					state.showDone = show;
				}),
			LABEL.for("show-done").text("Show done")
		);
	let textInput = INPUT.classes("input-text")
		.placeholder("What do you have to do?")
		.on("keypress", function (e) {
			if (e.key === "Enter") {
				e.preventDefault();

				let text = this.value.trim();

				if (!text) {
					return;
				}

				state.list.push(
					watch({
						text,
						isDone: false,
						isEntering: true,
						isLeaving: false,
					})
				);

				this.value = "";
			}
		});
	let itemsList = each(state.list)
		.filter((value) => state.showDone || !value.isDone || value.isLeaving)
		.map((value, index) => {
			let toggleDoneCheckbox = INPUT.type("checkbox")
				.id(() => `item-${index()}`)
				.prop("checked", () => value.isDone)
				.on("change", function () {
					let isDone = this.checked;

					if (!state.showDone && isDone) {
						value.isLeaving = true;
					}

					value.isDone = isDone;
				});
			let itemLabel = LABEL.for(() => `item-${index()}`).text(() => value.text);
			let deleteButton = BUTTON.type("button")
				.classes("delete")
				.on("click", function () {
					value.isLeaving = true;
					value.isDeleted = true;
				})(
				SVG.viewBox("0 0 16 16")(
					TITLE.text("Delete"),
					PATH.d(
						"M4 1 L8 5 L12 1 L15 4 L11 8 L15 12 L12 15 L8 11 L4 15 L1 12 L5 8 L1 4 Z"
					)
				)
			);

			return LI.classes("item", {
				done: () => value.isDone,
				leaving: () => value.isLeaving,
				entering: () => value.isEntering,
				dragging: () => dragState.item === value(),
			})
				.prop("draggable", true)
				.on("dragstart", function (e) {
					dragState.item = value();

					e.dataTransfer.effectAllowed = "move";
				})
				.on("dragend", function () {
					dragState.item = null;
				})
				.on("dragenter", function () {
					if (dragState.item != null) {
						let from = state.list.findIndex((t) => t === dragState.item);

						state.list.splice(from, 1);
						state.list.splice(index(), 0, dragState.item);
					}
				})
				.on("animationend", function () {
					value.isLeaving = false;
					value.isEntering = false;

					if (value.isDeleted) {
						state.list.splice(
							state.list.findIndex((item) => item === value()),
							1
						);
					}
				})(toggleDoneCheckbox, itemLabel, deleteButton);
		})
		.fallback(() => LI.classes("item").text("No items yet"));
	let listOl = OL.classes("list")(itemsList);

	host(
		heading,
		when(() => state.list.length).show(showDone),
		textInput,
		listOl
	);

	$(document.body).on("dragover dragleave drop", function (e) {
		e.preventDefault();
	});
});
