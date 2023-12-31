import { ethers } from 'hardhat';

export const developmentChains = ['localhost', 'hardhat'];

export const _BASEFEE = 100000000000000000n;
export const _GASPRICELINK = 1000000000;
export const _amount = 1000000000000000000n;
export const _decimals = 18;
export const _initialAnswer = 2000000000000000000n;

export const networkConfig: Record<string, any> = {
  11155111: {
    name: 'sepolia',
    vrfCoordinator: '0x8103b0a8a00be2ddc778e6e7eaa21791cd364625',
    gasLane:
      '0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c',
    subscriptionId: '6442',
    callbackGasLimit: 400000,
    priceFeed: '0x694AA1769357215DE4FAC081bf1f309aDC325306', // ETH/USD
  },
  31337: {
    name: 'hardhat',
    gasLane:
      '0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc',
    callbackGasLimit: 400000,
  },
};

export const mintFee = ethers.parseEther('0.01');
