import axios from "axios";
import * as XLSX from "xlsx";
import * as fs from "fs";
import dayjs from "dayjs";
import { writeFile, set_fs } from "xlsx";
import path from "path";
set_fs(fs);

export async function searchSuggestion(searchText: string) {
  const data = JSON.stringify({
    query: `query SuggestLocations($input: String!, $locationTypes: [LocationSuggestionType!], $stateBoost: States) {
  suggestLocations(
    prefixText: $input
    locationTypes: $locationTypes
    stateBoost: $stateBoost
  ) {
    __typename
    ... on SuburbSuggestion {
      displayName
      nameSlug
      name
      state
      postcode
      __typename
    }
    ... on AreaSuggestion {
      displayName
      nameSlug
      name
      state
      __typename
    }
    ... on RegionSuggestion {
      displayName
      nameSlug
      name
      state
      __typename
    }
    ... on PostcodeSuggestion {
      displayName
      nameSlug
      name
      postcode
      __typename
    }
    ... on SchoolSuggestion {
      displayName
      nameSlug
      name
      state
      suburb
      postcode
      __typename
    }
    ... on ProjectSuggestion {
      displayName
      nameSlug
      name
      state
      suburb
      postcode
      __typename
    }
  }
}`,
    variables: {
      input: searchText,
      locationTypes: [
        "SUBURB",
        "AREA",
        "REGION",
        "SCHOOL",
        "PROJECT",
        "POSTCODE",
      ],
      stateBoost: "VIC",
    },
  });

  const config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://www.domain.com.au/graphql",
    headers: {
      authority: "www.domain.com.au",
      accept: "*/*",
      "accept-language": "en-US,en;q=0.8",
      "apollographql-client-name": "fe-server-search-listings#client",
      "content-type": "application/json",
      origin: "https://www.domain.com.au",
      referer: "https://www.domain.com.au/sold-listings/",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    data: data,
  };

  return axios.request(config);
}

export async function fetchListing(url: URL) {
  let config = {
    method: "get",
    maxBodyLength: Infinity,
    url: url.toString(),
    headers: {
      authority: "www.domain.com.au",
      accept: "application/json",
      "accept-language": "en-US,en;q=0.8",
      "cache-control": "max-age=0",
      referer: url.toString(),
      "sec-ch-ua": '"Not_A Brand";v="8", "Chromium";v="120", "Brave";v="120"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"macOS"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "sec-gpc": "1",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  };

  return axios.request(config);
}

export function parseListingData(data: any) {
  const result: any = [];
  const pageListings = data["props"]["listingsMap"];

  for (const [, value] of Object.entries(pageListings)) {
    const address = (value as any)["listingModel"]["address"];
    const price = (value as any)["listingModel"]["price"];
    const beds = (value as any)["listingModel"]["features"]["beds"];
    const landSize = (value as any)["listingModel"]["features"]["landSize"];
    const landSizeUnit = (value as any)["listingModel"]["features"]["landUnit"];
    const tags = (value as any)["listingModel"]["tags"];
    const dateArray = tags["tagText"].split(" ").slice(-3);
    const date = dayjs(dateArray.join());

    result.push({
      ...address,
      beds: beds,
      landSize: landSize,
      landSizeUnit: landSizeUnit,
      price: price,
      date: date.format(),
    });
  }

  return result;
}

export function saveData(rows: any, exportPath: string) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "listings");
  const fn = `${dayjs().format("YYYYMMDDHHmmssSSS")}.xlsx`;
  XLSX.writeFile(workbook, path.resolve(exportPath, fn), { compression: true });
  return fn;
}

export async function scrapePageByUrl(url: URL) {
  const res = await fetchListing(url);
  const pageListings = res.data["props"]["pageProps"]["listingsMap"];
  const listings: any = [];
  for (const [, value] of Object.entries(pageListings)) {
    listings.push(value);
  }
  return listings;
}

export async function scrapeListingByUrl(url: URL) {
  let page = 1;
  let listings: any = [];
  while (true) {
    url.searchParams.set("page", page.toString());

    try {
      const res = await fetchListing(url);
      const rows = parseListingData(res.data);
      listings = [...listings, ...rows];
    } catch (error) {
      console.log(error);
      break;
    }

    page++;
  }

  console.log(`Found ${listings.length} listings`);
  return listings;
}
