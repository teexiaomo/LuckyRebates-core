import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import {deployMyToken,TetherUSD} from "../scripts/MyToken-deploy"

import { deployRedEnvelope,LuckyRedEnvelopeV2 } from "../scripts/LuckyRedEnvelopeV2-deploy";
import { expect } from "chai";
import  {
    ZeroAddress
  } from "ethers";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("RedEnvelope:send model", function (){
    let myToken:TetherUSD;
    let luckyRedEnvelope:LuckyRedEnvelopeV2;
    let owner:HardhatEthersSigner;
    let otherAccount:HardhatEthersSigner;
    before(async function(){
        //初始化合约
        myToken = await loadFixture(deployMyToken);
        const addr1 = await myToken.getAddress()
        console.log('myToken address:',addr1);

        luckyRedEnvelope = await loadFixture(deployRedEnvelope);
        const addr2 = await luckyRedEnvelope.getAddress()
        console.log('redEnvelope address:',addr2);

        [owner,otherAccount] = await hre.ethers.getSigners();
    });

    describe("start redEnvelope",function(){
        let id:bigint;
        before(async function(){
            //授权用户地址向红包合约转账
            const addr = await luckyRedEnvelope.getAddress();
            const approveCall = myToken.approve(addr,1000000000);
            await expect(approveCall).not.to.be.reverted;

            await (await approveCall).wait();

            const myTokenAddr = await myToken.getAddress();

            //创建红包，采用send模式，且只允许otherAccount地址send，不限制截止时间及总购注数，最大中奖数为20注
            //在创建时并通过owner地址捐赠10注
            const createRedEnvelopeDetail = luckyRedEnvelope.createRedEnvelopeDetail(myTokenAddr,1000000n,0n,0n,20n,owner,10n,otherAccount,0n,true);
            await expect(createRedEnvelopeDetail).not.to.be.reverted;
            
            await (await createRedEnvelopeDetail).wait();

            id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
            const balance1 = await myToken.balanceOf(owner);
            const balance2 = await myToken.balanceOf(otherAccount);
            console.log('id:%d balance1:%d balance2:%d',id,balance1,balance2);
        });
        
        it("inject", async function () {
            //捐赠10注
            const injectTickets = luckyRedEnvelope.injectTickets(id,10n);
            await expect(injectTickets).not.to.be.reverted;
            const recept = await (await injectTickets).wait();
            
            const balance1 = await myToken.balanceOf(owner);
            const balance2 = await myToken.balanceOf(otherAccount);
            console.log('id:%d inject tx:%s balance1:%d balance2:%d',id,recept?.hash,balance1,balance2);
        });
        it("buy",async function () {
            //尝试购注，send模式不允许购注
            const buyTickets =  luckyRedEnvelope.buyTickets(id,owner,20n);
            
            await expect(buyTickets).to.be.reverted;
            console.log('owner can not buy');
                    
        });

        it("send by owner",async function () {
            //尝试send奖注，非绑定地址不允许send
            const sendTickets = luckyRedEnvelope.sendTickets(id,owner,20n)
            expect(sendTickets).to.be.reverted;
            console.log('owner can not send');
            
        });

        it("send by otherAccount",async function () {
            //绑定地址send奖注
            const sendTickets = luckyRedEnvelope.connect(otherAccount).sendTickets(id,otherAccount,20n)
            expect(sendTickets).not.to.be.reverted;
            const recept = await (await sendTickets).wait();

            const balance1 = await myToken.balanceOf(owner);
            const balance2 = await myToken.balanceOf(otherAccount);
            console.log('id:%d send tx:%s balance1:%d balance2:%d',id,recept?.hash,balance1,balance2);
        });
    });
    
    
    describe("end redEnvelope",function(){
        it("end", async function (){
            //结束投注
            const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
            const endRedEnvelope = luckyRedEnvelope.endRedEnvelope(id);

            await expect(endRedEnvelope).not.to.be.reverted;
            const recept = await (await endRedEnvelope).wait();

            const balance1 = await myToken.balanceOf(owner);
            const balance2 = await myToken.balanceOf(otherAccount);
            console.log('id:%d end tx:%s balance1:%d balance2:%d',id,recept?.hash,balance1,balance2);
        });
    });
    describe("drawPrize redEnvelope",function(){
        it("drawPrize", async function () {
            //开奖
            const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
            const drawPrize = luckyRedEnvelope.drawPrize(id,0n);
            await expect(drawPrize).not.to.be.reverted;
            const recept = await (await drawPrize).wait();   
   
            const balance1 = await myToken.balanceOf(owner);
            const balance2 = await myToken.balanceOf(otherAccount);
            console.log('id:%d drawPrize tx:%s balance1:%d balance2:%d',id,recept?.hash,balance1,balance2);
        });
    });
});