import { DeployFunction } from 'hardhat-deploy/dist/types';
import {
  BasicNFT,
  DynamicSvgNFT,
  RandomIpfsNFT,
  VRFCoordinatorV2Mock,
} from '../typechain-types';
import { ethers, network } from 'hardhat';
import { developmentChains } from '../const';

const mint: DeployFunction = async ({ getNamedAccounts }) => {
  const { deployer } = await getNamedAccounts();

  // Basic NFT
  const BasicNFT: BasicNFT = await ethers.getContract('BasicNFT', deployer);
  const basicNftMintTx = await BasicNFT.mintNft();
  await basicNftMintTx.wait();
  console.log(`Basic NFT index 0 tokenURI: ${await BasicNFT.tokenURI(0)}`);

  // Dynamic SVG NFT
  const DynamicSvgNFT: DynamicSvgNFT = await ethers.getContract(
    'DynamicSvgNFT',
    deployer
  );
  const dynamicNftMintTx = await DynamicSvgNFT.mintNft(
    ethers.parseEther('4000') // 4000 dollar per eth, which is higher than the currenct eth price
  );
  await dynamicNftMintTx.wait();
  console.log(
    `Dynamic SVG NFT index 0 tokenURI: ${await DynamicSvgNFT.tokenURI(0)}`
  );

  // Random IPFS NFT
  const RandomIpfsNft: RandomIpfsNFT = await ethers.getContract(
    'RandomIpfsNFT',
    deployer
  );
  const mintFee = await RandomIpfsNft.getMintFee();
  const randomIpfsNftMintTx = await RandomIpfsNft.requestNFT({
    value: mintFee,
  });
  const recepit = await randomIpfsNftMintTx.wait();
  const event = RandomIpfsNft.getEvent('NftMinted');
  await new Promise<void>(async (resolve, reject) => {
    RandomIpfsNft.once(event, async () => {
      setTimeout(
        () => reject("Timeout: 'NFTMinted' event did not fire after 5 mins"),
        300000
      );
      console.log(
        `Random IPFS NFT index 0 tokenURI: ${await RandomIpfsNft.tokenURI(0)}`
      );
      resolve();
    });
    if (developmentChains.includes(network.name)) {
      const VRFCoordinatorV2Mock: VRFCoordinatorV2Mock =
        await ethers.getContract('VRFCoordinatorV2Mock');
      // @ts-ignore
      const requestId = recepit?.logs[1]?.args[0];
      const consumerAddress = await RandomIpfsNft.getAddress();
      await VRFCoordinatorV2Mock.fulfillRandomWords(requestId, consumerAddress);
    }
  });
};

mint.tags = ['all', 'mint'];

export default mint;
