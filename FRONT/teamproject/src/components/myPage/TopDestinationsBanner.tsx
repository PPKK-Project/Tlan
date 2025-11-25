import { usePlacesData } from "../../util/usePlacesData";
import place1 from "../../assets/place1.webp";
import "../../css/Place.css";
import place2 from "../../assets/place2.webp";
import place3 from "../../assets/place3.webp";
import place4 from "../../assets/place4.webp";
import place5 from "../../assets/place5.webp";
import place6 from "../../assets/place6.webp";
import place7 from "../../assets/place7.webp";
import place8 from "../../assets/place8.webp";
import place9 from "../../assets/place9.webp";
import place10 from "../../assets/place10.webp";

function TopDestinationsBanner() {
  const { places } = usePlacesData();
  const imageUrls = [
    place1,
    place2,
    place3,
    place4,
    place5,
    place6,
    place7,
    place8,
    place9,
    place10,
  ];

  if (!places) return null;

  return (
    <div className="destinations-banner-container">
      <div className="destinations-list">
        <div className="destinations-inner-wrapper">
          {[...places, ...places].map((place, index) => (
            <div key={`original-${index}`} className="destination-card">
              <div
                className="card-background"
                style={{ backgroundImage: `url(${imageUrls[index % 10]})` }}
              />
              <div className="card-overlay">
                <span className="card-rank">#{(index % 10) + 1}</span>
                <span className="card-title">{place.name}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TopDestinationsBanner;
