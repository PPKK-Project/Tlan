import { useNavigate } from "react-router-dom";
import Header from "./Header";
import mainPageImg2 from "../../assets/mainpage_image.webp";
import { useEffect, useState } from "react";

function Planning() {
  const [isLogin, setLogin] = useState(!!localStorage.getItem("jwt"));
  useEffect(() => {
    const checkLoginStatus = () => setLogin(!!localStorage.getItem("jwt"));
    window.addEventListener("storage", checkLoginStatus);
    return () => window.removeEventListener("storage", checkLoginStatus);
  }, []);
  
  const navigate = useNavigate();
  const handleNavigate = () => {
    if(isLogin) navigate("/create-travel");
    else alert('로그인이 필요한 서비스입니다.')
  }
  return (
    <div
      className="main-container"
      style={{ backgroundImage: `url(${mainPageImg2})` }}
    >
      <Header travelInfo={undefined} formattedDateRange={undefined} />
      <div className="hero-content">
        <p className="hero-subtext">계획부터 시작하는, 여행이 쉬워지는</p>
        <h1 className="hero-title">나를 아는 여행</h1>
        <h2 className="hero-brand">Tlan</h2>

        <div className="mt-12">
          <button
            onClick={handleNavigate}
            className="
              bg-white
              text-[#00B8D4]
              border border-[#00B8D4]
              text-xl font-bold
              py-4 px-12
              rounded-full
              shadow-xl
              transition duration-300 ease-in-out
              transform hover:-translate-y-1 hover:shadow-2xl
            "
          >
            여행 계획하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default Planning;
