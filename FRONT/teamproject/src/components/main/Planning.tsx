import { useNavigate } from "react-router-dom";
import Header from "./Header";
import mainPageImg from "../../assets/main-page.webp";


function Planning() {
  const navigate = useNavigate();

  return (
    <div
      className="main-container"
      style={{ backgroundImage: `url(${mainPageImg})` }}
    >
      <Header />
      <div className="hero-content">
        <p className="hero-subtext">계획부터 시작하는, 여행이 쉬워지는</p>
        <h1 className="hero-title">나를 아는 여행</h1>
        <h2 className="hero-brand">Tlan</h2>
        
        <div className="mt-12">
          <button
            onClick={() => navigate("/create-travel")}
            className="
              bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700
              text-white text-xl font-bold
              py-4 px-12
              rounded-full
              shadow-xl hover:shadow-2xl
              transition duration-300 ease-in-out
              transform hover:-translate-y-1
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
