import {
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import {deployMyToken,TetherUSD} from "../scripts/MyToken-deploy"
import type { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { deployRedEnvelope,LuckyRedEnvelopeV2 } from "../scripts/LuckyRedEnvelopeV2-deploy";
import { expect } from "chai";


describe("RedEnvelope:buy model", function (){
    let myToken:TetherUSD;
    let luckyRedEnvelope:LuckyRedEnvelopeV2;
    let owner:HardhatEthersSigner;
    before(async function(){
        //初始化合约
        myToken = await loadFixture(deployMyToken);
        const addr1 = await myToken.getAddress();
        console.log('myToken address:',addr1);

        luckyRedEnvelope = await loadFixture(deployRedEnvelope);
        const addr2 = await luckyRedEnvelope.getAddress();
        console.log('redEnvelope address:',addr2);

        [owner] = await hre.ethers.getSigners();
        
    });

    describe("start redEnvelope",function(){
        let id:bigint;
        before(async function(){
            //授权用户地址向红包合约转账
            const addr = await luckyRedEnvelope.getAddress();
            const approveCall = myToken.approve(addr,1000000000);
            await expect(approveCall).not.to.be.reverted;
            await (await approveCall).wait() ;

            //创建红包，采用buy模式，不限制截止时间及总购注数，最大中奖数为20注
            const createRedEnvelopeCall = luckyRedEnvelope.createRedEnvelope(0n,0n,20n,0n);
            await expect(createRedEnvelopeCall).not.to.be.reverted;
            
            await (await createRedEnvelopeCall).wait();

            //查询创建的红包id
            id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
            const balance = await myToken.balanceOf(owner);
            console.log('id:%d end  balance:%d',id,balance);
            
        });
        it("inject", async function () {
            //捐赠10注
            const injectTickets = luckyRedEnvelope.injectTickets(id,10n);
            await expect(injectTickets).not.to.be.reverted;
            const recept = await (await injectTickets).wait();
            
            const balance = await myToken.balanceOf(owner);
            console.log('id:%d inject tx:%s balance:%d',id,recept?.hash,balance);
        });
        it("buy",async function () {
            //购买20注
            const buyTickets =  luckyRedEnvelope.buyTickets(id,owner,20n);
            
            await expect(buyTickets).not.to.be.reverted;
            const recept = await (await buyTickets).wait();

            const balance = await myToken.balanceOf(owner);
            console.log('id:%d buy tx:%s  balance:%d',id,recept?.hash,balance);
        });

        it("send",async function () {
            //buy模式不能send
            const sendTickets = luckyRedEnvelope.sendTickets(id,owner,30n)
            expect(sendTickets).to.be.reverted;
        });
    });
    
    
    describe("end redEnvelope",function(){
        it("end", async function (){
            //结束投注
            const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
            const endRedEnvelope = luckyRedEnvelope.endRedEnvelope(id);

            await expect(endRedEnvelope).not.to.be.reverted;
            const recept = await (await endRedEnvelope).wait();

            const balance = await myToken.balanceOf(owner)
            
            console.log('id:%d end tx:%s balance:%d',id,recept?.hash,balance);
        });
    });
    describe("drawPrize redEnvelope",function(){
        it("drawPrize", async function () {
            //开奖
            const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
            const drawPrize = luckyRedEnvelope.drawPrize(id,0n);
            await expect(drawPrize).not.to.be.reverted;
            const recept = await (await drawPrize).wait();   
   
            const balance = await myToken.balanceOf(owner)
            
            console.log('id:%d drawPrize tx:%s balance:%d',id,recept?.hash,balance);
        });
    });
});