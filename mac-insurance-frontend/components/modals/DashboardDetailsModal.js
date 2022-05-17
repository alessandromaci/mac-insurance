import s from "../../styles/DashboardDetailsModal.module.scss";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { FaTimesCircle } from "react-icons/fa";
import { gql, useQuery } from "@apollo/client";

const GET_OPEN_POOLS = gql`
  query (
    $first: Int!
    $orderBy: BigInt!
    $orderDirection: String!
    $poolId: Int!
    $state: String!
  ) {
    poolEntities(
      first: $first
      orderBy: $orderBy
      orderDirection: $orderDirection
      where: { poolId: $poolId, state: $state }
    ) {
      createdAtTimestamp
      poolId
      tokenAddress
      insuranceLiquidityAdded
      basePrice
      tresholdPrice
      feePercentage
      startDate
      endDate
    }
  }
`;

export const DashboardDetailsModal = ({ show, onClose, item, token }) => {
  const [isBrowser, setIsBrowser] = useState(false);
  const [poolId, setPoolId] = useState(0);

  useEffect(() => {
    setIsBrowser(true);
  }, []);

  //Step 0: check if the item is changed and, if yes, update the item id
  useEffect(() => {
    if (item) {
      setPoolId(item.poolId);
    }
  }, [item]);

  //Step 1: Query the details of the pool from the subgraph
  const {
    loading: poolLoading,
    error: poolError,
    data: poolData,
  } = useQuery(GET_OPEN_POOLS, {
    variables: {
      first: 1,
      orderBy: "createdAtTimestamp",
      orderDirection: "desc",
      poolId: poolId,
      state: "updated",
    },
  });

  //Step 2: Create a new variable to store the pool data
  const pool = poolData?.poolEntities[0];

  const calculateLossPercentage = (tresholdPrice, basePrice) => {
    const difference = basePrice - tresholdPrice;
    return ((difference * 100) / basePrice).toFixed(2);
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    onClose();
  };

  const modalContent = show ? (
    <div className={s.modalOverlay}>
      <div className={s.modal}>
        <div className={s.modalHeader}>
          <div />
          <h3 className={s.modalTitle}>Insurance Details</h3>
          <FaTimesCircle className={s.modalIcon} onClick={handleCloseClick} />
        </div>

        <div className={s.modalBody}>
          <div className={s.modalRow}>
            <p className={s.label}>Asset</p>
            <p className={s.value}>{token.name}</p>
          </div>
          <div className={s.modalRow}>
            <p className={s.label}>Price Loss Cover %</p>
            <p className={s.value}>
              {`${calculateLossPercentage(
                pool?.tresholdPrice,
                pool?.basePrice
              )} %`}
            </p>
          </div>
          <div className={s.modalRow}>
            <p className={s.label}>Fee %</p>
            <p className={s.value}>{pool?.feePercentage}</p>
          </div>
          <div className={s.modalRow}>
            <p className={s.label}>Validity Period</p>
            <p className={s.value}>TBA</p>
          </div>
          <div className={s.modalRow}>
            <p className={s.label}>Total Amount Insured</p>
            <p className={s.value}>
              {pool?.insuranceLiquidityAdded / 10 ** 18}
            </p>
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
