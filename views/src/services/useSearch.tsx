// import { useQuery } from "@tanstack/react-query";
import { client } from "./client";

export async function scrape(search: string) {
  return client(`/api/scrape/${search}`);
}
