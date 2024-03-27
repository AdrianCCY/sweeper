/* eslint-disable @typescript-eslint/no-explicit-any */
import { SearchField } from "./components/SearchField";

function App() {
  return (
    <div className="h-full w-full bg-slate-800">
      <div className="flex h-full w-full justify-center">
        <div className="flex w-full max-w-lg flex-col items-center gap-8">
          <div className="mt-40 text-7xl capitalize text-[#e8eaed]">
            Sweeper
          </div>
          <SearchField />
        </div>
      </div>
    </div>
  );
}

export default App;
