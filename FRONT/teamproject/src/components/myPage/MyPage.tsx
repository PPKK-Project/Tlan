import TravelPlanList from "./TravelPlanList";
import MyPageHeader from "./MyPageHeader";
import TopDestinationsBanner from "./TopDestinationsBanner";
import Chat from "../chatting/Chat";
import SharedPlanList from "./SharedPlanList";

function MyPage() {
  return (
    <>
      <div className="mypage-background"></div>
      <div className="mypage-content-wrapper">
        <MyPageHeader />
        <TopDestinationsBanner />
        <TravelPlanList />
        <SharedPlanList />
        <Chat />
      </div>
    </>
  );
}
export default MyPage;
