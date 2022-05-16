import s from "../styles/Markets.module.scss";
import ethLogo from "../public/ethLogo.png";
import daiLogo from "../public/dai-logo.png";
import btcLogo from "../public/bitcoin.svg";
import { useState } from "react";
import Image from "next/image";
import { SupplyModal } from "./modals/SupplyModal";
import { RequestModal } from "./modals/RequestModal";
import { gql, useQuery } from "@apollo/client";

const GET_OPEN_POOLS = gql`
  query {
    poolEntities(first: 5, where: { state: "created" }) {
      createdAtTimestamp
      poolId
      tokenAddress
      basePrice
      tresholdPrice
      feePercentage
      startDate
      endDate
    }
  }
`;

export const Markets = () => {
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [modalData, setModalData] = useState();
  const [modalPoolData, setModalPoolData] = useState();

  // Query the list of created pools from the subgraph
  const {
    loading: poolsLoading,
    error: poolsError,
    data: poolsData,
  } = useQuery(GET_OPEN_POOLS);

  const pools = poolsData?.poolEntities;
  console.log(pools);

  // This is an helper function to get the cover loss percentage. Maybe we can move this operation to the query as well
  const calculateLossPercentage = (tresholdPrice, basePrice) => {
    const difference = basePrice - tresholdPrice;
    return ((difference * 100) / basePrice).toFixed(2);
  };

  // Other helper function to retrieve the right logo based on the address. Noticed a very weird behaviour where the token address letters gets changed between lower and capital. Super weird! Temporarily treating both difference like this.
  const retrieveTokenData = (tokenAddress) => {
    const tokenData = {
      name: "",
      logo: "",
    };
    switch (tokenAddress) {
      case "0xc7ad46e0b8a400bb3c915120d284aafba8fc4735":
        tokenData.name = "DAI";
        tokenData.logo = daiLogo;
        break;
      case "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735":
        tokenData.name = "DAI";
        tokenData.logo = daiLogo;
        break;
      case "0xc778417E063141139Fce010982780140Aa0cD5Ab":
        tokenData.name = "WETH";
        tokenData.logo = ethLogo;
        break;
      case "0xc778417e063141139fce010982780140aa0cd5ab":
        tokenData.name = "WETH";
        tokenData.logo = ethLogo;
        break;
      default:
        break;
    }
    return tokenData;
  };

  const handleSupplyModal = (data, pool) => {
    setModalData(data);
    setModalPoolData(pool);
    setShowSupplyModal(true);
  };

  const handleRequestModal = (data, pool) => {
    setModalData(data);
    setModalPoolData(pool);
    setShowRequestModal(true);
  };
  return (
    <div className={s.container}>
      <h3 className={s.tabHeader}>Open Insurance Pools</h3>
      <div>
        <div className={s.tableRow}>
          <p className={s.tableHead}>Assets</p>
          <p className={s.tableHead}>Price Loss %</p>
          <p className={s.tableHead}>Fee %</p>
        </div>
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
                  {`${calculateLossPercentage(
                    item.tresholdPrice,
                    item.basePrice
                  )} % (< $${item.tresholdPrice / 10 ** 8})`}
                </p>
                <p className={s.data}>{item.feePercentage} %</p>
                <div className={s.data}>
                  <button
                    onClick={() =>
                      handleSupplyModal(
                        retrieveTokenData(item.tokenAddress),
                        item
                      )
                    }
                    className={s.dataButton}
                  >
                    Supply
                  </button>
                </div>
                <div className={s.data}>
                  <button
                    onClick={() =>
                      handleRequestModal(
                        retrieveTokenData(item.tokenAddress),
                        item
                      )
                    }
                    className={s.dataButton}
                  >
                    Request
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <SupplyModal
        onClose={() => setShowSupplyModal(false)}
        show={showSupplyModal}
        item={modalData}
        pool={modalPoolData}
      />
      <RequestModal
        onClose={() => setShowRequestModal(false)}
        show={showRequestModal}
        item={modalData}
        pool={modalPoolData}
      />
    </div>
  );
};
