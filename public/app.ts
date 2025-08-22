import { $, define, each, effect, h, watch, when } from "@handcraft/lib";

const { input, label, h1, li, button, ol, div } = h.html;
const { title, path, svg } = h.svg;

type Item = {
  text: string;
  isDone: boolean;
};

const startViewTransition = document.startViewTransition
  ? (cb: () => void) => {
    document.startViewTransition(cb);
  }
  : (cb: () => void) => {
    cb();
  };

define("to-do-app").setup((host) => {
  const state = watch<{ list: Array<Item>; showDone: boolean }>(
    JSON.parse(localStorage.getItem("to-do-app") ?? "null") ?? {
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
  const showDone = () =>
    div.class("show-done")(
      input
        .id("show-done")
        .type("checkbox")
        .prop("checked", () => state.showDone)
        .on("change", function () {
          // @ts-ignore ignore shadowing
          const checked = this.checked;
          startViewTransition(() => {
            state.showDone = checked;
          });
        }),
      label.for("show-done")("Show done"),
    );
  const textInput = input
    .class("input-text")
    .placeholder("What do you have to do?")
    .on("keypress", function (e: KeyboardEvent) {
      if (e.key === "Enter") {
        e.preventDefault();

        // @ts-ignore complaints about this
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

        // @ts-ignore complaints about this
        this.value = "";
      }
    } as EventListener);
  const itemsList = each(state.list)
    .filter((value) => state.showDone || !value.isDone)
    .map((value, index) => {
      const genId = () => `item-${index()}`;
      const toggleDoneCheckbox = input
        .type("checkbox")
        .id(genId)
        .prop("checked", () => value.isDone)
        .on("change", function () {
          // @ts-ignore complaints about this
          const checked = this.checked;
          startViewTransition(() => {
            value.isDone = checked;
          });
        });
      const itemLabel = label.for(genId)(() => value.text);
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
        .prop("draggable", true)
        .on("dragstart", function (e: DragEvent) {
          dragState.item = value();

          // @ts-ignore exists
          e.dataTransfer.effectAllowed = "move";
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

  host(
    heading,
    when(() => state.list.length > 0).show(showDone),
    textInput,
    listOl,
  );

  $(document.body).on("dragover dragleave drop", function (e) {
    e.preventDefault();
  });
});
