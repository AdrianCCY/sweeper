import { Hono } from "hono";
import { scrapeListingByUrl, searchSuggestion, saveData } from "./fetcher";

const api = new Hono();
api.get("/search/suggestions/:keyword", async (c) => {
  const keyword = c.req.param("keyword");

  try {
    const res = await searchSuggestion(keyword);
    return c.json({
      data: res.data.data.suggestLocations,
    });
  } catch (error: any) {
    return c.status(500);
  }
});

api.get("/scrape/:keyword", async (c) => {
  const keyword = c.req.param("keyword");
  const url = new URL(`https://www.domain.com.au/sold-listings/${keyword}`);
  const exportPath = process.env.EXPORT_PATH || "./exports";

  try {
    const rows = await scrapeListingByUrl(url);
    const fn = saveData(rows, exportPath);

    return c.json({
      data: {
        filename: fn,
      },
    });
  } catch (error: any) {
    return c.status(500);
  }
});

export default api;
