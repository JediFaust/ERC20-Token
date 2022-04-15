
<h1 align="center"><b>JediToken Smart Contract</b></h3>

<div align="left">


[![Language](https://img.shields.io/badge/language-solidity-orange.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)

</div>

---

<p align="center"><h2 align="center"><b>Solidity Smart contract for ERC20 Tokens
    </h2></b><br> 
</p>

## 📝 Table of Contents

- [EtherScan Link](#etherscan)
- [Installing](#install)
- [Contract Functions](#functions)
- [Deploy & Test Scripts](#scripts)
- [HardHat Tasks](#tasks)

## 🚀 Link on EtherScan <a name = "etherscan"></a>

https://rinkeby.etherscan.io/address/0xFa2bEB1ab1F5fb849Dc5981B88c2E1CdFB51f482#code



## 🚀 Installing <a name = "install"></a>
- Set initial values on scripts/deploy.ts file
- Deploy contract running on console:
```shell
node scripts/deploy.ts
```
- Copy address of deployed contract and paste to .env file as CONTRACT_ADDRESS
- Use transfer, approve and etc. functions




## ⛓️ Contract Functions <a name = "functions"></a>

- **balanceOf()**
>Get balance of exact address

- **transfer()**
>Send tokens to another address

- **transferFrom()**
>transfer tokens from one address to another

- **approve()**
>Approve another address to spend amount from your balance<br>


- **safeApprove**
>Approve another address to spend amount from your balance<br>Safe version

- **burn()**
>Burns tokens from another address

- **mint()**
>Mint new tokens to another address


## 🎈 Deploy & Test Scripts <a name = "scripts"></a>

```shell
node scripts/deploy.js --network rinkeby
npx hardhat test
```


## 💡 HardHat Tasks <a name = "tasks"></a>


```shell
npx hardhat transfer
npx hardhat transfer-from
npx hardhat approve
```

