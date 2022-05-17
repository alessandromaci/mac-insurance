import s from "../styles/WalletDashboard.module.scss";
import { useState } from "react";
import ethLogo from "../public/ethLogo.png";
import btcLogo from "../public/bitcoin.svg";
import Image from "next/image";
import { DashboardDetailsModal } from "./modals/DashboardDetailsModal";
import { ToastContainer, toast } from "react-toastify";
import { gql, useQuery } from "@apollo/client";
import { ethers } from "ethers";
import MacInsurance from "../abis/MacInsuranceMain.json";

const GET_PROFILE_POOLS = gql`
  query {
    insuranceRequestEntities {
      createdAtTimestamp
      poolId
      tokenAddress
      feeAmount
      insuranceLiquidityRequest
    }
  }
`;

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const macContractAddress = MacInsurance.address;
const macContractInstance = new web3.eth.Contract(
  MacInsurance.abi,
  macContractAddress
);

export const WalletDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState();
  const [tokenData, setTokenData] = useState();

  const handleModalOpening = (data, token) => {
    setModalData(data);
    setTokenData(token);
    setShowModal(true);
  };

  // Query the list of created pools from the subgraph
  const {
    loading: poolsLoading,
    error: poolsError,
    data: poolsData,
  } = useQuery(GET_PROFILE_POOLS, {
    variables: {
      where: {
        insuranceRequester: "0xfb0ac8078982c876e894e35f5890652886b8c88b", // to be changed once we fethc the user address
      },
    },
  });

  const pools = poolsData?.insuranceRequestEntities;

  const retrieveTokenData = (tokenAddress) => {
    const tokenData = {
      name: "",
      logo: "",
    };
    const checkSumAddress = ethers.utils.getAddress(tokenAddress);
    switch (checkSumAddress) {
      case "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735":
        tokenData.name = "DAI";
        tokenData.logo = daiLogo;
        break;
      case "0xc778417E063141139Fce010982780140Aa0cD5Ab":
        tokenData.name = "WETH";
        tokenData.logo = ethLogo;
        break;
      default:
        break;
    }
    return tokenData;
  };

  const reimburse = async (poolId) => {
    const transactionParams = {
      // Hardcoded address for testing
      from: "0xFB0aC8078982C876E894E35F5890652886b8c88B",
      to: macContractAddress,
      data: macContractInstance.methods
        .requestReimbursement(poolId)
        .encodeABI(),
    };

    try {
      await web3.eth.sendTransaction(transactionParams);
      //Do reimburse stuff
      toast.success("You received your reimbursement!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (err) {
      console.log("err: ", err);
    }
  };

  return (
    <div className={s.container}>
      <h3 className={s.tabHeader}>Your positions</h3>
      <div>
        <div className={s.tableRow}>
          <p className={s.tableHead}>Assets</p>
          <p className={s.tableHead}>Balance</p>
          <p className={s.tableHead}>Expiry Period</p>
        </div>
        {poolsLoading && <div>...loading</div>}
        <div className={s.dataContainer}>
          {pools?.map((item, index) => (
            <div key={index}>
              <div className={s.tableRow}>
                <div className={s.data}>
                  <Image
                    src={retrieveTokenData(item.tokenAddress).logo}
                    width={30}
                    height={30}
                  />
                  <p>{retrieveTokenData(item.tokenAddress).name}</p>
                </div>
                <p className={s.data}>
                  {item.insuranceLiquidityRequest / 10 ** 18}
                </p>
                <p className={s.data}>{"tbc"}</p>
                <div className={s.data}>
                  <button
                    onClick={() => reimburse(item.poolId)}
                    className={s.dataButton}
                  >
                    Reimburse
                  </button>
                </div>
                <div className={s.data}>
                  <button
                    onClick={() =>
                      handleModalOpening(
                        item,
                        retrieveTokenData(item.tokenAddress)
                      )
                    }
                    className={s.dataButton}
                  >
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <ToastContainer />
      <DashboardDetailsModal
        onClose={() => setShowModal(false)}
        show={showModal}
        item={modalData}
        token={tokenData}
      />
    </div>
  );
};
