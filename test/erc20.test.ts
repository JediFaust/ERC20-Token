/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

import { expect } from "chai"
import { Contract } from "ethers";
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address"

describe("ERC20", function () {
    let owner: SignerWithAddress
    let acc1: SignerWithAddress
    let acc2: SignerWithAddress
    let acc3: SignerWithAddress
    let acc4: SignerWithAddress
    let erc20: Contract


    beforeEach(async function () {
        [owner, acc1, acc2, acc3, acc4] = await ethers.getSigners()
        
        const ERC20 = await ethers.getContractFactory("ERC20", owner)
        erc20 = await ERC20.deploy("JediToken", "JDT", 1000000, 0)
        await erc20.deployed()
    });

    it("should be deployed", async function () {
        expect(erc20.address).to.be.properAddress
    });

    it("should have right properties", async function () {
        expect(await erc20.name()).to.equal("JediToken")
        expect(await erc20.symbol()).to.equal("JDT")
        expect(await erc20.decimals()).to.equal(0)
        expect(await erc20.totalSupply()).to.equal(1000000)
    });

    it("owner should have right balance", async function () {
        expect(await erc20.balanceOf(owner.address)).to.equal(1000000)
    });

    it("should transfer tokens", async function () {
        const transferTx = await erc20.transfer(acc1.address, 100)
        await transferTx.wait()
        expect(await erc20.balanceOf(acc1.address)).to.equal(100)
        expect(await erc20.balanceOf(owner.address)).to.equal(999900)
        
    });

    it("should fail transfer tokens when not enough", async function () {
        await expect(erc20.transfer(acc1.address, 1000001))
            .to.be.revertedWith("Not enough token")
    });

    it("should approve tokens and get allowance", async function () {
        const approveTx = await erc20.approve(acc1.address, 1000)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(1000)
    });

    it("should transfer from tokens", async function () {
        const approveTx = await erc20.approve(acc1.address, 1000)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(1000)

        const transferFromTx = await erc20.connect(acc1).transferFrom(owner.address, acc2.address, 1000)
        await transferFromTx.wait()

        expect(await erc20.balanceOf(acc2.address)).to.equal(1000)
        expect(await erc20.balanceOf(owner.address)).to.equal(999000)
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(0)
    });

    it("should fail to transferFrom more than allowed tokens", async function () {
        const approveTx = await erc20.approve(acc1.address, 1000)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(1000)

        await expect(erc20.connect(acc1).transferFrom(owner.address, acc2.address, 2000))
            .to.be.revertedWith("Allowance is not enough")
        expect(await erc20.balanceOf(acc2.address)).to.equal(0)
        expect(await erc20.balanceOf(owner.address)).to.equal(1000000)
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(1000)
    });

    it("should fail to transferFrom when tokens not enough", async function () {
        const approveTx = await erc20.approve(acc1.address, 1000)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(1000)
        
        const transferTx = await erc20.transfer(acc3.address, 1000000)
        await transferTx.wait()

        expect(await erc20.balanceOf(acc3.address)).to.equal(1000000)
        expect(await erc20.balanceOf(owner.address)).to.equal(0)
        
        await expect(erc20.connect(acc1).transferFrom(owner.address, acc2.address, 1000))
            .to.be.revertedWith("Balance is not enough")
        expect(await erc20.balanceOf(acc2.address)).to.equal(0)
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(1000)
    });

    it("should be able to safeApprove", async function () {
        const approveTx = await erc20.safeApprove(acc1.address, 0, 1000)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(1000)
    });

    it("should fail to safeApprove when not enough", async function () {
        await expect(erc20.safeApprove(acc1.address, 0, 1000001))
            .to.be.revertedWith("Not enough token")
    });

    it("should fail to safeApprove when old allowance is not expected", async function () {
        const approveTx = await erc20.approve(acc1.address, 1000)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(1000)

        await expect(erc20.safeApprove(acc1.address, 1500, 2000))
            .to.be.revertedWith("Old allowance was transfered!")
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(1000)
    });

    it("should able to mint", async function () {
        const mintTx = await erc20.mint(acc1.address, 1000)
        await mintTx.wait()

        expect(await erc20.balanceOf(acc1.address)).to.equal(1000)
        expect(await erc20.totalSupply()).to.equal(1000000 + 1000)
    })

    it("should fail to mint when not owner", async function () {
        await expect(erc20.connect(acc1).mint(acc1.address, 1000))
            .to.be.revertedWith("Permission denied")
    })

    it("should able to burn", async function () {
        const burnTx = await erc20.burn(owner.address, 1000)
        await burnTx.wait()

        expect(await erc20.balanceOf(owner.address)).to.equal(1000000 - 1000)
        expect(await erc20.totalSupply()).to.equal(1000000 - 1000)
    })

    it("should able to burn from another address", async function () {
        const transferTx = await erc20.transfer(acc1.address, 1000)
        await transferTx.wait()
        expect(await erc20.balanceOf(acc1.address)).to.equal(1000)
        expect(await erc20.balanceOf(owner.address)).to.equal(1000000 - 1000)

        const burnTx = await erc20.burn(acc1.address, 1000)
        await burnTx.wait()

        expect(await erc20.balanceOf(acc1.address)).to.equal(0)
        expect(await erc20.totalSupply()).to.equal(1000000 - 1000)
    })

    it("should fail to burn when not enough token", async function () {
        expect(await erc20.balanceOf(acc1.address)).to.equal(0)

        await expect(erc20.burn(acc1.address, 1000)).to.be.revertedWith("Not enough token")
    })

    it("should fail to burn when not owner", async function () {
        await expect(erc20.connect(acc1).burn(owner.address, 1000))
            .to.be.revertedWith("Permission denied")
    })

    it("should emit transfer event", async function () {
        await expect(erc20.connect(owner).transfer(acc1.address, 100))
            .to.emit(erc20, 'Transfer').withArgs(owner.address, acc1.address, 100);
    })

    it("should emit transfer event when using transfer from", async function () {
        const approveTx = await erc20.approve(acc1.address, 1000)
        await approveTx.wait()

        await expect(await erc20.connect(acc1).transferFrom(owner.address, acc2.address, 1000))
            .to.emit(erc20, 'Transfer').withArgs(owner.address, acc2.address, 1000);
    });

    it("should emit transfer event when mint", async function () {
        await expect(erc20.mint(owner.address, 100))
            .to.emit(erc20, 'Transfer').withArgs("0x0000000000000000000000000000000000000000", owner.address, 100);
    })

    it("should emit transfer event when burn", async function () {
        await expect(erc20.burn(owner.address, 100))
            .to.emit(erc20, 'Transfer').withArgs(owner.address, "0x0000000000000000000000000000000000000000", 100);
    })

    it("should emit approval event", async function () {
        await expect(await erc20.approve(acc1.address, 1000))
            .to.emit(erc20, 'Approval').withArgs(owner.address, acc1.address, 1000);
    })

    it("should emit approval event", async function () {
        const approveTx = await erc20.approve(acc1.address, 1000)
        await approveTx.wait()
        expect(await erc20.allowance(owner.address, acc1.address)).to.equal(1000)

        await expect(erc20.safeApprove(acc1.address, 1000, 2000))
            .to.emit(erc20, 'Approval').withArgs(owner.address, acc1.address, 2000);
    })

    it("should be able to get treasury", async function () {
        const comission = 10
        const amount = 1000

        await erc20.setReciever(acc1.address)
        await erc20.setComission(comission)
        await erc20.addDex(acc2.address)

        const transferTx = await erc20.transfer(acc2.address, amount)
        await transferTx.wait()

        expect(await erc20.balanceOf(acc1.address)).to.equal((amount / 100) * comission)
        expect(await erc20.balanceOf(acc2.address)).to.equal(amount - (amount / 100) * comission)
    })
});
