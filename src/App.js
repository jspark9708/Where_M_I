import React, { useState, useEffect } from "react";
import "./App.css";
import { Location } from "./map.js";
import { getClosestMetroStation } from "./function/getinfo.js";
import { getOtherLineStation } from "./function/getinfo.js";
import { getAdjacentStations } from "./function/getinfo.js";

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
        <h2>가장 가까운 역</h2>
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
      <div className="ComponentBox">
        <Location />
      </div>
    </div>
  );
}

export default App;
