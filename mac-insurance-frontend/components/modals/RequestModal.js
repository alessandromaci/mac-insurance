import { useEffect, useState } from "react";
import { ethers } from "ethers";
import ReactDOM from "react-dom";
import s from "../../styles/MarketsModal.module.scss";
import MacInsurance from "../../abis/MacInsuranceMain.json";
import ERC20 from "../../abis/TokenMain.json";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const macContractAddress = MacInsurance.address;

export const RequestModal = ({ item, pool, show, onClose, account }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [amount, setAmount] = useState(0);
  const [fee, setFee] = useState(0);
  const [buttonText, setButtonText] = useState(true);

  const macContractInstance = new web3.eth.Contract(
    MacInsurance.abi,
    macContractAddress
  );

  const tokenContractInstance = new web3.eth.Contract(
    ERC20.abi,
    pool?.tokenAddress
  );

  const requestInsurance = async () => {
    // Step 1: Call the ERC20 contract to approve the transfer of tokens
    const approveTokenTransactionParams = {
      // now have access to account variable
      from: account,
      to: pool?.tokenAddress,
      data: tokenContractInstance.methods
        .approve(macContractAddress, ethers.utils.parseEther(amount))
        .encodeABI(),
    };

    const transactionParams = {
      from: account,
      to: macContractAddress,
      data: macContractInstance.methods
        .requestInsurance(pool.poolId, ethers.utils.parseEther(amount))
        .encodeABI(),
    };

    try {
      setButtonText(false);
      await web3.eth.sendTransaction(approveTokenTransactionParams);
      await web3.eth.sendTransaction(transactionParams);
      setButtonText(true);
    } catch (err) {
      console.log("err: ", err);
    }
  };

  const getFee = async () => {
    try {
      const fee = await macContractInstance.methods
        .getUserFee(pool?.poolId, ethers.utils.parseEther(amount))
        .call();
      if (fee) {
        setFee(fee);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (amount > 0 && pool) {
      getFee();
    }
  }, [amount]);

  useEffect(() => {
    setFee(0);
  }, [pool]);

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
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <p>
          [Preview Insurance Fee: {fee ? ethers.utils.formatEther(fee) : "na"}{" "}
          {item.name}]
        </p>
        <div className={s.buttonContainer}>
          <button className={s.modalButton} onClick={requestInsurance}>
            {buttonText ? `Request` : `Loading...`}
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
