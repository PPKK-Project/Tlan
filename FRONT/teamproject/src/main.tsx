import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import Planning from './components/main/Planning'
import Warning from './components/main/Warning'
import Place from './components/main/Place'
import Footer from './components/main/Footer'
import Counter from './components/Counter'
import TravelPlanList from './components/myPage/TravelPlanList'
import MyPage from './components/myPage/MyPage'




ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Planning />
    <Warning />
    <Place />
    {/* <Counter />gi */}
    <MyPage/>
    <Footer />
  </React.StrictMode>,
)
