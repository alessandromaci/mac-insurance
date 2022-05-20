import s from "../styles/Markets.module.scss";
import { useState } from "react";
import Image from "next/image";
import { SupplyModal } from "./modals/SupplyModal";
import { RequestModal } from "./modals/RequestModal";
import { gql, useQuery } from "@apollo/client";
import { useRetrieveTokenData } from "../hooks/useRetrieveTokenData";

const GET_OPEN_POOLS = gql`
  query ($state: String!, $orderBy: BigInt!, $orderDirection: String!) {
    poolEntities(
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { state: $state }
    ) {
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

export const Markets = ({ account }) => {
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [modalData, setModalData] = useState();
  const [modalPoolData, setModalPoolData] = useState();

  // Query the list of created pools from the subgraph
  const {
    loading: poolsLoading,
    error: poolsError,
    data: poolsData,
  } = useQuery(GET_OPEN_POOLS, {
    variables: {
      state: "created",
      orderBy: "startDate",
      orderDirection: "asc",
    },
  });

  const pools = poolsData?.poolEntities;
  const validPools = pools?.filter((pool, index) => {
    const now = new Date();
    const unixtime = (now.valueOf() / 1000).toFixed(2);
    console.log(`unixtime: ${unixtime}`);
    console.log(pool.startDate);
    if (pool.startDate > unixtime) {
      return pool;
    } else {
      return false;
    }
  });

  const retrieveValidityPeriod = (start, end) => {
    const startDate = new Date(start * 1000).toLocaleDateString("en-GB");
    const startTime = new Date(start * 1000).toLocaleTimeString("en-GB");
    const endDate = new Date(end * 1000).toLocaleDateString("en-GB");
    const endTime = new Date(end * 1000).toLocaleTimeString("en-GB");
    return `${startDate} (${startTime}) - ${endDate} (${endTime})`;
  };

  // This is an helper function to get the cover loss percentage. Maybe we can move this operation to the query as well
  const calculateLossPercentage = (tresholdPrice, basePrice) => {
    const difference = basePrice - tresholdPrice;
    return ((difference * 100) / basePrice).toFixed(2);
  };

  // Other helper function to retrieve the right logo and name based on the address.
  const retrieveTokenData = (tokenAddress) =>
    useRetrieveTokenData(tokenAddress);

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
          <p className={s.assetHead}>Assets</p>
          <p className={s.priceLossHead}>Price Loss</p>
          <p className={s.feeHead}>Fee</p>
          <p className={s.validityDataHead}>Validity Period</p>
        </div>
        {poolsLoading && <div>...loading</div>}
        <div className={s.dataContainer}>
          {validPools?.map((item, index) => (
            <div key={index} className={s.tableRow}>
              <div className={s.assetData}>
                <Image
                  src={retrieveTokenData(item.tokenAddress).logo}
                  width={30}
                  height={30}
                />
                {/* <p>{retrieveTokenData(item.tokenAddress).name}</p> */}
              </div>
              <p className={s.priceLossData}>
                {`${calculateLossPercentage(
                  item.tresholdPrice,
                  item.basePrice
                )} % (< $${item.tresholdPrice / 10 ** 8})`}
              </p>
              <p className={s.feeData}>{item.feePercentage} %</p>
              <div className={s.validityData}>
                <p>{retrieveValidityPeriod(item.startDate, item.endDate)}</p>
              </div>

              <div className={s.dataButtonContainer}>
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
          ))}
        </div>
      </div>
      <SupplyModal
        onClose={() => setShowSupplyModal(false)}
        show={showSupplyModal}
        item={modalData}
        pool={modalPoolData}
        account={account}
      />
      <RequestModal
        onClose={() => setShowRequestModal(false)}
        show={showRequestModal}
        item={modalData}
        pool={modalPoolData}
        account={account}
      />
    </div>
  );
};
