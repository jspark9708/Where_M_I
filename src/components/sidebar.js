import React from "react";
import "../App.css";

export default function Sidebar() {
  return (
    <div class="sidebar">
      <a
        href="https://www.sisul.or.kr/open_content/skydome/introduce/pop_subway.jsp"
        target="_blank"
      >
        <i class="fas fa-envelope"></i>
      </a>
      <a href="/info">
        <i class="fas fa-info"></i>
      </a>
    </div>
  );
}
