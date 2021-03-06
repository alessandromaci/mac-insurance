import s from "../styles/Pool.module.scss";
import { useEffect, useState } from "react";
import Select from "react-select";
import { Button } from "./Button";
import ethLogo from "../public/ethLogo.png";
import daiLogo from "../public/dai-logo.png";
import uscLogo from "../public/usdc-logo.png";
import snxLogo from "../public/snx-logo.png";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import { addDays, format } from "date-fns";
import { DateRange, DayPicker, useDayRender } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { ethers } from "ethers";
import MacInsurance from "../abis/MacInsuranceMain.json";
import ERC20 from "../abis/TokenMain.json";
import Tooltip from "@mui/material/Tooltip";

const alchemyKey = process.env.NEXT_PUBLIC_ALCHEMY_KEY;
const { createAlchemyWeb3 } = require("@alch/alchemy-web3");
const web3 = createAlchemyWeb3(alchemyKey);
const macContractAddress = MacInsurance.address;

export const Pool = ({ account }) => {
  const [selectedToken, setSelectedToken] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [range, setRange] = useState();
  const [dateRangePicked, setDateRangePicked] = useState(false);
  const [fee, setFee] = useState(null);
  const [lossCover, setLossCover] = useState(null);
  const [amount, setAmount] = useState(null);
  const [buttonText, setButtonText] = useState(true);

  // Step 0: Creating contract instance for mac and ERC20
  const macContractInstance = new web3.eth.Contract(
    MacInsurance.abi,
    macContractAddress
  );

  const tokenContractInstance = new web3.eth.Contract(
    ERC20.abi,
    selectedToken?.contractAddress
  );

  const initAndSupplyInsurance = async () => {
    // Step 0: Find contract id
    const id = await macContractInstance.methods.id().call();

    //Step 1: Call function to init pool
    const initInsuranceTransactionParams = {
      from: account, // Hardcoded address for testing
      to: macContractAddress,
      data: macContractInstance.methods
        .initPool(
          selectedToken.contractAddress,
          selectedToken.priceFeed,
          lossCover,
          fee,
          startDate,
          endDate
        )
        .encodeABI(),
    };
    // Step 2: Call the ERC20 contract to approve the transfer of tokens
    const approveTokenTransactionParams = {
      from: account, // Hardcoded address for testing
      to: selectedToken.contractAddress,
      data: tokenContractInstance.methods
        .approve(macContractAddress, ethers.utils.parseEther(amount))
        .encodeABI(),
    };

    // Step 3: Call the main contract to supply insurance.
    const supplyInsuranceTransactionParams = {
      from: account, // Hardcoded address for testing
      to: macContractAddress,
      data: macContractInstance.methods
        .supplyPool(id, ethers.utils.parseEther(amount))
        .encodeABI(),
    };

    try {
      setButtonText(false);
      await web3.eth.sendTransaction(initInsuranceTransactionParams);
      await web3.eth.sendTransaction(approveTokenTransactionParams);
      await web3.eth.sendTransaction(supplyInsuranceTransactionParams);
      setButtonText(true);
      toast.success("You created a new insurance pool!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
    } catch (err) {
      console.log("err: ", err);
    }
  };

  const tokens = [
    {
      value: "eth",
      label: "WETH",
      img: ethLogo,
      contractAddress: "0xc778417E063141139Fce010982780140Aa0cD5Ab",
      priceFeed: "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e",
    },
    {
      value: "dai",
      label: "DAI",
      img: daiLogo,
      contractAddress: "0xc7AD46e0b8a400Bb3C915120d284AafbA8fc4735",
      priceFeed: "0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF",
    },
    {
      value: "usdc",
      label: "USDC",
      img: uscLogo,
      contractAddress: "0xeb8f08a975Ab53E34D8a0330E0D34de942C95926",
      priceFeed: "0xa24de01df22b63d23Ebc1882a5E3d4ec0d907bFB",
    },
    {
      value: "snx",
      label: "SNX",
      img: snxLogo,
      contractAddress: "0x322A3346bf24363f451164d96A5b5cd5A7F4c337",
      priceFeed: "0xE96C4407597CD507002dF88ff6E0008AB41266Ee",
    },
  ];

  let footer = <p>Please pick the first day.</p>;
  if (range?.from) {
    if (!range.to) {
      footer = <p>{format(range.from, "PPP")}</p>;
    } else if (range.to) {
      footer = (
        <p>
          {format(range.from, "PPP")}???{format(range.to, "PPP")}
        </p>
      );
    }
  }

  // time variables to calculate the contract inputs in second differences
  const t0 = new Date();
  const t1 = new Date(range?.from);
  const t2 = new Date(range?.to);

  const startDate = ((t1.getTime() - t0.getTime()) / 1000).toFixed(0); //_startDateFromDeployInSeconds
  const endDate = ((t2.getTime() - t0.getTime()) / 1000).toFixed(0); //_endDateFromDeployInSeconds

  useEffect(() => {
    if (range && range.from && range.to) {
      setShowDatePicker(false);
      setDateRangePicked(true);
    }
  }, [range]);
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
          <Tooltip
            arrow
            placement="left"
            title="This represents the percentage of total value insured used for fee and it is used to calculate the user's premium insurance "
          >
            <p className={s.rowLabel}>Insurance fee %</p>
          </Tooltip>
          <div className={s.rowValue}>
            <input
              className={s.numInput}
              type="number"
              min={0}
              max={100}
              placeholder="0%-100%..."
              onChange={(e) => setFee(e.target.value)}
            />
          </div>
        </div>
        <div className={s.row}>
          <Tooltip
            arrow
            placement="left"
            title="This represents the percetage of price loss that the pool will cover. Beyond this percentage, the user will be reimbursed the loss cover amount"
          >
            <p className={s.rowLabel}>Price Loss Cover %</p>
          </Tooltip>
          <div className={s.inputWithPreview}>
            <input
              className={s.numInput}
              type="number"
              min={0}
              max={100}
              placeholder="0%-100%..."
              onChange={(e) => setLossCover(e.target.value)}
            />
          </div>
        </div>
        <div className={s.row}>
          <Tooltip
            arrow
            placement="left"
            title="This represents the activity period of the insurance pool. Users will be able to receive their reimbursemnts during the activity period. It is however not possible both to supply new liquidity and request insurance during this period."
          >
            <p className={s.rowLabel}>Validity period</p>
          </Tooltip>
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
                  {format(range.from, "PPP")} ??? {format(range.to, "PPP")}
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
            <p className={s.summaryLiquidity}>{selectedToken?.label ?? ""}</p>
            <input
              className={s.supplyInput}
              type="number"
              min={0}
              defaultValue={0.0}
              step={0.1}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <Button
            handleClick={() => initAndSupplyInsurance()}
            className={s.button}
            buttonText={buttonText ? "Create" : "Loading..."}
          />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};
