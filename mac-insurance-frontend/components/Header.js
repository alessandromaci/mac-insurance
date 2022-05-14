import s from "../styles/Header.module.scss";
import { Button } from "./Button";

export const Header = ({ walletConnected, account, connectWallet }) => {
  if (!walletConnected)
    return (
      <div className={s.container}>
        <div className={s.headingItem}>
          <h1 className={s.text}>LOGO</h1>
        </div>
        <Button
          handleClick={connectWallet}
          className={s.button}
          buttonText="Connect Wallet"
        />
      </div>
    );
  return (
    <div className={s.container}>
      <div className={s.headingItem}>
        <h1 className={s.text}>LOGO</h1>
      </div>
      <div className={s.headingItem}>
        <p className={s.text}>
          {account.length !== 42
            ? account
            : `${account.substring(0, 3)}...${account.substring(39, 46)}`}
        </p>
      </div>
    </div>
  );
};
