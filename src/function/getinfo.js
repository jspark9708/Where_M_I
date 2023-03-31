import haversine from "./haversine.js";

export function getClosestMetroStation(latitude, longitude, metroStations) {
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

export function getOtherLineStation(closestStation, metroStations) {
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

export function getAdjacentStations(station, metroStations) {
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
