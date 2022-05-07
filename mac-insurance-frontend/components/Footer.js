import s from "../styles/Footer.module.scss";
import { FaHeart, FaCoffee } from "react-icons/fa";

export const Footer = () => {
  const SHAN_HANDLE = "shan8851";
  const SHAN_LINK = `https://twitter.com/${SHAN_HANDLE}`;
  const ALEX_HANDLE = "shan8851";
  const ALEX_LINK = `https://twitter.com/${ALEX_HANDLE}`;
  return (
    <footer className={s.footer}>
      <p className={s.footerText}>
        Built with <FaHeart className={s.altColor} /> and{" "}
        <FaCoffee className={s.altColor} /> by{" "}
        <a
          target="_blank"
          rel="noreferrer"
          className={s.footerLink}
          href={SHAN_LINK}
        >
          {"  "} @Shan8851
        </a>
        &
        <a
          target="_blank"
          rel="noreferrer"
          className={s.footerLink}
          href={ALEX_LINK}
        >
          {"  "} @Alex
        </a>
      </p>
    </footer>
  );
};
