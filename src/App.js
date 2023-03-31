import React, { useState, useEffect } from "react";
import "./App.css";

import { Location } from "./map.js";
import { getClosestStation } from "./function/getinfo.js";
import { getOtherLine } from "./function/getinfo.js";
import { getAdjacent } from "./function/getinfo.js";

function App() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [stations, setStations] = useState([]);
  const [closestStation, setClosestStation] = useState(null);
  const [otherStation, setOtherLine] = useState([]);
  const [previousStation, setPrev] = useState(null);
  const [nextStation, setNext] = useState(null);

  useEffect(() => {
    if (closestStation) {
      const { previousStation, nextStation } = getAdjacent(
        closestStation,
        stations
      );
      setPrev(previousStation);
      setNext(nextStation);
    } else {
      setPrev(null);
      setNext(null);
    }
  }, [closestStation, stations]);

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
        setStations(metroStations);
      });
  }, []);

  useEffect(() => {
    setClosestStation(getClosestStation(latitude, longitude, stations));
  }, [latitude, longitude, stations]);

  useEffect(() => {
    setOtherLine(getOtherLine(closestStation, stations));
  }, [closestStation, stations]);

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
            {getAdjacent(station, stations).previousStation && (
              <p
                className={`circle line-${
                  getAdjacent(station, stations).previousStation.line
                }`}
              >
                {getAdjacent(station, stations).previousStation.name}
              </p>
            )}
            <p className={`rounded_rec line-${station.line}`}>{station.name}</p>
            {getAdjacent(station, stations).nextStation && (
              <p
                className={`circle line-${
                  getAdjacent(station, stations).nextStation.line
                }`}
              >
                {getAdjacent(station, stations).nextStation.name}
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
