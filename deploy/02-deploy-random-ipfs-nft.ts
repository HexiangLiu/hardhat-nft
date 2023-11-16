import { ethers, getNamedAccounts, network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { _amount, developmentChains, networkConfig } from '../const';
import { VRFCoordinatorV2Mock } from '../typechain-types';
import verify from '../utils/verify';

const deploy = async (hre: HardhatRuntimeEnvironment) => {
  const {
    deployments: { deploy, log },
  } = hre;
  const { deployer } = await getNamedAccounts();
  const { chainId } = network.config;
  let subscriptionId: string;
  let vrfCoordinator: string;
  let gasLane: string;
  const mintFee = ethers.parseEther('0.01');
  if (developmentChains.includes(network.name)) {
    const VRFCoordinatorV2Mock: VRFCoordinatorV2Mock = await ethers.getContract(
      'VRFCoordinatorV2Mock',
      deployer
    );
    const tx = await VRFCoordinatorV2Mock.createSubscription();
    const receipt = await tx.wait();
    // @ts-ignore
    subscriptionId = receipt.logs[0].args[0];
    vrfCoordinator = await VRFCoordinatorV2Mock.getAddress();
    await VRFCoordinatorV2Mock.fundSubscription(subscriptionId, _amount);
    ({ gasLane } = networkConfig[chainId!]);
  } else {
    ({ subscriptionId, vrfCoordinator, gasLane } = networkConfig[chainId!]);
  }
  const args = [subscriptionId, gasLane, 400000, vrfCoordinator, [], mintFee];
  const RandomIpfsNFT = await deploy('RandomIpfsNFT', {
    from: deployer,
    args,
    log: true,
  });
  if (!developmentChains.includes(network.name)) {
    log('Verifying...');
    await verify(RandomIpfsNFT.address, args);
  }
  log('--------------------------');
};

deploy.tags = ['all', 'randomNft'];

export default deploy;
