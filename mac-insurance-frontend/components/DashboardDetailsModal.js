import s from "../styles/DashboardDetailsModal.module.scss";
import { useEffect, useRef, useState } from "react";

export const DashboardDetailsModal = ({ show, onClose, children, title }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const handleCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };

  const modalContent = show ? (
    <div className={s.modalOverlay}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <a href="#" onClick={handleCloseClick}>
            x
          </a>
        </div>
        {title && <h3 className={s.modalTitle}>{title}</h3>}
        <div className={s.modalBody}>{children}</div>
      </div>
    </div>
  ) : null;
  if (isBrowser) {
    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("dashboard-modal")
    );
  } else {
    return null;
  }
};
