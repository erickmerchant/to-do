import "handcraft/dom/classes.js";
import "handcraft/dom/nodes.js";
import "handcraft/dom/on.js";
import "handcraft/dom/prop.js";
import { define } from "handcraft/define.js";
import { each } from "handcraft/each.js";
import { $, h } from "handcraft/dom.js";
import { effect, watch } from "handcraft/reactivity.js";
import { when } from "handcraft/when.js";

const { input, label, h1, li, button, ol, div } = h.html;
const { title, path, svg } = h.svg;

define("to-do-app").setup((host) => {
	const state = watch(
		JSON.parse(localStorage.getItem("to-do-app")) ?? {
			showDone: true,
			list: [],
		},
	);
	const dragState = watch({
		item: null,
	});

	state.list = watch(state.list.map((item) => watch(item)));

	effect(() => {
		localStorage.setItem("to-do-app", JSON.stringify(state));
	});

	const heading = h1.classes("title")("To Do List");
	const showDone = () =>
		div.classes("show-done")(
			input
				.id("show-done")
				.type("checkbox")
				.prop("checked", () => state.showDone)
				.on("change", function () {
					const show = this.checked;

					for (const item of state.list) {
						if (item.isDone) {
							item.isEntering = show;
							item.isLeaving = !show;
						}
					}

					state.showDone = show;
				}),
			label.for("show-done")("Show done"),
		);
	const textInput = input
		.classes("input-text")
		.placeholder("What do you have to do?")
		.on("keypress", function (e) {
			if (e.key === "Enter") {
				e.preventDefault();

				const text = this.value.trim();

				if (!text) {
					return;
				}

				state.list.push(
					watch({
						text,
						isDone: false,
						isEntering: true,
						isLeaving: false,
					}),
				);

				this.value = "";
			}
		});
	const itemsList = each(state.list)
		.filter((value) => state.showDone || !value.isDone || value.isLeaving)
		.map((value, index) => {
			const genId = () => `item-${index()}`;
			const toggleDoneCheckbox = input
				.type("checkbox")
				.id(genId)
				.prop("checked", () => value.isDone)
				.on("change", function () {
					const isDone = this.checked;

					if (!state.showDone && isDone) {
						value.isLeaving = true;
					}

					value.isDone = isDone;
				});
			const itemLabel = label.for(genId)(() => value.text);
			const deleteButton = button
				.type("button")
				.classes("delete")
				.on("click", function () {
					value.isLeaving = true;
					value.isDeleted = true;
				})(
					svg.viewBox("0 0 16 16")(
						title("Delete"),
						path.d(
							"M4 1 L8 5 L12 1 L15 4 L11 8 L15 12 L12 15 L8 11 L4 15 L1 12 L5 8 L1 4 Z",
						),
					),
				);

			return li
				.classes("item", {
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
						const from = state.list.findIndex((t) => t === dragState.item);

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
							1,
						);
					}
				})(toggleDoneCheckbox, itemLabel, deleteButton);
		})
		.fallback(() => li.classes("item")("No items yet"));
	const listOl = ol.classes("list")(itemsList);

	host(
		heading,
		when(() => state.list.length).show(showDone),
		textInput,
		listOl,
	);

	$(document.body).on("dragover dragleave drop", function (e) {
		e.preventDefault();
	});
});
