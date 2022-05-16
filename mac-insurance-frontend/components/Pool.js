import s from "../styles/Pool.module.scss"
import { useState } from "react"
import Select from "react-select"
import { Button } from "./Button"

const tokens = [
  { value: "eth", label: "ETH" },
  { value: "dai", label: "DAI" },
]

export const Pool = () => {
  const [selectedToken, setSelectedToken] = useState(null)
  return (
    <div className={s.container}>
      <div className={s.wrapper}>
        <h3 className={s.tabHeader}>Create Insurance Pool</h3>
        <div className={s.row}>
          <p className={s.rowLabel}>Select Token</p>
          <Select
            defaultValue={selectedToken}
            onChange={setSelectedToken}
            options={tokens}
          />
        </div>
        <div className={s.row}>
          <p className={s.rowLabel}>Insurance fee</p>
          <input type="number" min={0} max={100} />
        </div>
        <div className={s.row}>
          <p className={s.rowLabel}>Price Loss Cover %</p>
          <div className={s.inputWithPreview}>
            <input type="number" min={0} max={100} />
            <p className={s.lossPreviewText}>preview</p>
          </div>
        </div>
        <div className={s.row}>
          <p className={s.rowLabel}>Validity period</p>
          <p>some date</p>
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
