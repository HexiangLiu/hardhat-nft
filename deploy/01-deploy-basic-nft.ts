import { getNamedAccounts, network } from 'hardhat';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { developmentChains } from '../const';
import verify from '../utils/verify';

const deploy = async (hre: HardhatRuntimeEnvironment) => {
  const {
    deployments: { deploy, log },
  } = hre;
  try {
    log('------------------');
    const { deployer } = await getNamedAccounts();
    const contract = await deploy('BasicNFT', {
      from: deployer,
      args: [],
      log: true,
    });
    console.log(contract.address);
    if (!developmentChains.includes(network.name)) {
      log('Verifying...');
      verify(contract.address);
    }
  } catch (e) {
    console.error(e);
  }
};

deploy.tags = ['all', 'basicNft', 'main'];

export default deploy;
