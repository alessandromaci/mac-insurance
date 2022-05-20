import s from "../styles/Header.module.scss"
import { Button } from "./Button"
import Image from "next/image"
import RectangleLogo from "../public/rectangle-logo.png"

export const Header = ({ walletConnected, account, connectWallet }) => {
  if (!walletConnected)
    return (
      <div className={s.container}>
        <Image src={RectangleLogo} height={50} width={350} />

        <Button
          handleClick={connectWallet}
          className={s.button}
          buttonText="Connect Wallet"
        />
      </div>
    )
  return (
    <div className={s.container}>
      <Image src={RectangleLogo} height={50} width={350} />

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
