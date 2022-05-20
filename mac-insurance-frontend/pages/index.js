import { useState, useEffect } from "react"
import s from "../styles/Home.module.scss"
import { Layout } from "../components/Layout"
import Web3Modal from "web3modal"
import { ethers } from "ethers"
import { TabSelector } from "../components/TabSelector"
import Head from "next/head"

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
    <>
      <Head>
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Layout
        walletConnected={walletConnected}
        connectWallet={connectWallet}
        account={account}
        networkError={networkError}
      >
        <TabSelector account={account} walletConnected={walletConnected} />
      </Layout>
    </>
  )
}
