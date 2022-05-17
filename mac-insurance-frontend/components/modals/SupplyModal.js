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

export const SupplyModal = ({ item, pool, show, onClose }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [amount, setAmount] = useState(0);

  // Step 0: Creating contract instance for mac and ERC20
  const macContractInstance = new web3.eth.Contract(
    MacInsurance.abi,
    macContractAddress
  );

  const tokenContractInstance = new web3.eth.Contract(
    ERC20.abi,
    pool?.tokenAddress
  );

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
  };

  const supplyInsurance = async () => {
    // Step 1: Call the ERC20 contract to approve the transfer of tokens
    const approveTokenTransactionParams = {
      from: "0xFB0aC8078982C876E894E35F5890652886b8c88B", // Hardcoded address for testing
      to: pool?.tokenAddress,
      data: tokenContractInstance.methods
        .approve(macContractAddress, ethers.utils.parseEther(amount))
        .encodeABI(),
    };

    // Step 2: Call the main contract to supply insurance.
    const supplyInsuranceTransactionParams = {
      from: "0xFB0aC8078982C876E894E35F5890652886b8c88B", // Hardcoded address for testing
      to: macContractAddress,
      data: macContractInstance.methods
        .supplyPool(pool.poolId, ethers.utils.parseEther(amount))
        .encodeABI(),
    };

    try {
      await web3.eth.sendTransaction(approveTokenTransactionParams);
      await web3.eth.sendTransaction(supplyInsuranceTransactionParams);
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
