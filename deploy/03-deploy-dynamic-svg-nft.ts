import { ethers, getNamedAccounts, network } from 'hardhat';
import { DeployFunction } from 'hardhat-deploy/dist/types';
import * as fs from 'fs';
import path from 'path';
import verify from '../utils/verify';
import { developmentChains, networkConfig } from '../const';

const deploy: DeployFunction = async ({ deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;
  let priceFeed: string;
  if (developmentChains.includes(network.name)) {
    const MockV3Aggregator = await ethers.getContract('MockV3Aggregator');
    priceFeed = await MockV3Aggregator.getAddress();
  } else {
    priceFeed = networkConfig[network.config.chainId!].priceFeed;
  }
  const lowSVG = await fs.readFileSync(
    path.resolve(__dirname, '../images/dynamicNft/frown.svg'),
    {
      encoding: 'utf8',
    }
  );
  const highSVG = await fs.readFileSync(
    path.resolve(__dirname, '../images/dynamicNft/happy.svg'),
    {
      encoding: 'utf8',
    }
  );
  const args = [priceFeed, lowSVG, highSVG];
  const DynamicSvgNFT = await deploy('DynamicSvgNFT', {
    from: deployer,
    args,
    log: true,
  });

  if (!developmentChains.includes(network.name)) {
    log('Verifying...');
    await verify(DynamicSvgNFT.address, args);
  }
  log('--------------------------');
};

deploy.tags = ['all', 'dynamicNft', 'main'];

export default deploy;
