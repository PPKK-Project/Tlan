import { useEffect, useState } from "react";
import { Place } from "../main/Place";

function TopDestinationsBanner() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  useEffect(() => {
    setImageUrls(sessionStorage.getItem("imageUrls") ? JSON.parse(sessionStorage.getItem("imageUrls") as string) : []);
    setPlaces(sessionStorage.getItem("places") ? JSON.parse(sessionStorage.getItem("places") as string) : []);
  }, [])

  return (
    <div className="destinations-banner-container">
      <div className="destinations-list">
        <div className="destinations-inner-wrapper">
          {[...places, ...places].map((place, index) => (
            <div key={index} className="destination-card">
              <div
                className="card-background"
                style={{ backgroundImage: `url(${imageUrls[(index % 10)]})` }}
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
