import axios from "axios";
import { useEffect, useState } from "react";

function Content({ country }) {
  const [data, setData] = useState([]);
  useEffect(() => {
    const getData = async () => {
      const response = await axios.get('http://localhost:8080/api/place')
      setData(response.data.results)
    }
    getData();
  }, [])


  return (
    <>
      <ul> 
        {
          [...data]
            .sort((a, b) => b.rating - a.rating)
            .map(item => (
              <li key={item.place_id}>
                <strong>{item.name}</strong> - 평점: {item.rating}점
              </li>
            ))
        }
      </ul>
    </>
  );
}

export default Content;