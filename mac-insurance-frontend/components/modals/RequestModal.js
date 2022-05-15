import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import s from "../../styles/MarketsModal.module.scss";
import MacInsurance from "../../abis/MacInsuranceMain.json";

// to move this value in a env file
const alchemyKey =
  "https://eth-rinkeby.alchemyapi.io/v2/eHE1jX6Aksdxa1oTvMddTHeKQsIeRuHa";
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const macContractAddress = MacInsurance.address;
const macContractInstance = new web3.eth.Contract(
  MacInsurance.abi,
  macContractAddress
);

export const RequestModal = ({ item, pool, show, onClose }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [amount, setAmount] = useState(0);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const requestInsurance = async () => {
    const transactionParams = {
      from: address,
      to: macContractAddress,
      data: macContractInstance.methods
        .requestInsurance(placeId, amount)
        .encodeABI(),
    };

    try {
      const tx = await web3.eth.sendTransaction(transactionParams);
    } catch (err) {
      console.log("err: ", err);
    }
  };

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const modalContent = show ? (
    <div className={s.modalOverlay}>
      <div className={s.modal}>
        <h3 className={s.modalTitle}>How much are you requesting to insure?</h3>

        <div className={s.priceRow}>
          <p className={s.priceLabel}>{item.name}: </p>
          <input
            className={s.priceValue}
            type="number"
            placeholder="0"
            onChange={handleAmountChange}
          />
        </div>
        <p>[Insurance Fee: {pool.feePercentage}%]</p>
        <div className={s.buttonContainer}>
          <button className={s.modalButton} onClick={requestInsurance}>
            Request
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
