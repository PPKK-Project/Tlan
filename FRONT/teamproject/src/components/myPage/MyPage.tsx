import { useState } from "react";
import TravelPlanList from "./TravelPlanList";
import MyPageHeader from "./MyPageHeader";
import TopDestinationsBanner from "./TopDestinationsBanner";
import Chat from "../chatting/Chat";
import SharedPlanList from "./SharedPlanList";
import ProfileEditModal from "./ProfileEditModal"; // 새로 만들 컴포넌트

function MyPage() {
  const [isProfileEditModalOpen, setProfileEditModalOpen] = useState(false);

  return (
    <>
      <div className="mypage-background"></div>
      <div className="mypage-content-wrapper">
        <MyPageHeader
          onProfileEditClick={() => setProfileEditModalOpen(true)}
        />
        <TopDestinationsBanner />
        <TravelPlanList />
        <SharedPlanList />
        <Chat />
      </div>
      {isProfileEditModalOpen && (
        <ProfileEditModal onClose={() => setProfileEditModalOpen(false)} />
      )}
    </>
  );
}
export default MyPage;
