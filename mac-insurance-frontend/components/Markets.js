import s from "../styles/Markets.module.scss";
import ethLogo from "../public/ethLogo.png";
import btcLogo from "../public/bitcoin.svg";
import { useState } from "react";
import Image from "next/image";
import { SupplyModal } from "./modals/SupplyModal";
import { RequestModal } from "./modals/RequestModal";

const dummyData = [
  {
    logo: btcLogo,
    asset: "BTC",
    cover: "10% (< $2,700)",
    fee: "5%",
    insuranceFee: 0.13,
    price: 2.8,
  },
  {
    logo: ethLogo,
    asset: "ETH",
    cover: "10% (< $2,700)",
    fee: "5%",
    insuranceFee: 0.03,
    price: 2.15,
  },
];

export const Markets = () => {
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [modalData, setModalData] = useState();

  const handleSupplyModal = (data) => {
    setModalData(data);
    setShowSupplyModal(true);
  };

  const handleRequestModal = (data) => {
    setModalData(data);
    setShowRequestModal(true);
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
        <div className={s.dataContainer}>
          {dummyData.map((item, index) => (
            <div key={index}>
              <div className={s.tableRow}>
                <div className={s.data}>
                  <Image src={item.logo} width={30} height={30} />
                </div>
                <p className={s.data}>{item.cover}</p>
                <p className={s.data}>{item.fee}</p>
                <div className={s.data}>
                  <button
                    onClick={() => handleSupplyModal(item)}
                    className={s.dataButton}
                  >
                    Supply
                  </button>
                </div>
                <div className={s.data}>
                  <button
                    onClick={() => handleRequestModal(item)}
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
      />
      <RequestModal
        onClose={() => setShowRequestModal(false)}
        show={showRequestModal}
        item={modalData}
      />
    </div>
  );
};
