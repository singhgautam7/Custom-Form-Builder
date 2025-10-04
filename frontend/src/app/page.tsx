import Image from "next/image";
import { HomeMetricsCard } from "../components/home/HomeMetricsCard";
import { FormsTable } from "../components/home/FormsTable";

export default function Home() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-2 min-h-screen p-8 sm:p-12">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 w-full">
        <div className="px-4 lg:px-6 max-w-7xl mx-auto w-full">
          <HomeMetricsCard />
          <FormsTable />
        </div>
      </div>
    </div>
  );
}
