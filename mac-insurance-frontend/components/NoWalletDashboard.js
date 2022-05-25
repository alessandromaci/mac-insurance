import s from "../styles/NoWalletDashboard.module.scss";
export const NoWalletDashboard = () => {
  return (
    <div className={s.container}>
      <p className={s.text}>
        Please connect your wallet to Rinkeby to see your open positions
      </p>
    </div>
  );
};
