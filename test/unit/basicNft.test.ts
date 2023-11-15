import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains } from '../../const';
import { BasicNFT } from '../../typechain-types';
import { assert, expect } from 'chai';
!developmentChains.includes(network.name)
  ? describe.skip
  : describe('BasicNft Test', () => {
      let BasicNFT: BasicNFT;
      let deployer: string;
      beforeEach(async () => {
        await deployments.fixture(['basicNft']);
        ({ deployer } = await getNamedAccounts());
        BasicNFT = await ethers.getContract('BasicNFT', deployer);
      });
      describe('constructor', () => {
        it('init successfully', async () => {
          const symbol = await BasicNFT.symbol();
          const name = await BasicNFT.name();
          const tokenCounter = await BasicNFT.getTokenCounter();
          assert(symbol === 'DOG');
          assert(name === 'Dogie');
          assert(tokenCounter.toString() === '0');
        });
      });
      describe('mintNFT', () => {
        it('mintNFT update tokenCounter', async () => {
          const tx = await BasicNFT.mintNft();
          tx.wait();
          const tokenCounter = await BasicNFT.getTokenCounter();
          assert(tokenCounter.toString() === '1');
        });
        it('mintNFT emit event', async () => {
          await expect(BasicNFT.mintNft())
            .emit(BasicNFT, 'Transfer')
            .withArgs(ethers.ZeroAddress, deployer, '0');
        });
      });
      describe('tokenURI', () => {
        it('should reverted if no existToken', async () => {
          await expect(BasicNFT.tokenURI(1)).to.be.rejectedWith(
            'ERC721Metadata: URI query for nonexistent token'
          );
        });
        it('should return tokenURI', async () => {
          const tx = await BasicNFT.mintNft();
          tx.wait();
          const tokenURI = await BasicNFT.tokenURI(0);
          assert(
            tokenURI ===
              'ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json0'
          );
        });
      });
    });
