import React from "react";
import { useLocation } from "react-router-dom";

const HeaderSection: React.FC = () => {
  const location = useLocation();

  // Extract last segment of the pathname, e.g. "/dashboard/customers" → "customers"
  const pathName: string | undefined = location.pathname
    .split("/")
    .filter(Boolean)
    .pop();

  // Convert to title case
  const pageTitle: string =
    pathName && pathName.length > 0
      ? pathName.charAt(0).toUpperCase() + pathName.slice(1)
      : "Dashboard";

  return (
    <>
      <div className="grid grid-cols-12 gap-6">
        <div className="grid grid-cols-12 col-span-12 gap-6 xxl:col-span-9">
          <div className="col-span-12 mt-8">
            <div className="flex items-center h-10 intro-y">
              <h2 className="mr-5 text-lg font-medium truncate">{pageTitle}</h2>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeaderSection;
