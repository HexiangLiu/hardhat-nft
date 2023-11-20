import { ethers, getNamedAccounts, network } from 'hardhat';
import path from 'path';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { _amount, developmentChains, networkConfig } from '../const';
import { VRFCoordinatorV2Mock } from '../typechain-types';
import verify from '../utils/verify';
import { storeImages, storeMetaData } from '../utils/uploadToPinata';
import { MetaData } from '../types';

const handleTokenUris = async (imagesFolderPath: string) => {
  let tokenUris = [];
  // store the Image in IPFS
  const { ipfsRes, files } = await storeImages(imagesFolderPath);
  // store the metadada in IPFS
  for (const index in ipfsRes) {
    const name = files[index].replace('.png', '');
    const tokenUriMetaData: MetaData = {
      name,
      image: `ipfs://${ipfsRes[index].IpfsHash}`,
      description: `An adorable ${name} pup!`,
    };
    console.log(`Uploading ${name}...`);
    const res = await storeMetaData(tokenUriMetaData);
    tokenUris.push(`ipfs://${res?.IpfsHash}`);
  }
  console.log(tokenUris);
  return tokenUris;
};

const deploy = async (hre: HardhatRuntimeEnvironment) => {
  const {
    deployments: { deploy, log },
  } = hre;
  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;
  let subscriptionId: string;
  let vrfCoordinator: string;
  let gasLane: string;
  let callbackGasLimit: number;
  let tokenUris: string[] = [
    'ipfs://Qmag246rqoLpqEXC4Atwwk5vYDBRuhkAkP9WNwePXG2jos',
    'ipfs://Qme7ou5k37gvamBBUD4rxqUjEDr2fNoxx4DobyVtddx1V6',
    'ipfs://QmUAvpzSLCBWCXSfjs3SHWWddt6dPNEShemB6awi2Vwc5m',
  ];
  let VRFCoordinatorV2Mock: VRFCoordinatorV2Mock;
  const mintFee = ethers.parseEther('0.01');

  // get the tokenURI of our images
  if (process.env.UPLOAD_TO_PINATA === 'true') {
    tokenUris = await handleTokenUris(
      path.resolve(__dirname, '../images/randomNft')
    );
  }

  if (developmentChains.includes(network.name)) {
    VRFCoordinatorV2Mock = await ethers.getContract(
      'VRFCoordinatorV2Mock',
      deployer
    );
    const tx = await VRFCoordinatorV2Mock.createSubscription();
    const receipt = await tx.wait();
    // @ts-ignore
    subscriptionId = receipt.logs[0].args[0];
    vrfCoordinator = await VRFCoordinatorV2Mock.getAddress();
    await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, _amount);
    ({ gasLane, callbackGasLimit } = networkConfig[chainId!]);
  } else {
    ({ subscriptionId, vrfCoordinator, gasLane, callbackGasLimit } =
      networkConfig[chainId!]);
  }
  const args = [
    subscriptionId,
    gasLane,
    callbackGasLimit,
    vrfCoordinator,
    tokenUris,
    mintFee,
  ];
  const RandomIpfsNFT = await deploy('RandomIpfsNFT', {
    from: deployer,
    args,
    log: true,
  });

  if (developmentChains.includes(network.name)) {
    // @ts-ignore
    await VRFCoordinatorV2Mock.addConsumer(
      subscriptionId,
      RandomIpfsNFT.address
    );
  }

  if (!developmentChains.includes(network.name)) {
    log('Verifying...');
    await verify(RandomIpfsNFT.address, args);
  }
  log('--------------------------');
};

deploy.tags = ['all', 'randomNft'];

export default deploy;
