const { expect } = require('chai');

describe('StartupFunding', function () {
  let startupFunding;
  let owner, funder1, funder2;

  const fundingAmount1 = ethers.utils.parseEther('1');
  const fundingAmount2 = ethers.utils.parseEther('2');

  beforeEach(async function () {
    // Get the signers (accounts) from ethers library
    [owner, funder1, funder2] = await ethers.getSigners();

    // Deploy the contract
    const StartupFunding = await ethers.getContractFactory('StartupFunding');
    startupFunding = await StartupFunding.deploy();
    await startupFunding.deployed();
  });

  it('should have the contract owner set', async function () {
    expect(await startupFunding.owner()).to.equal(owner.address);
  });

  it('should accept funds from funders', async function () {
    await startupFunding.connect(funder1).fund({ value: fundingAmount1 });
    await startupFunding.connect(funder2).fund({ value: fundingAmount2 });

    const totalFunds = await startupFunding.totalFunds();
    expect(totalFunds).to.equal(fundingAmount1.add(fundingAmount2));
  });

  it('should allow the owner to withdraw funds', async function () {
    await startupFunding.connect(funder1).fund({ value: fundingAmount1 });
    await startupFunding.connect(funder2).fund({ value: fundingAmount2 });

    const initialBalance = await owner.getBalance();
    const tx = await startupFunding.connect(owner).withdrawFunds();
    const receipt = await tx.wait();

    const totalFunds = await startupFunding.totalFunds();
    expect(totalFunds).to.equal(ethers.constants.Zero);
    
    const gasUsed = receipt.gasUsed.mul(tx.gasPrice);
    const finalBalance = await owner.getBalance();
    const expectedFinalBalance = initialBalance.add(fundingAmount1).add(fundingAmount2).sub(gasUsed);
    expect(finalBalance).to.equal(expectedFinalBalance);
  });
});
