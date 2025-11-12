import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import MainPage from './components/MainPage';
import TravelPlanPage from './components/plan/TravelPlanPage';

// 라우터 설정
const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    // :travelId 파라미터를 통해 어떤 여행인지 구분
    path: '/travels/:travelId', 
    element: <TravelPlanPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
