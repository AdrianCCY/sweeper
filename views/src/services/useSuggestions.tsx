import { useQuery } from "@tanstack/react-query";
import { client } from "./client";

async function fetchSuggestions(query: string) {
  const res = await client(`/api/search/suggestions/${query}`);
  return res.data;
}

export const useSuggestions = (query: string) => {
  return useQuery({
    queryKey: ["search", "suggestions", query],
    queryFn: async () => fetchSuggestions(query),
    placeholderData: (prev) => prev,
    enabled: !!query,
    retry: 0,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
};
