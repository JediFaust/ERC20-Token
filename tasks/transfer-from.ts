/* eslint-disable prettier/prettier */
/* eslint-disable node/no-unpublished-import */
/* eslint-disable node/no-extraneous-import */
import * as dotenv from "dotenv";

import { task } from "hardhat/config"

dotenv.config();

task("transfer-from", "Transfer amount to address from address")
  .addParam("from", "Address transfer from")
  .addParam("to", "Address transfer to")
  .addParam("amount", "Amount to transfer")
  .setAction(async (taskArgs, hre) => {
    const [signer] = await hre.ethers.getSigners();
    const contractAddr = process.env.CONTRACT_ADDRESS;

    const ERC20Contract = await hre.ethers.getContractAt(
      "ERC20",
      contractAddr as string,
      signer
    );

    const result = await ERC20Contract.transferFrom(taskArgs.from, taskArgs.to, taskArgs.amount);

    console.log(result);
  });
