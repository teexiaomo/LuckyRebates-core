import hre from "hardhat";
import {
  AddressLike
} from "ethers";
import {deployMyToken} from "./MyToken-deploy"
import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";

export async function deployRedEnvelope() {
    const  myToken  = await loadFixture(deployMyToken);
    //const { myToken } = await deployMyToken();
    const myTokenAddr = await myToken.getAddress();

    const [owner, otherAccount] = await hre.ethers.getSigners();

    const LuckyRedEnvelopeV2 = await hre.ethers.getContractFactory("LuckyRedEnvelopeV2");
    const luckyRedEnvelope = await LuckyRedEnvelopeV2.deploy(owner,myTokenAddr,1000000n);
    await luckyRedEnvelope.waitForDeployment();

    //const address = await luckyRedEnvelope.getAddress();
    //console.log('luckyRedEnvelope address:',address);
    return luckyRedEnvelope;
}

/*
export async function startRedEnvelope(_endTime: bigint, _maxTickets: bigint, _maxPrizeNum: bigint, _secret: bigint){
  const {luckyRedEnvelope } = await loadFixture(deployRedEnvelope);
  const rs = await luckyRedEnvelope.createRedEnvelope(_endTime,_maxTickets,_maxPrizeNum,_secret);
  const tx = await rs.getTransaction();
  await rs.wait();
  await expect(rs).not.to.be.reverted;

  const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
  console.log('id:%d create tx:%s ',id,tx?.hash);
  return luckyRedEnvelope;
}


export async function injectTicket(id:bigint,ticket:bigint){
  const {luckyRedEnvelope } = await loadFixture(deployRedEnvelope);
  const rs = await luckyRedEnvelope.injectTickets(id,ticket);
  await rs.wait();
  await expect(rs).not.to.be.reverted;
  const tx = await rs.getTransaction();
  console.log('id:%d inject tx:%s',id,tx?.hash);
  return luckyRedEnvelope;
}

export async function buyTicket(id:bigint,receiveArr:AddressLike,ticket:bigint){
  const {luckyRedEnvelope } = await loadFixture(deployRedEnvelope);
  const rs = await luckyRedEnvelope.buyTickets(id,receiveArr,ticket);
  await rs.wait();
  await expect(rs).not.to.be.reverted;
  const tx = await rs.getTransaction();
  console.log('id:%d buy tx:%s',id,tx?.hash);
  return luckyRedEnvelope;
}*/