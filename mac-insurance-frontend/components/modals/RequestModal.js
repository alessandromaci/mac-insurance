import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import s from "../../styles/MarketsModal.module.scss";

export const RequestModal = ({ item, show, onClose }) => {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const modalContent = show ? (
    <div className={s.modalOverlay}>
      <div className={s.modal}>
        <h3 className={s.modalTitle}>How much are you requesting to insure?</h3>

        <div className={s.priceRow}>
          <p className={s.priceLabel}>{item.asset}: </p>
          <p className={s.priceValue}>{item.price} </p>
        </div>
        <p>[Insurance Fee {item.insuranceFee}]</p>
        <div className={s.buttonContainer}>
          <button className={s.modalButton} onClick={onClose}>
            Supply
          </button>
          <button className={s.modalButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  ) : null;

  if (isBrowser) {
    return ReactDOM.createPortal(
      modalContent,
      document.getElementById("supply-modal")
    );
  } else {
    return null;
  }
};
