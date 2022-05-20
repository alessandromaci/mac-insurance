import s from "../styles/Header.module.scss"
import { Button } from "./Button"
import Image from "next/image"
import Logo from "../public/maclogo.png"

export const Header = ({ walletConnected, account, connectWallet }) => {
  if (!walletConnected)
    return (
      <div className={s.container}>
        <Image className={s.logo} src={Logo} height={90} width={81} />

        <Button
          handleClick={connectWallet}
          className={s.button}
          buttonText="Connect Wallet"
        />
      </div>
    )
  return (
    <div className={s.container}>
      <Image className={s.logo} src={Logo} height={90} width={81} />

      <div className={s.headingItem}>
        <p className={s.text}>
          {account.length !== 42
            ? account
            : `${account.substring(0, 3)}...${account.substring(39, 46)}`}
        </p>
      </div>
    </div>
  )
}
