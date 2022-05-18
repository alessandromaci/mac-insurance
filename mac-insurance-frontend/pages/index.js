import { useState, useEffect } from "react"
import s from "../styles/Home.module.scss"
import { Layout } from "../components/Layout"
import Web3Modal from "web3modal"
import { ethers } from "ethers"
import { TabSelector } from "../components/TabSelector"

export default function Home() {
  const [walletConnected, setWalletConnected] = useState(false)
  const [account, setAccount] = useState()
  const [networkError, setNetworkError] = useState()

  // Connect Wallet
  const connectWallet = async () => {
    const provider = await web3Modal.connect()
    const web3Provider = new ethers.providers.Web3Provider(provider)
    const signer = web3Provider.getSigner()
    const address = await signer.getAddress()
    const checkForEns = await lookupEnsAddress(address)
    checkForEns !== null ? setAccount(checkForEns) : setAccount(address)
    setWalletConnected(true)

    const network = await web3Provider.getNetwork()
    if (network.chainId !== 4) {
      setNetworkError(true)
    }
  }

  const lookupEnsAddress = async (walletAddress) => {
    const provider = await web3Modal.connect()
    const web3Provider = new ethers.providers.Web3Provider(provider)
    const checkForEnsDomain = await web3Provider.lookupAddress(walletAddress)
    return checkForEnsDomain
  }

  // UseEffects

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet()
    }
  }, [])

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })
      window.ethereum.on("accountsChanged", () => {
        window.location.reload()
      })
    }
  })

  let web3Modal
  if (typeof window !== "undefined") {
    web3Modal = new Web3Modal({
      network: "rinkeby",
      cacheProvider: true,
      providerOptions: {},
    })
  }

  return (
    <Layout
      walletConnected={walletConnected}
      connectWallet={connectWallet}
      account={account}
      networkError={networkError}
    >
      <TabSelector account={account} walletConnected={walletConnected} />
    </Layout>
  )
}
