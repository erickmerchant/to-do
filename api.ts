import type { FlintRouteContext } from "@flint/framework";
import * as Fs from "@std/fs";

export function get(
  { params }: FlintRouteContext,
) {
  return Deno.readTextFile(
    `./storage/${params.year}-${params.month}-${params.day}.json`,
  ).then((data) => JSON.parse(data)).catch(() => ({
    showDone: true,
    list: [],
  }));
}

export async function post(
  { params, request }: FlintRouteContext,
) {
  const data = await request.text();

  await Fs.ensureDir("storage");

  await Deno.writeTextFile(
    `./storage/${params.year}-${params.month}-${params.day}.json`,
    data,
  );

  return true;
}
