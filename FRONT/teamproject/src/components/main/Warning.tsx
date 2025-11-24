import axios from "axios";
import { useQuery } from "@tanstack/react-query";
type countryInfo = {
  country_name: string,
  alarmLevel: number
}
function Warning() {

  const ALERT_LEVELS = [
    { level: 0, text: "정상", colorClass: "normal", dotClass: "normal-dot" },
    { level: 1, text: "여행유의", colorClass: "caution", dotClass: "caution-dot" },
    { level: 2, text: "여행자제", colorClass: "warning", dotClass: "warning-dot" },
    { level: 3, text: "철수권고", colorClass: "danger", dotClass: "danger-dot" },
    { level: 4, text: "여행금지", colorClass: "prohibit", dotClass: "prohibit-dot" },
  ];

  const getWarningData = async () => {
    const response = await axios.get(`${import.meta.env.VITE_BASE_URL}/countries`);
    return response.data.filter((item:countryInfo) => item.alarmLevel > 0).sort((a:countryInfo, b:countryInfo) => b.alarmLevel - a.alarmLevel);
  }

  const { data, isLoading } = useQuery<countryInfo[]>({ queryKey: ['warnings'], queryFn: getWarningData });

  if (isLoading || !data) return null;


  return (
    <>
      <div className="warning-container">
        <div className="warning-content">
          <div className="info-block">
            <span className="warning-icon">⚠️</span>
            <span className="info-text">여행정보</span>
          </div>
          <div className="tag-list">
            <div className="tag-inner-wrapper">
              <div className="tag-group">
                {data.map((item,index) => (
                  <div key={index} className={`warning-tag level-${item.alarmLevel}`}>
                    <span className={`dot level-${item.alarmLevel}-dot`}></span>
                    {item.country_name} {item.alarmLevel}단계
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="legend-container">
        {ALERT_LEVELS.map((alert) => (
          <div key={alert.level} className="legend-item">
            <span className={`legend-dot ${alert.dotClass}`}></span>
            <span className={`legend-text level-${alert.level}`}>
              {alert.level}단계 ({alert.text})
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

export default Warning;