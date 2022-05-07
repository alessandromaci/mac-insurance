import s from "../styles/DashboardDetailsModal.module.scss";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FaTimesCircle } from "react-icons/fa";

export const DashboardDetailsModal = ({
  show,
  onClose,
  title,
  asset,
  cover,
  fee,
  validityPeriod,
  totalInsured,
}) => {
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
          <div />
          <h3 className={s.modalTitle}>{title}</h3>
          <FaTimesCircle className={s.modalIcon} onClick={handleCloseClick} />
        </div>

        <div className={s.modalBody}>
          <div className={s.modalRow}>
            <p className={s.label}>Asset</p>
            <p className={s.value}>{asset}</p>
          </div>
          <div className={s.modalRow}>
            <p className={s.label}>Price Loss Cover %</p>
            <p className={s.value}>{cover}</p>
          </div>
          <div className={s.modalRow}>
            <p className={s.label}>Fee %</p>
            <p className={s.value}>{fee}</p>
          </div>
          <div className={s.modalRow}>
            <p className={s.label}>Validity Period</p>
            <p className={s.value}>
              {validityPeriod.from} - {validityPeriod.to}
            </p>
          </div>
          <div className={s.modalRow}>
            <p className={s.label}>Total Amount Insured</p>
            <p className={s.value}>{totalInsured}</p>
          </div>
        </div>
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
