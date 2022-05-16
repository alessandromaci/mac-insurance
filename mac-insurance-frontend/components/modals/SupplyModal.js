import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ReactDOM from "react-dom";
import s from "../../styles/MarketsModal.module.scss";
import MacInsurance from "../../abis/MacInsuranceMain.json";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const macContractAddress = MacInsurance.address;
const macContractInstance = new web3.eth.Contract(
  MacInsurance.abi,
  macContractAddress
);

export const SupplyModal = ({ item, pool, show, onClose }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [amount, setAmount] = useState(0);

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const supplyInsurance = async () => {
    const transactionParams = {
      // Hardcoded address for testing
      from: "0xFB0aC8078982C876E894E35F5890652886b8c88B",
      to: macContractAddress,
      data: macContractInstance.methods
        .supplyPool(pool.poolId, ethers.utils.parseEther(amount))
        .encodeABI(),
    };

    try {
      await web3.eth.sendTransaction(transactionParams);
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
        <h3 className={s.modalTitle}>
          How much are you supplying to the pool?
        </h3>

        <div className={s.priceRow}>
          <p className={s.priceLabel}>{item.name}: </p>
          <input
            className={s.priceValue}
            type="number"
            placeholder="0"
            onChange={handleAmountChange}
          />
        </div>
        <div className={s.buttonContainer}>
          <button className={s.modalButton} onClick={supplyInsurance}>
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
