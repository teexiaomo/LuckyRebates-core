import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import {deployTetherUSD,TetherUSD} from "../scripts/TetherUSD-deploy"
import {deployRandomGenerator,TestRandomGenerator} from "../scripts/RandomGenerator-deploy"
import { LuckyTokenGift,deployLuckyTokenGift  } from "../scripts/LuckyTokenGift-deploy";
import { expect } from "chai";
import  {
    ZeroAddress
  } from "ethers";
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TokenGift:send model", function (){
    let usdt:TetherUSD;
    let luckyTokenGift:LuckyTokenGift;
    let randomGenerator:TestRandomGenerator;
    let owner:HardhatEthersSigner;
    let otherAccount:HardhatEthersSigner;
    before(async function(){
        //初始化合约
        usdt = await loadFixture(deployTetherUSD);
        const addr1 = await usdt.getAddress()
        console.log('usdt address:',addr1);

        randomGenerator = await loadFixture(deployRandomGenerator);
        const addr2 = await randomGenerator.getAddress();
        console.log('randomGenerator address:',addr2);
        

        luckyTokenGift = await loadFixture(deployLuckyTokenGift);
        const addr3 = await luckyTokenGift.getAddress();
        console.log('tokenGift address:',addr3);

        await (await randomGenerator.setOperatorAddressList(await luckyTokenGift.getAddress(),true)).wait();

        [owner,otherAccount] = await hre.ethers.getSigners();
    });

    describe("start tokenGift",function(){
        let id:bigint;
        before(async function(){
            //授权用户地址向红包合约转账
            const addr = await luckyTokenGift.getAddress();
            const approveCall = usdt.approve(addr,1000000000);
            await expect(approveCall).not.to.be.reverted;

            await (await approveCall).wait();

            const myTokenAddr = await usdt.getAddress();

            //创建红包，采用send模式，且只允许otherAccount地址send，不限制截止时间及总购注数，最大中奖数为20注
            //在创建时并通过owner地址捐赠10注
            let sendModel = 2n;
            const createTokenGiftDetail = luckyTokenGift.createTokenGiftDetail(myTokenAddr,sendModel,1000000n,0n,0n,20n,owner,10n,otherAccount,0n,true);
            await expect(createTokenGiftDetail).not.to.be.reverted;
            
            await (await createTokenGiftDetail).wait();

            id = await luckyTokenGift.viewCurrentTokenGiftId();
            const balance1 = await usdt.balanceOf(owner);
            const balance2 = await usdt.balanceOf(otherAccount);
            console.log('id:%d balance1:%d balance2:%d',id,balance1,balance2);
        });
        
        it("inject", async function () {
            //捐赠10注
            const injectTickets = luckyTokenGift.injectTickets(id,10n);
            await expect(injectTickets).not.to.be.reverted;
            const recept = await (await injectTickets).wait();
            
            const balance1 = await usdt.balanceOf(owner);
            const balance2 = await usdt.balanceOf(otherAccount);
            console.log('id:%d inject tx:%s balance1:%d balance2:%d',id,recept?.hash,balance1,balance2);
        });
        it("buy",async function () {
            //尝试购注，send模式不允许购注
            const buyTickets =  luckyTokenGift.buyTickets(id,owner,20n);
            
            await expect(buyTickets).to.be.reverted;
            console.log('owner can not buy');
                    
        });

        it("send by owner",async function () {
            //尝试send奖注，非绑定地址不允许send
            const sendTickets = luckyTokenGift.sendTickets(id,owner,20n)
            expect(sendTickets).to.be.reverted;
            console.log('owner can not send');
            
        });

        it("send by otherAccount",async function () {
            //绑定地址send奖注
            const sendTickets = luckyTokenGift.connect(otherAccount).sendTickets(id,otherAccount,20n)
            expect(sendTickets).not.to.be.reverted;
            const recept = await (await sendTickets).wait();

            const balance1 = await usdt.balanceOf(owner);
            const balance2 = await usdt.balanceOf(otherAccount);
            console.log('id:%d send tx:%s balance1:%d balance2:%d',id,recept?.hash,balance1,balance2);
        });
    });
    
    
    describe("end tokenGift",function(){
        it("end", async function (){
            //结束投注
            const id = await luckyTokenGift.viewCurrentTokenGiftId();
            const endTokenGift = luckyTokenGift.endTokenGift(id);

            await expect(endTokenGift).not.to.be.reverted;
            const recept = await (await endTokenGift).wait();

            const balance1 = await usdt.balanceOf(owner);
            const balance2 = await usdt.balanceOf(otherAccount);
            console.log('id:%d end tx:%s balance1:%d balance2:%d',id,recept?.hash,balance1,balance2);
        });
        it("fulfillRandomWords", async function (){
            //注入随机数
            const id = await luckyTokenGift.viewCurrentTokenGiftId();
            
            const fulfillRandomWords = randomGenerator.fulfillRandomWords(id,[1234567n]);

            await expect(fulfillRandomWords).not.to.be.reverted;
            const recept = await (await fulfillRandomWords).wait();
            
            console.log('id:%d fulfillRandomWords tx:%s ',id,recept?.hash);
        });
    });
    describe("drawPrize tokenGift",function(){
        it("drawPrize", async function () {
            //开奖
            const id = await luckyTokenGift.viewCurrentTokenGiftId();
            const drawPrize = luckyTokenGift.drawPrize(id,0n);
            await expect(drawPrize).not.to.be.reverted;
            const recept = await (await drawPrize).wait();   
   
            const balance1 = await usdt.balanceOf(owner);
            const balance2 = await usdt.balanceOf(otherAccount);
            console.log('id:%d drawPrize tx:%s balance1:%d balance2:%d',id,recept?.hash,balance1,balance2);
        });
    });
});