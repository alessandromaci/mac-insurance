import s from "../styles/NoWalletDashboard.module.scss";
export const NoWalletDashboard = () => {
  return (
    <div className={s.container}>
      <p className={s.text}>
        Please Connect your wallet to Rinkeby see your open positions
      </p>
    </div>
  );
};
