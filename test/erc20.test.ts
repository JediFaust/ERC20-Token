/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */
/* eslint-disable no-unused-expressions */

import { expect } from "chai"
import { Contract } from "ethers";
import { ethers } from "hardhat"

describe("ERC20", function () {
    let owner: any
    let acc1: any
    let acc2: any
    let acc3: any
    let acc4: any
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

















//   it("should revert when not active", async function () {
//     await expect(
//       erc20.vote(voteID, acc1.address, { value: "10000000000000000" })
//     ).to.be.revertedWith("Voting is not active");
//     await expect(voting.endVoting(voteID)).to.be.revertedWith(
//       "Voting is not active"
//     );
//   });

//   it("should revert when called by non-owner", async function () {
//     await expect(
//       voting.connect(acc1).startVoting([acc1.address, acc2.address])
//     ).to.be.revertedWith("Permission denied");
//   });

//   it("should be able to check active vote", async function () {
//     let state = await voting.isActive(voteID);
//     expect(state).to.eq(false);

//     await voting.startVoting([acc1.address, acc2.address]);

//     state = await voting.isActive(voteID);

//     expect(state).to.eq(true);
//   });

//   it("should be able to get number of votings", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);
//     await voting.startVoting([acc1.address, acc2.address]);

//     const count = await voting.votingsCount();

//     expect(count).to.eq(2);
//   });

//   it("should not able to end vote when 3 days not pass", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await expect(voting.connect(acc1).endVoting(voteID)).to.be.revertedWith(
//       "End time is not came yet"
//     );
//   });

//   it("should be able to get list of voters", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await voting
//       .connect(acc1)
//       .vote(voteID, acc2.address, { value: "10000000000000000" });
//     await voting
//       .connect(acc2)
//       .vote(voteID, acc2.address, { value: "10000000000000000" });

//     const voters = await voting.getVoters(voteID);
//     expect(voters[0]).to.eq(acc1.address);
//     expect(voters[1]).to.eq(acc2.address);
//   });

//   it("should be able to start another voting", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);
//     await voting.startVoting([acc2.address, acc3.address]);

//     await voting
//       .connect(acc1)
//       .vote(voteID, acc2.address, { value: "10000000000000000" });
//     await voting
//       .connect(acc1)
//       .vote(voteID + 1, acc3.address, { value: "10000000000000000" });
//     await voting
//       .connect(acc2)
//       .vote(voteID + 1, acc3.address, { value: "10000000000000000" });

//     const firstVoters = await voting.getVoters(voteID);
//     const secondVoters = await voting.getVoters(voteID + 1);
//     expect(firstVoters[0]).to.eq(acc1.address);
//     expect(secondVoters[0]).to.eq(acc1.address);
//     expect(secondVoters[1]).to.eq(acc2.address);

//     const firstWinner = await voting.getWinner(voteID);
//     expect(firstWinner).to.eq(acc2.address);

//     const secondWinner = await voting.getWinner(voteID + 1);
//     expect(secondWinner).to.eq(acc3.address);
//   });

//   it("should not be able to vote to non-candidate", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await expect(
//       voting
//         .connect(acc1)
//         .vote(voteID, acc3.address, { value: "10000000000000000" })
//     ).to.be.revertedWith("No such candidate on the vote");
//   });

//   it("should be able to vote and get votes of candidate", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await voting
//       .connect(acc1)
//       .vote(voteID, acc2.address, { value: "10000000000000000" });

//     const votes = await voting.getVotes(voteID, acc2.address);
//     expect(votes).to.eq(1);
//   });

//   it("should be able to change winner and their vote", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await voting
//       .connect(acc1)
//       .vote(voteID, acc2.address, { value: "10000000000000000" });

//     const firstWinner = await voting.getWinner(voteID);
//     expect(firstWinner).to.eq(acc2.address);

//     const firstVote = await voting.getWinnerVotes(voteID);
//     expect(firstVote).to.eq(1);

//     await voting
//       .connect(acc2)
//       .vote(voteID, acc1.address, { value: "10000000000000000" });
//     await voting
//       .connect(acc3)
//       .vote(voteID, acc1.address, { value: "10000000000000000" });

//     const secondWinner = await voting.getWinner(voteID);
//     expect(secondWinner).to.eq(acc1.address);

//     const secondVote = await voting.getWinnerVotes(voteID);
//     expect(secondVote).to.eq(2);
//   });

//   it("should be able to get votes", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await voting
//       .connect(acc1)
//       .vote(voteID, acc2.address, { value: "10000000000000000" });

//     const votes = await voting.getVotes(voteID, acc2.address);
//     expect(votes).to.eq(1);
//   });

//   it("should not be able to vote second time", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await voting
//       .connect(acc1)
//       .vote(voteID, acc1.address, { value: "10000000000000000" });

//     await expect(
//       voting
//         .connect(acc1)
//         .vote(voteID, acc2.address, { value: "10000000000000000" })
//     ).to.be.revertedWith("You already voted");
//   });

//   it("should provide exact 0.01 ETH", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await expect(
//       voting.connect(acc1).vote(voteID, acc1.address, { value: "1" })
//     ).to.be.revertedWith("Cost of voting is 0.01 ETH");
//   });

//   it("end vote should send amount to winner", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await voting
//       .connect(acc1)
//       .vote(voteID, acc2.address, { value: "10000000000000000" });

//     const prize = BigInt(9000000000000000);

//     const acc2Before = await ethers.provider.getBalance(acc2.address);
//     const contractBefore = await ethers.provider.getBalance(voting.address);

//     await voting.turnTimeBack(voteID);
//     const tx = await voting.endVoting(voteID);
//     await tx.wait();

//     const acc2After = await ethers.provider.getBalance(acc2.address);
//     const contractAfter = await ethers.provider.getBalance(voting.address);

//     expect(acc2After.toBigInt()).to.eq(acc2Before.toBigInt() + prize);
//     expect(contractAfter.toBigInt()).to.eq(contractBefore.toBigInt() - prize);
//   });

//   it("withdraw should send commission to address", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await voting
//       .connect(acc1)
//       .vote(voteID, acc2.address, { value: "10000000000000000" });
//     await voting.turnTimeBack(voteID);
//     await voting.endVoting(voteID);

//     const comission = BigInt(1000000000000000);

//     const acc3Before = await ethers.provider.getBalance(acc3.address);
//     const contractBefore = await ethers.provider.getBalance(voting.address);

//     const tx = await voting.withdraw(acc3.address);
//     await tx.wait();

//     const acc3After = await ethers.provider.getBalance(acc3.address);
//     const contractAfter = await ethers.provider.getBalance(voting.address);

//     expect(acc3After.toBigInt()).to.eq(acc3Before.toBigInt() + comission);
//     expect(contractAfter.toBigInt()).to.eq(
//       contractBefore.toBigInt() - comission
//     );
//   });

//   it("withdraw should be reverted when calling on zero balance", async function () {
//     await voting.startVoting([acc1.address, acc2.address]);

//     await voting.turnTimeBack(voteID);
//     await voting.endVoting(voteID);

//     await expect(voting.withdraw(acc1.address)).to.be.revertedWith(
//       "Zero balance"
//     );
//   });

  
});
