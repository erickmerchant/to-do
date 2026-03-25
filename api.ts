import * as Fs from "@std/fs";

export type APIParams = { year?: string; month?: string; day?: string };

export function get(
  { params }: { params: APIParams },
) {
  if (!params.year || !params.month || !params.day) {
    return new Response("", { status: 404 });
  }

  return Deno.readTextFile(
    `./storage/${params.year}-${params.month}-${params.day}.json`,
  ).then((data) => JSON.parse(data)).catch(() => ({
    showDone: true,
    list: [],
  }));
}

export async function post(
  { params, request }: {
    params: APIParams;
    request: Request;
  },
) {
  if (!params.year || !params.month || !params.day) {
    return new Response("", { status: 404 });
  }

  const data = await request.text();

  await Fs.ensureDir("storage");

  await Deno.writeTextFile(
    `./storage/${params.year}-${params.month}-${params.day}.json`,
    data,
  );

  return true;
}
