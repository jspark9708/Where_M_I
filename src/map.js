import React, { useState, useEffect } from "react";

const { kakao } = window;

export const Location = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

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
  }, []);

  useEffect(() => {
    if (latitude && longitude) {
      // check if latitude and longitude have value
      var container = document.getElementById("map");
      var options = {
        center: new kakao.maps.LatLng(37.365264512305174, 127.10676860117488),
        level: 6,
      };

      var map = new kakao.maps.Map(container, options);
      var markerPosition = new kakao.maps.LatLng(latitude, longitude); // update the values
      var marker = new kakao.maps.Marker({
        position: markerPosition,
      });
      //마커를 지도에 표시 (현재위치)
      marker.setMap(map);
      //center 정보를 변경하여 마커되는 위치로 지도를 이동시키기 위함
      map.setCenter(new kakao.maps.LatLng(latitude, longitude));
    }
  }, [latitude, longitude]); // add dependencies

  return (
    <div
      className="BoxOutline"
      id="map"
      style={{ width: "500px", height: "400px" }}
    ></div>
  );
};
