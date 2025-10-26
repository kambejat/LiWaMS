import React from "react";
import icon from "../assets/Logo.png";

interface SidebarProps {
  role: string | undefined;
  isOpen: boolean;
}
const Sidebar: React.FC<SidebarProps> = ({ role, isOpen }) => {
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-60 pl-2 overflow-y-auto bg-gray-800 text-white transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static`}
      >
        <div>
          <div className="text-white">
            <div className="flex p-2  bg-gray-800">
              <div className="flex py-3 px-2 items-center">
                <p className="text-2xl text-green-500 font-semibold">Li</p>
                <p className="ml-2 font-semibold italic">WaMS</p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="">
                <img
                  className="hidden h-24 w-24 rounded-full sm:block object-cover mr-2 border-4 border-green-400"
                  src={icon}
                  alt=""
                />
                <p className="font-bold text-base  text-gray-100 pt-2 text-center w-24">
                LiWaMS
                </p>
              </div>
            </div>
            <div>
              <ul className="mt-6 leading-10">
                <li className="relative px-4 py-0.5">
                  <a
                    className="inline-flex items-center w-full text-sm font-semibold text-white transition-colors duration-150 cursor-pointer hover:text-green-500"
                    href="/dashboard/home"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                      />
                    </svg>
                    <span className="ml-4 uppercase">DASHBOARD</span>
                  </a>
                </li>
                <li className="relative px-4 py-0.5">
                  <a
                    className="inline-flex items-center w-full text-sm font-semibold text-white transition-colors duration-150 cursor-pointer hover:text-green-500"
                    href="/dashboard/customers"
                  >
                    <svg
                      width="30"
                      height="30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="stroke-current text-white dark:text-gray-800 transform transition-transform duration-500 ease-in-out"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      ></path>
                    </svg>

                    <span className="ml-4 uppercase">Customers</span>
                  </a>
                </li>
                {role === "admin" && (
                  <li className="relative px-4 py-0.5">
                    <a
                      className="inline-flex items-center w-full text-sm font-semibold text-white transition-colors duration-150 cursor-pointer hover:text-green-500"
                      href="/dashboard/meters"
                    >
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 48 48"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                      >
                        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          <path
                            className="a"
                            d="M24,4.5c0,3.9452-12,13.7174-12,27.4054A11.8025,11.8025,0,0,0,24,43.5,11.8025,11.8025,0,0,0,36,31.9054C36,18.2174,24,8.4452,24,4.5Z"
                          ></path>
                        </g>
                      </svg>
                      <span className="ml-4 uppercase">Meters</span>
                    </a>
                  </li>
                )}

                <li className="relative px-4 py-0.5">
                  <a
                    className="inline-flex items-center w-full text-sm font-semibold text-white transition-colors duration-150 cursor-pointer hover:text-green-500"
                    href="/dashboard/payments"
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 48 48"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                    >
                      <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        <g id="Layer_2" data-name="Layer 2">
                          <g id="invisible_box" data-name="invisible box">
                            <rect width="48" height="48" fill="none"></rect>
                          </g>
                          <g id="Layer_7" data-name="Layer 7">
                            <g>
                              <path d="M34.3,20.1h0a6.7,6.7,0,0,1-4.1-1.3,2,2,0,0,0-2.8.6,1.8,1.8,0,0,0,.3,2.6A10.9,10.9,0,0,0,32,23.8V26a2,2,0,0,0,4,0V23.8a6.3,6.3,0,0,0,3-1.3,4.9,4.9,0,0,0,2-4h0c0-3.7-3.4-4.9-6.3-5.5s-3.5-1.3-3.5-1.8.2-.6.5-.9a3.4,3.4,0,0,1,1.8-.4,6.3,6.3,0,0,1,3.3.9,1.8,1.8,0,0,0,2.7-.5,1.9,1.9,0,0,0-.4-2.8A9.1,9.1,0,0,0,36,6.3V4a2,2,0,0,0-4,0V6.2c-3,.5-5,2.5-5,5.2s3.3,4.9,6.5,5.5,3.3,1.3,3.3,1.8S35.7,20.1,34.3,20.1Z"></path>
                              <path d="M42.2,31.7a5.2,5.2,0,0,0-4-1.1l-9.9,1.8a4.5,4.5,0,0,0-1.4-3.3L19.8,22H5a2,2,0,0,0-2,2v9a2,2,0,0,0,2,2H8.3l11.2,9.1,20.4-3.7a5,5,0,0,0,2.3-8.7Zm-3,4.8L20.5,39.9,10,31.2V26h8.2l5.9,5.9a.8.8,0,0,1-1.2,1.2l-3.5-3.5a2,2,0,0,0-2.8,2.8l3.5,3.5a4.5,4.5,0,0,0,3.4,1.4,5.7,5.7,0,0,0,1.8-.3h0l13.6-2.4a1.1,1.1,0,0,1,.8.2.9.9,0,0,1,.3.7A1,1,0,0,1,39.2,36.5Z"></path>
                            </g>
                          </g>
                        </g>
                      </g>
                    </svg>

                    <span className="ml-4 uppercase">Payments</span>
                  </a>
                </li>
                <li className="relative px-4 py-0.5">
                  <a
                    className="inline-flex items-center w-full text-sm font-semibold text-white transition-colors duration-150 cursor-pointer hover:text-green-500"
                    href="/dashboard/bills"
                  >
                    <svg
                      width="30"
                      height="30"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="stroke-current text-white dark:text-gray-800 transform transition-transform duration-500 ease-in-out"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>

                    <span className="ml-4 uppercase">Bills</span>
                  </a>
                </li>
                <li className="relative px-4 py-0.5">
                  <a
                    className="inline-flex items-center w-full text-sm font-semibold text-white transition-colors duration-150 cursor-pointer hover:text-green-500"
                    href="/dashboard/receipts"
                  >
                    <svg
                      width="30"
                      height="30"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                      <g
                        id="SVGRepo_tracerCarrier"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      ></g>
                      <g id="SVGRepo_iconCarrier">
                        <path
                          d="M7 13.0001H13M7 9.0001H9M7 17.0001H13M16 21.0001H18.5M17 21.0001H7.8C6.11984 21.0001 5.27976 21.0001 4.63803 20.6731C4.07354 20.3855 3.6146 19.9266 3.32698 19.3621C3 18.7203 3 17.8803 3 16.2001V5.75719C3 4.8518 3 4.3991 3.1902 4.13658C3.35611 3.90758 3.61123 3.75953 3.89237 3.72909C4.21467 3.6942 4.60772 3.9188 5.39382 4.368L5.70618 4.54649C5.99552 4.71183 6.14019 4.7945 6.29383 4.82687C6.42978 4.85551 6.57022 4.85551 6.70617 4.82687C6.85981 4.7945 7.00448 4.71183 7.29382 4.54649L9.20618 3.45372C9.49552 3.28838 9.64019 3.20571 9.79383 3.17334C9.92978 3.14469 10.0702 3.14469 10.2062 3.17334C10.3598 3.20571 10.5045 3.28838 10.7938 3.45372L12.7062 4.54649C12.9955 4.71183 13.1402 4.7945 13.2938 4.82687C13.4298 4.85551 13.5702 4.85551 13.7062 4.82687C13.8598 4.7945 14.0045 4.71183 14.2938 4.54649L14.6062 4.368C15.3923 3.9188 15.7853 3.6942 16.1076 3.72909C16.3888 3.75953 16.6439 3.90758 16.8098 4.13658C17 4.3991 17 4.8518 17 5.75719V14.0001M17 13.0001H21V19.0001C21 20.1047 20.1046 21.0001 19 21.0001C17.8954 21.0001 17 20.1047 17 19.0001V13.0001Z"
                          stroke="#000000"
                          strokeWidth="0.792"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                      </g>
                    </svg>
                    <span className="ml-4 uppercase">Reciepts</span>
                  </a>
                </li>
                {role === "admin" && (
                  <li className="relative px-4 py-0.5">
                    <a
                      className="inline-flex items-center w-full text-sm font-semibold text-white transition-colors duration-150 cursor-pointer hover:text-green-500"
                      href="/dashboard/users"
                    >
                      <svg
                        width="30"
                        height="30"
                        viewBox="0 0 24.00 24.00"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                          id="SVGRepo_tracerCarrier"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                          <path
                            d="M4 21C4 17.4735 6.60771 14.5561 10 14.0709M19.8726 15.2038C19.8044 15.2079 19.7357 15.21 19.6667 15.21C18.6422 15.21 17.7077 14.7524 17 14C16.2923 14.7524 15.3578 15.2099 14.3333 15.2099C14.2643 15.2099 14.1956 15.2078 14.1274 15.2037C14.0442 15.5853 14 15.9855 14 16.3979C14 18.6121 15.2748 20.4725 17 21C18.7252 20.4725 20 18.6121 20 16.3979C20 15.9855 19.9558 15.5853 19.8726 15.2038ZM15 7C15 9.20914 13.2091 11 11 11C8.79086 11 7 9.20914 7 7C7 4.79086 8.79086 3 11 3C13.2091 3 15 4.79086 15 7Z"
                            stroke="#000000"
                            strokeWidth="0.696"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          ></path>
                        </g>
                      </svg>
                      <span className="ml-4 uppercase">Users</span>
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
