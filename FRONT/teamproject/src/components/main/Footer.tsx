
function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-sections">
          <div className="footer-section" style={{ minWidth: '200px' }}>
            <h3 className="section-header">TravelPlan</h3>
            <p className="section-description">
              완벽한 여행을 위한 모든 것
            </p>
          </div>
          <div className="footer-section">
            <h3 className="section-header">서비스</h3>
            <ul className="section-list">
              <li><a href="#">항공권</a></li>
              <li><a href="#">숙소</a></li>
              <li><a href="#">관광지</a></li>
              <li><a href="#">맛집</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="section-header">고객지원</h3>
            <ul className="section-list">
              <li><a href="#">고객센터</a></li>
              <li><a href="#">FAQ</a></li>
              <li><a href="#">이용약관</a></li>
              <li><a href="#">개인정보처리방침</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h3 className="section-header">연락처</h3>
            <div className="contact-detail">이메일: info</div>
            <div className="contact-detail">전화: 1588-0000</div>
            <div className="contact-detail">운영시간: 24시간</div>
          </div>
        </div>
        <div className="footer-copyright">
          © 2024 TravelPlan. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;