import React, { useState, useEffect } from "react";
import "./App.css";
import {Location} from "./map.js";

function getClosestMetroStation(latitude, longitude, metroStations) {
  //현재 위치와 가장 가까운 지하철 역을 찾는 함수
  if (!latitude || !longitude) {
    return null;
  }

  let closestStation = null;
  let closestDistance = Number.MAX_SAFE_INTEGER;

  for (let i = 0; i < metroStations.length; i++) {
    const distance = haversine(
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
}

function getOtherLineStation(closestStation, metroStations) {
  //환승역(역 명은 같으나, 호선이 다른경우)을 구해 반환하는 함수
  if (!closestStation) {
    //closestStation의 값이 없을때 함수를 더이상 진행하지 않을것
    return [];
  }

  const otherStation = [];

  for (let i = 0; i < metroStations.length; i++) {
    if (
      closestStation.name === metroStations[i].name &&
      closestStation.line !== metroStations[i].line
    ) {
      otherStation.push(metroStations[i]);
    }
  }
  return otherStation;
}

function getAdjacentStations(station, metroStations) {
  //이전역, 다음역 구해 반환하는 함수
  const adjacentStations = {
    previousStation: null,
    nextStation: null,
  };
  let found = false;
  for (let i = 0; i < metroStations.length; i++) {
    if (
      metroStations[i].name === station.name &&
      metroStations[i].line === station.line
    ) {
      found = true;
    } else if (
      found &&
      metroStations[i].name === station.name &&
      metroStations[i].line !== station.line
    ) {
      break;
      //이전역, 다음역이 존재하지 않는 경우의 처리
    } else if (found && metroStations[i].line === station.line) {
      adjacentStations.nextStation = metroStations[i];
      break;
    } else if (metroStations[i].line === station.line) {
      adjacentStations.previousStation = metroStations[i];
    }
  }
  return adjacentStations;
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) ** 2 +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function App() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [metroStations, setMetroStations] = useState([]);
  const [closestStation, setClosestStation] = useState(null);
  const [otherStation, setOtherLineStation] = useState([]);
  const [previousStation, setPreviousStation] = useState(null);
  const [nextStation, setNextStation] = useState(null);

  useEffect(() => {
    if (closestStation) {
      const { previousStation, nextStation } = getAdjacentStations(
        closestStation,
        metroStations
      );
      setPreviousStation(previousStation);
      setNextStation(nextStation);
    } else {
      setPreviousStation(null);
      setNextStation(null);
    }
  }, [closestStation, metroStations]);

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
      console.log("Geolocation is not supported by this browser.");
    }

    //csv 파일에서 지하철 역 정보 가져오기
    fetch("/metro.csv", {
      headers: {
        "Content-Type": "text/csv; charset=UTF-8",
      },
    })
      .then((response) => response.text())
      .then((data) => {
        const rows = data.split("\n");
        //metroStation 구조체 선언
        const metroStations = rows.reduce((result, row) => {
          const columns = row.split(",");
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

  useEffect(() => {
    setClosestStation(
      getClosestMetroStation(latitude, longitude, metroStations)
    );
  }, [latitude, longitude, metroStations]);

  useEffect(() => {
    setOtherLineStation(getOtherLineStation(closestStation, metroStations));
  }, [closestStation, metroStations]);

  return (
    <div>
      <div className="banner">
        <img className="logo_image" alt="metro_logo" src="img/metrologo.png" />
        <p className="banner_text">사용자와 제일 가까운 역을 알려드립니다!</p>
      </div>
      <div className="container">
        <h1>Close Station</h1>
        {/* 현재역과 현재역의 이전역, 다음역 출력 */}
        <div>
          {previousStation && (
            <p className={`circle line-${previousStation.line}`}>
              {previousStation.name}
            </p>
          )}
          {closestStation && (
            <p className={`rounded_rec line-${closestStation.line}`}>
              {closestStation.name}
            </p>
          )}
          {nextStation && (
            <p className={`circle line-${nextStation.line}`}>
              {nextStation.name}
            </p>
          )}
        </div>
        {/* 환승역과 그 역의 이전역, 다음역 출력 */}
        {otherStation.map((station) => (
          <div>
            {getAdjacentStations(station, metroStations).previousStation && (
              <p
                className={`circle line-${
                  getAdjacentStations(station, metroStations).previousStation
                    .line
                }`}
              >
                {
                  getAdjacentStations(station, metroStations).previousStation
                    .name
                }
              </p>
            )}
            <p className={`rounded_rec line-${station.line}`}>{station.name}</p>
            {getAdjacentStations(station, metroStations).nextStation && (
              <p
                className={`circle line-${
                  getAdjacentStations(station, metroStations).nextStation.line
                }`}
              >
                {getAdjacentStations(station, metroStations).nextStation.name}
              </p>
            )}
          </div>
        ))}
      </div>
      <Location />
    </div>
  );
}

export default App;
