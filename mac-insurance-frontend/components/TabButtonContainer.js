import { Button } from "./Button";
import s from "../styles/TabButtonContainer.module.scss";
import { useState } from "react";

export const TabButtonContainer = ({ getter, setter }) => {
  return (
    <div className={s.container}>
      <button
        onClick={() => setter("Dashboard")}
        className={getter === "Dashboard" ? s.pillSelected : s.pill}
      >
        Dashboard
      </button>
      <button
        onClick={() => setter("Markets")}
        className={getter === "Markets" ? s.pillSelected : s.pill}
      >
        Markets
      </button>
      <button
        onClick={() => setter("Pool")}
        className={getter === "Pool" ? s.pillSelected : s.pill}
      >
        Pool
      </button>
    </div>
  );
};
