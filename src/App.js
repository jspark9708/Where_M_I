import React, { useState, useEffect } from 'react';
import './App.css';


function App() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [metroStations, setMetroStations] = useState([]);
  const [closestStation, setClosestStation] = useState(null);
  
  const getClosestMetroStation = () => {
    // 현재 위치와 가장 가까운 지하철 역을 찾는 함수
    if (!latitude || !longitude) {
      return null;
    }

    let closestStation = null;
    let closestDistance = Number. MAX_SAFE_INTEGER;

    for (let i = 0; i < metroStations.length; i++) {
      const distance = Haversine(
        latitude,
        longitude,
        metroStations[i].lat,
        metroStations[i].long
      );
      if (distance < closestDistance) {
        closestStation = metroStations[i];
        closestDistance = distance;
      }
    }
    return closestStation;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
    }

    // csv 파일에서 지하철 역 정보 가져오기
    fetch('/metro.csv', {
      headers: {
        'Content-Type': 'text/csv; charset=UTF-8',
      },
    })
      .then((response) => response.text())
      .then((data) => {
        const rows = data.split('\n');
        //metroStation의 구조체 선언 부분
        const metroStations = rows.reduce((result, row) => {
          const columns = row.split(',');
          const station = {
            line: columns[0],
            id: columns[1],
            name: columns[2],
            long: parseFloat(columns[3]),
            lat: parseFloat(columns[4]),
          };
          result.push(station);
          return result;
        }, []);
        setMetroStations(metroStations);
      });
  }, []);

  const Haversine = (lat1, lon1, lat2, lon2) => {
    //하버시안 공식을 이용하여 두 점 사이의 거리 구하기
    const R = 6371e3; // 지구의 반지름 (m)
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) *
        Math.cos(φ2) *
        Math.sin(Δλ / 2) *
        Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

  useEffect(() => {
    setClosestStation(getClosestMetroStation());
  }, [latitude, longitude, metroStations]);

  return (
    <div className="container">
      <div>
        <h1>Current Location</h1>
        <p>Latitude: {latitude}</p>
        <p>Longitude: {longitude}</p>
      </div>
      <div>
        <h1>Close Station</h1>
        <p>Station: {closestStation && closestStation.name}</p>
      </div>
      <div className="btn_area">
        <p className="belowDescription"> 역의 정확도는 사용자의 네트워크 상태에 따라 틀릴수도 있습니다.</p>
      </div>      
    </div>
  );
}

export default App;