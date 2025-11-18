import TravelPlanList from "./TravelPlanList";
import MyPageHeader from "./MyPageHeader";
import TopDestinationsBanner from "./TopDestinationsBanner";
import Chat from "../../Chat";

function MyPage() {
  return (
    <>
      <div className="mypage-background"></div>
      <div className="mypage-content-wrapper">
        <MyPageHeader />
        <TopDestinationsBanner />
        <TravelPlanList />
        <Chat/>
      </div>
    </>
  );
}
export default MyPage;
