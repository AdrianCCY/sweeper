/* eslint-disable @typescript-eslint/no-explicit-any */
import { ChangeEvent, useRef, useState } from "react";
import { useSuggestions } from "../services/useSuggestions";
import clsx from "clsx";
import { scrape } from "../services/useSearch";

export const SearchField: React.FC = () => {
  const [search, setSearch] = useState<string>("");
  const [focus, setFocus] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { data: suggestions } = useSuggestions(search);
  const suggestionBox = useRef<any>();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setFocus(true);
  };

  function downloadURI(uri: string) {
    const link = document.createElement("a");
    link.setAttribute("download", "");
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const handleSearch = async (nameSlug: string) => {
    setLoading(true);
    try {
      const res = await scrape(nameSlug);
      downloadURI(`http://localhost:3000/exports/${res.data.filename}`);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    setFocus(false);
  };

  return (
    <>
      <div className="flex w-full gap-2">
        <div
          className={clsx(
            "relative w-full rounded-lg border-gray-600 bg-gray-700",
            focus && "rounded-b-none border-b-0",
          )}
        >
          <input
            type="text"
            className="w-full rounded-lg bg-transparent text-[#e8eaed] placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-0"
            placeholder="Search for appartments, houses, etc."
            onChange={handleInputChange}
            value={search}
            onFocus={() => setFocus(true)}
            onBlur={handleBlur}
          />
          {focus && (
            <div
              ref={suggestionBox}
              className="absolute max-h-44 w-full max-w-lg overflow-auto rounded-b-lg bg-gray-700"
            >
              {suggestions && suggestions.length > 0 ? (
                <>
                  {suggestions.map((suggestion: any, index: number) => (
                    <div
                      key={index}
                      className="z-10 cursor-pointer px-4 py-2 text-[#e8eaed] hover:bg-gray-600"
                      onPointerDown={(e: any) => {
                        e.preventDefault();
                        setSearch(suggestion.displayName);
                        handleSearch(suggestion.nameSlug);
                        setFocus(false);
                      }}
                    >
                      {suggestion.displayName}
                    </div>
                  ))}
                </>
              ) : (
                <div className="w-full px-4 py-2 text-center text-[#e8eaed]">
                  No result!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      {loading && (
        <div className="absolute inset-0 flex h-screen w-screen items-center justify-center bg-slate-500 bg-opacity-50 backdrop-blur-sm">
          <svg
            className="-ml-1 mr-3 h-6 w-6 animate-spin text-blue-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
    </>
  );
};
