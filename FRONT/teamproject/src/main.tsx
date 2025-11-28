import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./css/index.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MainPage from "./components/main/MainPage";
import TravelPlanPage from "./components/plan/TravelPlanPage";
import MyPage from "./components/myPage/MyPage";
import SignUp from "./components/login/SignUp";
import SignIn from "./components/login/SignIn";
import VerifyEmail from "./components/login/VerifyEmail";
import Flight from "./components/plan/Flight";
import CreateTravelPage from "./components/plan/CreateTravelPage";
import TravelPlanPdfPage from "./components/pdfPages/TravelPlanPdfPage";
import "./axiosSetup";

const queryClient = new QueryClient();

// 라우터 설정
const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/create-travel",
    element: <CreateTravelPage />,
  },
  {
    path: "/travels/:travelId",
    element: <TravelPlanPage />,
    children: [
      {
        path: "flight",
        element: <Flight />,
      },
    ],
  },
  {
    path: "/myPage",
    element: <MyPage />,
  },
  {
    path: "/signUp",
    element: <SignUp />,
  },
  {
    path: "/signIn",
    element: <SignIn />,
  },
  {
    path: "/verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/travels/:travelId/pdf",
    element: <TravelPlanPdfPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
