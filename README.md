# MAC-Insurance

Developed at [Hack Money Hackathon 2022](https://showcase.ethglobal.com/hackmoney2022/mac-insurance-r1g12)

[Live Demo](https://mac-insurance.vercel.app/)

## About
This project represents a prototype for an insurance protocol, that can be used permissionlessly to request &amp; create an insurance against ERC20 token price loss


### Pre-requisite

- NodeJs >= 14.x
- NextJs 12.x
- Solidity latest
- Alchemy API key
- EthersJs v5.x
- Apollo client v3.x
- Metamask


## Contracts

[📚 MAC Ethereum-Rinkeby](https://rinkeby.etherscan.io/address/0xF082bb00Ed368fCA5ec554395A2c2a16b5815De5)  
[📚 MAC Polygon-Mumbai](https://mumbai.polygonscan.com/address/0x96dDC464EecdF02fB32B8F350b139ac809122e60)

### Dev Environemnt

0. Install [Metamask](https://metamask.io)

1. Register account in [Alchemy](https://auth.alchemyapi.io/) and generate a new APP using Rinkeby network

2. Make `.env.local`

```shell
touch .env.local
```

add environment variable

```text
NEXT_PUBLIC_ALCHEMY_KEY= https://eth-rinkeby.alchemyapi.io/{YOUR_KEY}
```

3. Install dependencies

```bash
yarn install
```

4. Start developmment

```bash
yarn dev
```

5. 📱 Open http://localhost:3000 to see the app

### Production

Live deployment is made via Github / Vercel integration, as a vercel.app, from master branch.

Open [mac-insurance.vercel.app](https://mac-insurance.vercel.app)
