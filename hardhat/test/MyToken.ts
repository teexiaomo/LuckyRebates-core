import hre from "hardhat";

async function main() {

    const [owner, otherAccount] = await hre.ethers.getSigners();

    const MyToken = await hre.ethers.getContractFactory("TetherUSD");
    const myToken = await MyToken.deploy(owner);
    
    //await myToken.waitForDeployment()
    const address = await myToken.getAddress();
    
    console.log('address:',address)
}

main()
    .then(()=>process.exit(0))
    .catch((error)=>{
        console.error(error)
        process.exitCode = 1
    })