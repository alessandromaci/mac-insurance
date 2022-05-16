import s from "../styles/Pool.module.scss"
import { useState } from "react"
import Select from "react-select"
import { Button } from "./Button"
import ethLogo from "../public/ethLogo.png"
import daiLogo from "../public/dai-logo.png"
import Image from "next/image"

export const Pool = () => {
  const [selectedToken, setSelectedToken] = useState(null)

  const tokens = [
    { value: "eth", label: "ETH", img: ethLogo },
    { value: "dai", label: "DAI", img: daiLogo },
  ]

  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <h3 className={s.tabHeader}>Create Insurance Pool</h3>
        <div className={s.row}>
          <p className={s.rowLabel}>Select Token</p>
          <div className={s.rowValue}>
            <Select
              theme={(theme) => ({
                ...theme,
                borderRadius: 8,
                colors: {
                  ...theme.colors,
                  primary25: "#03cea4",
                  primary: "#2b2c3b",
                  neutral0: "#2b2c3b",
                  neutral80: "#d6edff",
                },
              })}
              defaultValue={selectedToken}
              onChange={setSelectedToken}
              options={tokens}
              formatOptionLabel={(token) => (
                <div className={s.selectOption}>
                  <Image
                    src={token.img}
                    width={25}
                    height={25}
                    alt="token-image"
                  />
                  <span className={s.selectLabel}>{token.label}</span>
                </div>
              )}
              placeholder="Select token..."
            />
          </div>
        </div>
        <div className={s.row}>
          <p className={s.rowLabel}>Insurance fee</p>
          <div className={s.rowValue}>
            <input
              className={s.numInput}
              type="number"
              min={0}
              max={100}
              placeholder="Enter a number between 0-100"
            />
          </div>
        </div>
        <div className={s.row}>
          <p className={s.rowLabel}>Price Loss Cover %</p>
          <div className={s.inputWithPreview}>
            <input
              className={s.numInput}
              type="number"
              min={0}
              max={100}
              placeholder="Enter a number between 0-100"
            />
            <p className={s.lossPreviewText}>preview</p>
          </div>
        </div>
        <div className={s.row}>
          <p className={s.rowLabel}>Validity period</p>
          <div className={s.rowValue}>
            <p>some date</p>
          </div>
        </div>
        <div className={s.poolSummary}>
          <h3 className={s.summaryHeading}>Supply Liquidity</h3>
          <p className={s.summaryLiquidity}>ETH: 0.0</p>
          <Button
            handleClick={() => console.log("Approve")}
            className={s.button}
            buttonText="Approve"
          />
        </div>
      </div>
    </div>
  )
}
