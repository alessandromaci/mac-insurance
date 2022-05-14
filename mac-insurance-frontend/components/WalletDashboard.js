import s from "../styles/WalletDashboard.module.scss";
import { useState } from "react";
import ethLogo from "../public/ethLogo.png";
import btcLogo from "../public/bitcoin.svg";
import Image from "next/image";
import { DashboardDetailsModal } from "./modals/DashboardDetailsModal";
import { ToastContainer, toast } from "react-toastify";

const dummyData = [
  {
    logo: ethLogo,
    balance: 0.776,
    expiry: "24 Sep 2022",
    asset: "ETH",
    insuranceDetails: "Ethereum @ 10%",
    cover: "10% (< $2,700)",
    fee: "5%",
    validityPeriod: { from: "05 May 2022", to: "04 Sep 2022" },
    totalInsured: "11 ETH ($22,000)",
  },
  {
    logo: btcLogo,
    balance: 1.7,
    expiry: "17 Nov 2022",
    asset: "BTC",
    insuranceDetails: "Ethereum @ 10%",
    cover: "10% (< $2,700)",
    fee: "5%",
    validityPeriod: { from: "05 May 2022", to: "04 Sep 2022" },
    totalInsured: "11 ETH ($22,000)",
  },
];

export const WalletDashboard = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState();

  const handleModalOpening = (data) => {
    setModalData(data);
    setShowModal(true);
  };

  const reimburse = () => {
    // Do reimburse stuff
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
                <p className={s.data}>{item.balance}</p>
                <p className={s.data}>{item.expiry}</p>
                <div className={s.data}>
                  <button onClick={reimburse} className={s.dataButton}>
                    Reimburse
                  </button>
                </div>
                <div className={s.data}>
                  <button
                    onClick={() => handleModalOpening(item)}
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
      />
    </div>
  );
};
