import s from "../styles/Pool.module.scss"
import { useEffect, useState } from "react"
import Select from "react-select"
import { Button } from "./Button"
import ethLogo from "../public/ethLogo.png"
import daiLogo from "../public/dai-logo.png"
import Image from "next/image"
import { addDays, format } from "date-fns"
import { DateRange, DayPicker, useDayRender } from "react-day-picker"
import "react-day-picker/dist/style.css"

export const Pool = () => {
  const [selectedToken, setSelectedToken] = useState(null)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [range, setRange] = useState()
  const [dateRangePicked, setDateRangePicked] = useState(false)

  const tokens = [
    { value: "eth", label: "ETH", img: ethLogo },
    { value: "dai", label: "DAI", img: daiLogo },
  ]

  let footer = <p>Please pick the first day.</p>
  if (range?.from) {
    if (!range.to) {
      footer = <p>{format(range.from, "PPP")}</p>
    } else if (range.to) {
      footer = (
        <p>
          {format(range.from, "PPP")}–{format(range.to, "PPP")}
        </p>
      )
    }
  }

  useEffect(() => {
    if (range && range.from && range.to) {
      setShowDatePicker(false)
      setDateRangePicked(true)
    }
  }, [range])
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
              placeholder="0%-100%..."
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
              placeholder="0%-100%..."
            />
            <p className={s.lossPreviewText}>{`[<$2357.10]`}</p>
          </div>
        </div>
        <div className={s.row}>
          <p className={s.rowLabel}>Validity period</p>
          <div className={s.rowValue}>
            {!dateRangePicked && !showDatePicker && (
              <Button
                buttonText="Select date"
                handleClick={() => setShowDatePicker(true)}
              />
            )}
            {showDatePicker && (
              <DayPicker
                mode="range"
                selected={range}
                footer={footer}
                onSelect={setRange}
                styles={{ day: { color: "#03cea4" } }}
                modifiersClassNames={{
                  selected: s.selected,
                  day: s.cell,
                }}
              />
            )}
            {range && range.from && range.to && !showDatePicker && (
              <div className={s.dateSelectedContainer}>
                {" "}
                <p className={s.dateRange}>
                  {format(range.from, "PPP")}–{format(range.to, "PPP")}
                </p>
                <button
                  onClick={() => setShowDatePicker(true)}
                  className={s.openDateButton}
                >
                  edit
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={s.poolSummary}>
          <h3 className={s.summaryHeading}>Supply Liquidity</h3>
          <div className={s.supplyContainer}>
            <p className={s.summaryLiquidity}>ETH:</p>
            <input
              className={s.supplyInput}
              type="number"
              min={0}
              defaultValue={0.0}
              step={0.1}
            />
          </div>

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
