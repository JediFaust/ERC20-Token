/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-extraneous-import */
import * as dotenv from "dotenv";

import { task } from "hardhat/config"
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";
import { abi } from "../artifacts/contracts/ERC20.sol/ERC20.json"

dotenv.config();

task("transfer", "Transfer amount to address")
  .addParam("address", "Address transfer to")
  .addParam("amount", "Amount to transfer")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contractAddr = process.env.CONTRACT_ADDRESS;

    const ERC20Contract = new hre.ethers.Contract(
      contractAddr as string,
      abi,
      signer
    );

    const result = await ERC20Contract.transfer(taskArgs.address, taskArgs.amount);

    console.log(result);
  });
