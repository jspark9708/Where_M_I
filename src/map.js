import React, { useState ,useEffect } from 'react'

const {kakao} = window;

export const Location=()=>{

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
    }, [])

  useEffect(()=>{
    var container = document.getElementById('map');
    var options = {
      center: new kakao.maps.LatLng(37.365264512305174, 127.10676860117488),
      level: 3
    };

    var map = new kakao.maps.Map(container, options);
    var markerPosition  = new kakao.maps.LatLng(longitude, latitude); 
    var marker = new kakao.maps.Marker({
      position: markerPosition
  });
  marker.setMap(map);

    }, [longitude, latitude])


    return (
        <div>
        <div id="map" style={{width:"500px", height:"400px"}}></div>
        </div>
    )
}