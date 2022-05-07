import s from "../styles/WalletDashboard.module.scss";
import ethLogo from "../public/ethLogo.png";
import btcLogo from "../public/bitcoin.svg";
import Image from "next/image";

const dummyData = [
  { logo: ethLogo, balance: 0.776, expiry: "24 Sep 2022" },
  { logo: btcLogo, balance: 1.7, expiry: "17 Nov 2022" },
];

const reimburse = () => {
  // Do reimburse stuff
  console.log("reimburse");
};
export const WalletDashboard = () => {
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
            <div className={s.tableRow} key={index}>
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
                <button className={s.dataButton}>Details</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
