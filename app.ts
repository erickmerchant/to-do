import { $, define, each, effect, h, watch, when } from "@handcraft/lib";

const { input, label, h1, li, button, ol, div, p } = h.html;
const { title, path, svg } = h.svg;

type Item = {
  text: string;
  isDone: boolean;
};

define("to-do-app", {
  connected(host) {
    const stored = localStorage.getItem("to-do-app");
    const state = watch<{ list: Array<Item>; showDone: boolean }>(
      (stored ? JSON.parse(stored) : null) ?? {
        list: [],
        showDone: true,
      },
    );
    const dragState = watch<{ item: Item | null }>({
      item: null,
    });

    state.list = watch<Array<Item>>(state.list.map((item) => watch(item)));

    effect(() => {
      localStorage.setItem("to-do-app", JSON.stringify(state));
    });

    const heading = h1.class("title")("To Do List");
    const showDone = when(() => state.list.length > 0).show(() =>
      div.class("show-done")(
        input
          .id("show-done")
          .type("checkbox")
          .prop("checked", () => state.showDone)
          .on("change", function (this: HTMLInputElement) {
            const checked = this.checked;
            startViewTransition(() => {
              state.showDone = checked;
            });
          }),
        label.for("show-done")("Show done"),
      )
    );
    const textInput = input
      .id("add-new")
      .class("input-text")
      .placeholder("What do you have to do?")
      .on("keypress", function (this: HTMLInputElement, e: KeyboardEvent) {
        if (e.key === "Enter") {
          e.preventDefault();

          const text = this.value.trim();

          if (!text) {
            return;
          }

          startViewTransition(() => {
            state.list.push(
              watch<Item>({
                text,
                isDone: false,
              }),
            );
          });

          this.value = "";
        }
      } as EventListener);
    const itemsList = each(state.list)
      .filter((value) => state.showDone || !value.isDone)
      .map((value, index) => {
        const id = () => `item-${index()}`;
        const toggleDoneCheckbox = input
          .type("checkbox")
          .id(id)
          .prop("checked", () => value.isDone)
          .on("change", function (this: HTMLInputElement) {
            const checked = this.checked;

            startViewTransition(() => {
              value.isDone = checked;
            });
          });
        const itemLabel = label.for(id)(() => value.text);
        const deleteButton = button
          .type("button")
          .class("delete")
          .on("click", function () {
            startViewTransition(() => {
              state.list.splice(
                state.list.findIndex((item) => item === value()),
                1,
              );
            });
          })(
            svg.viewBox("0 0 16 16")(
              title("Delete"),
              path.d(
                "M4 1 L8 5 L12 1 L15 4 L11 8 L15 12 L12 15 L8 11 L4 15 L1 12 L5 8 L1 4 Z",
              ),
            ),
          );

        return li
          .class("item", {
            done: () => value.isDone,
            dragging: () => dragState.item === value(),
          })
          .style({ "view-transition-name": id })
          .prop("draggable", true)
          .on("dragstart", function (e: DragEvent) {
            dragState.item = value();

            e.dataTransfer!.effectAllowed = "move";
          } as EventListener)
          .on("dragend", function () {
            dragState.item = null;
          })
          .on("dragenter", function () {
            if (dragState.item != null) {
              const from = state.list.findIndex((t) => t === dragState.item);

              state.list.splice(from, 1);
              state.list.splice(index(), 0, dragState.item);
            }
          })(toggleDoneCheckbox, itemLabel, deleteButton);
      })
      .fallback(() => li.class("item")("No items yet"));
    const listOl = ol.class("list")(itemsList);
    const footing = div.class("footer")(
      p(() =>
        `Showing ${
          state.list.filter((item) => state.showDone || !item.isDone).length
        } of ${state.list.length}`
      ),
      when(() =>
        state.list.filter((item) => item.isDone).length !==
          0
      ).show(() =>
        button.class("clear-done").on("click", () => {
          startViewTransition(() => {
            const toDelete = [];

            for (const item of state.list) {
              if (!item.isDone) continue;

              toDelete.push(item);
            }

            for (const item of toDelete) {
              state.list.splice(
                state.list.findIndex((i) => i === item),
                1,
              );
            }
          });
        })("Clear Done")
      ),
    );

    $(host)(
      heading,
      showDone,
      textInput,
      listOl,
      footing,
    ).on("dragover dragleave drop", function (e) {
      e.preventDefault();
    });
  },
});

function startViewTransition(cb: () => void) {
  document.startViewTransition ? document.startViewTransition(cb) : cb();
}
