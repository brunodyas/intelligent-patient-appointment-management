"use client";
import { Button } from "@/components/atomics";
import Route from "@/components/atomics/Route";
import { routes } from "@/constants/routes";
import { useRouter } from "next/navigation";

const TechDetails = () => {
  const router = useRouter();

  return (
    <div className="p-5 max-w-4xl mx-auto shadow-lg rounded-lg bg-white">
      <div className="flex justify-end">
        <Button size="md" variant="primary-bg">
          <Route route={routes.tech} linkClassName="">
            Back
          </Route>
        </Button>
      </div>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 md:pl-4">
          <h2 className="text-xl font-bold mt-2 md:mt-0">Kristopher Stuarto</h2>
          <p className="text-gray-700">
            Consultation: June 27, 2024 at 12:00 AM
          </p>
        </div>
      </div>
    </div>
  );
};

export default TechDetails;
