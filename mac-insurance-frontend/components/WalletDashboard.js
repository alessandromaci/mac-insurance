import s from "../styles/WalletDashboard.module.scss";
import { useState } from "react";
import ethLogo from "../public/ethLogo.png";
import btcLogo from "../public/bitcoin.svg";
import Image from "next/image";
import { DashboardDetailsModal } from "./DashboardDetailsModal";
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

const reimburse = () => {
  // Do reimburse stuff
  console.log("reimburse");
};
export const WalletDashboard = () => {
  const [showModal, setShowModal] = useState(false);

  const notify = () =>
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
                  <button onClick={notify} className={s.dataButton}>
                    Reimburse
                  </button>
                  <ToastContainer />
                </div>
                <div className={s.data}>
                  <button
                    onClick={() => setShowModal(true)}
                    className={s.dataButton}
                  >
                    Details
                  </button>
                </div>
              </div>
              <DashboardDetailsModal
                onClose={() => setShowModal(false)}
                show={showModal}
                title={item.insuranceDetails}
                asset={item.asset}
                cover={item.cover}
                fee={item.fee}
                validityPeriod={item.validityPeriod}
                totalInsured={item.totalInsured}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
