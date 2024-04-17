import hre from "hardhat";
import {
  AddressLike
} from "ethers";
import {
  loadFixture,
} from "@nomicfoundation/hardhat-toolbox/network-helpers";

import { expect } from "chai";

export async function deployMyToken() {
  const [owner, otherAccount] = await hre.ethers.getSigners();

  const MyToken = await hre.ethers.getContractFactory("TetherUSD");
  const myToken = await MyToken.deploy(owner);
  const address = await myToken.getAddress();
  await myToken.waitForDeployment();
            
  console.log('myToken address:',address);
  
  return { myToken, owner, otherAccount };
}
export async function getBalanceOf(owner:AddressLike) {
  const { myToken } = await loadFixture(deployMyToken);
  await expect(myToken).not.to.be.reverted;
  const balance = await myToken.balanceOf(owner);
  console.log('owner:%s balance:%d',owner.toString(),balance);
}

export async function approve(address :AddressLike,value:bigint) {
  const { myToken,owner } = await loadFixture(deployMyToken);

  const rs = await myToken.approve(address,value);
  const tx = await rs.getTransaction();
  await rs.wait();
  await expect(rs).not.to.be.reverted;

  console.log('owner:%s approve balance:%d',owner.address,value);
}

/*
//执行部署
deployMyToken().then(() => process.exit(0)).catch(error => {
  console.error(error);
  process.exit(1);
  });
*/