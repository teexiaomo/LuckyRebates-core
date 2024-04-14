import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { expect } from "chai";


describe("RedEnvelope", function () {
    async function deployMyTokenFixture() {
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const MyToken = await hre.ethers.getContractFactory("TetherUSD");
        const myToken = await MyToken.deploy(owner);

        
        const filter = myToken.filters["Transfer(address,address,uint256)"];
        myToken.on(filter, (arg1, arg2, arg3) => {
            console.log("myToken Transfer:");
            console.log("Arg1:", arg1);
            console.log("Arg2:", arg2);
            console.log("Arg3:", arg3);
          });
        await expect(myToken).not.to.be.reverted;
        

        return { myToken, owner, otherAccount };
    }

    async function deployRedEnvelopeFixture() {
        const { myToken } = await loadFixture(deployMyTokenFixture);
        const myTokenAddr = await myToken.getAddress();
        const [owner, otherAccount] = await hre.ethers.getSigners();

        const LuckyRedEnvelopeV2 = await hre.ethers.getContractFactory("LuckyRedEnvelopeV2");
        const luckyRedEnvelope = await LuckyRedEnvelopeV2.deploy(owner,myTokenAddr,1000000n);

        const filter = luckyRedEnvelope.filters["PrizeDrawn(uint256,address,uint256,uint256,bool)"];
        luckyRedEnvelope.on(filter, (arg1, arg2, arg3,arg4) => {
            console.log("luckyRedEnvelope PrizeDrawn:");
            console.log("Arg1:", arg1);
            console.log("Arg2:", arg2);
            console.log("Arg3:", arg3);
            console.log("Arg4:", arg4);
          });
        await expect(luckyRedEnvelope).not.to.be.reverted;
        
        return { luckyRedEnvelope, owner, otherAccount };
    }

    async function approveFixture() {
        const { myToken } = await loadFixture(deployMyTokenFixture);
        const { luckyRedEnvelope,owner } = await loadFixture(deployRedEnvelopeFixture);
        const address = await luckyRedEnvelope.getAddress();
        const rs = await myToken.approve(address,1000000000)

        await expect(rs).not.to.be.reverted;
        return {rs,myToken,luckyRedEnvelope,owner};
    }

    async function startRedEnvelopeFixture() {
        const { myToken,luckyRedEnvelope } = await loadFixture(approveFixture);
        const rs1 = await luckyRedEnvelope.createRedEnvelope(0n,0n,20n,0n);
        await expect(rs1).not.to.be.reverted;
        return {rs1,myToken,luckyRedEnvelope};
    }

    async function injectRedEnvelopeFixture(){
        const { myToken,luckyRedEnvelope } = await loadFixture(startRedEnvelopeFixture);
        const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
        //console.log('id:%s',id);
        const rs1 = await luckyRedEnvelope.injectTickets(id,50n);
        await expect(rs1).not.to.be.reverted;
        
        return {rs1,myToken,luckyRedEnvelope};
    }

    async function buyRedEnvelopeFixture(){
        const { myToken,luckyRedEnvelope } = await loadFixture(startRedEnvelopeFixture);
        const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
        //console.log('id:%s',id);
        const [owner, otherAccount] = await hre.ethers.getSigners();
        const rs1 = await luckyRedEnvelope.buyTickets(id,owner.address ,90n);
        console.log('buyRedEnvelopeFixture addr:%s',owner.address);
        await expect(rs1).not.to.be.reverted;


        
        return {rs1,myToken,luckyRedEnvelope,owner};
    }

    async function getRedEnvelopeFixture(){
        const { myToken,luckyRedEnvelope } = await loadFixture(buyRedEnvelopeFixture);
        const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
        //console.log('id:%s',id);

        const [owner, otherAccount] = await hre.ethers.getSigners();
        const rs1 = await luckyRedEnvelope.getTickets(id,owner.address, 10n);
        await expect(rs1).not.to.be.reverted;
        
        return {rs1,myToken,luckyRedEnvelope};
    }

    async function endRedEnvelopeFixture(){
        //await loadFixture(buyRedEnvelopeFixture);
        //await loadFixture(injectRedEnvelopeFixture);
        //await loadFixture(getRedEnvelopeFixture);
        const { myToken,luckyRedEnvelope } = await loadFixture(buyRedEnvelopeFixture);

        const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
        //console.log('id:%s',id);
        const rs1 = await luckyRedEnvelope.endRedEnvelope(id);
        await expect(rs1).not.to.be.reverted;
        
        return {rs1,myToken,luckyRedEnvelope};
    }

    async function drawPrizeRedEnvelopeFixture(){
        const { rs1,myToken,luckyRedEnvelope } = await loadFixture(endRedEnvelopeFixture);
        const tx = await rs1.getTransaction();
        await expect(tx).not.NaN;

        const id = await luckyRedEnvelope.viewCurrentRedEnvelopeId();
        //console.log('id:%s',id);
        const rs = await luckyRedEnvelope.drawPrize(id, 999999n );
        await expect(rs).not.to.be.reverted;
        
        return {rs,myToken,luckyRedEnvelope};
    }
    

    describe("Deployment", function () {
        it("deploy TetherUSD", async function () {
            const { myToken } = await loadFixture(deployMyTokenFixture);
            const address = await myToken.getAddress();
            
            console.log('myToken address:',address);

        });

        it("deploy LuckyRedEnvelopeV2", async function () {
            const { luckyRedEnvelope } = await loadFixture(deployRedEnvelopeFixture);
            const address = await luckyRedEnvelope.getAddress();
            
            console.log('luckyRedEnvelope address:',address);
        });
    });

    describe("balance & approve",function(){
        it("balance", async function () {
            const { myToken,owner } = await loadFixture(deployMyTokenFixture);
            const balance = await myToken.balanceOf(owner);
            console.log('owner:%s balance:%d',owner.address,balance);
        });

        it("approve", async function () {
            const {rs} = await loadFixture(approveFixture);
            
            const tx = await rs.getTransaction();
            console.log('tx:%s',tx?.hash);
        });
    });

    describe("start redEnvelope",function(){
        it("create", async function () {
            const { rs1 ,myToken} = await loadFixture(startRedEnvelopeFixture);
            const tx = await rs1.getTransaction();
            const recept = await tx?.wait()

            const [owner, otherAccount] = await hre.ethers.getSigners();
            const balance = await myToken.balanceOf(owner)
            console.log('create tx:%s balance:%d gas:%d',tx?.hash,balance,recept?.gasUsed);
        });
        /*
        it("inject", async function () {
            const { rs1,myToken } = await loadFixture(injectRedEnvelopeFixture)
            const tx = await rs1.getTransaction();
            const recept = await tx?.wait()

            const [owner, otherAccount] = await hre.ethers.getSigners();
            const balance = await myToken.balanceOf(owner)
            console.log('inject tx:%s balance:%d gas:%d',tx?.hash,balance,recept?.gasUsed);
        });*/
        
        it("buy", async function () {
            //await loadFixture(injectRedEnvelopeFixture);
            const { rs1,myToken } = await loadFixture(buyRedEnvelopeFixture);
            const tx = await rs1.getTransaction();
            const recept = await tx?.wait()
            
            const [owner, otherAccount] = await hre.ethers.getSigners();
            const balance = await myToken.balanceOf(owner)
            console.log('buy tx:%s balance:%d gas:%d',tx?.hash,balance,recept?.gasUsed);
        });
        /*
        it("get", async function () {
            //await loadFixture(injectRedEnvelopeFixture);
            const { rs1,myToken } = await loadFixture(getRedEnvelopeFixture);
            const tx = await rs1.getTransaction();
            console.log('get tx:%s',tx?.hash);

            const [owner, otherAccount] = await hre.ethers.getSigners();
            const balance = await myToken.balanceOf(owner)
            console.log('get balance:%d',balance);
        });*/

        it("endRedEnvelope", async function () {
            
            const { rs1,myToken } = await loadFixture(endRedEnvelopeFixture);
            const tx = await rs1.getTransaction();
            const recept = await tx?.wait()

            const [owner, otherAccount] = await hre.ethers.getSigners();
            const balance = await myToken.balanceOf(owner)
            console.log('endRedEnvelope tx:%s balance:%d gas:%d',tx?.hash,balance,recept?.gasUsed);

        });
        it("drawPrize", async function () {
            const { rs,myToken,luckyRedEnvelope} = await loadFixture(drawPrizeRedEnvelopeFixture);
            const tx = await rs.getTransaction();   
   
            const recept = await hre.ethers.provider.getTransactionReceipt(tx!.hash);

            const [owner, otherAccount] = await hre.ethers.getSigners();
            const balance = await myToken.balanceOf(owner);
            console.log('drawPrize tx:%s balance:%d gas:%d',tx?.hash,balance,recept?.gasUsed);
            //console.log('log:%s',recept!.logs[0])


        });


    });

    
    
});
