import s from "../styles/WalletDashboard.module.scss";
import { useState } from "react";
import ethLogo from "../public/ethLogo.png";
import daiLogo from "../public/dai-logo.png";
import Image from "next/image";
import { DashboardDetailsModal } from "./modals/DashboardDetailsModal";
import { ToastContainer, toast } from "react-toastify";
import { gql, useQuery } from "@apollo/client";
import { ethers } from "ethers";
import { useRetrieveTokenData } from "../hooks/useRetrieveTokenData";
import MacInsurance from "../abis/MacInsuranceMain.json";
import TestMacInsurance from "../abis/Test_MacInsuranceMain.json";

const GET_PROFILE_POOLS = gql`
  query ($insuranceRequester: Bytes!) {
    insuranceRequestEntities(
      where: { insuranceRequester: $insuranceRequester }
    ) {
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

const testMacContractInstance = new web3.eth.Contract(
  TestMacInsurance.abi,
  TestMacInsurance.address
);

export const WalletDashboard = ({ account }) => {
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
      insuranceRequester: account,
    },
  });

  const pools = poolsData?.insuranceRequestEntities;

  const retrieveTokenData = (tokenAddress) =>
    useRetrieveTokenData(tokenAddress);
  // small hack to show how the reimbursement will work. I have created a separate pool list that will interact with test contract only
  const testPools = [
    {
      createdAtTimestamp: "1652973323",
      feeAmount: "5000000000000000000",
      insuranceLiquidityRequest: "100000000000000000000",
      poolId: 1,
      tokenAddress: "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735",
      __typename: "InsuranceRequestEntity",
    },
  ];

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
>>>>>>> 5778e86 (adding a separate test flow to show how reimbursement works)

  const reimburse = async (poolId) => {
    const transactionParams = {
      // Hardcoded address for testing
      from: account,
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

  const testReimburse = async (poolId) => {
    const transactionParams = {
      // Hardcoded address for testing
      from: account,
      to: TestMacInsurance.address,
      data: testMacContractInstance.methods
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
          <p className={s.tableHeadAsset}>Asset</p>
          <p className={s.tableHead}>Insurance Request</p>
          <p className={s.tableHead}>Fee Amount</p>
        </div>
        {poolsLoading && <div>...loading</div>}
        <div className={s.dataContainer}>
          {pools?.map((item, index) => (
            <div key={index}>
              <div className={s.tableRow}>
                <div className={s.dataAsset}>
                  <Image
                    src={retrieveTokenData(item.tokenAddress).logo}
                    width={30}
                    height={30}
                  />
                </div>
                <p className={s.data}>
                  {item.insuranceLiquidityRequest / 10 ** 18}{" "}
                  {retrieveTokenData(item.tokenAddress).name}
                </p>
                <p className={s.data}>
                  {item.feeAmount / 10 ** 18}{" "}
                  {retrieveTokenData(item.tokenAddress).name}
                </p>
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
        <div className={s.dataContainer}>
          {testPools?.map((item, index) => (
            <div key={index}>
              <div className={s.tableRow}>
                <div className={s.data}>
                  <Image
                    src={retrieveTokenData(item.tokenAddress).logo}
                    width={30}
                    height={30}
                  />
                  <p>TEST {retrieveTokenData(item.tokenAddress).name}</p>
                </div>
                <p className={s.data}>
                  {item.insuranceLiquidityRequest / 10 ** 18}
                </p>
                <p className={s.data}>{item.feeAmount / 10 ** 18}</p>
                <div className={s.data}>
                  <button
                    onClick={() => testReimburse(item.poolId)}
                    className={s.dataButton}
                  >
                    Reimburse
                  </button>
                </div>
                <div className={s.data}>
                  <button className={s.dataButton}>Details</button>
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
