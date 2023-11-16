import { getNamedAccounts, network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains, _BASEFEE, _GASPRICELINK } from '../const';

const deploy = async (hre: HardhatRuntimeEnvironment) => {
  const {
    deployments: { deploy, log },
  } = hre;
  const { deployer } = await getNamedAccounts();
  if (developmentChains.includes(network.name)) {
    log('Local network detected! Deploying mocks...');
    await deploy('VRFCoordinatorV2Mock', {
      from: deployer,
      args: [_BASEFEE, _GASPRICELINK],
      log: true,
    });
    log('Mocks Deployed!');
    log('--------------------------');
  }
};

deploy.tags = ['all', 'randomNft'];

export default deploy;
