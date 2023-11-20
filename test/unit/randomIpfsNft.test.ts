import { deployments, ethers, getNamedAccounts, network } from 'hardhat';
import { developmentChains, mintFee } from '../../const';
import { RandomIpfsNFT, VRFCoordinatorV2Mock } from '../../typechain-types';
import { assert, expect } from 'chai';

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('RandomIpfsNFT Test', () => {
      let deployer: string;
      let user: string;
      let RandomIpfsNFT: RandomIpfsNFT;
      let VRFCoordinatorV2Mock: VRFCoordinatorV2Mock;
      beforeEach(async () => {
        ({ deployer, user } = await getNamedAccounts());
        await deployments.fixture('randomNft');
        RandomIpfsNFT = await ethers.getContract('RandomIpfsNFT', deployer);
        VRFCoordinatorV2Mock = await ethers.getContract(
          'VRFCoordinatorV2Mock',
          deployer
        );
      });
      describe('Constructor', () => {
        it('init erc721 successfully', async () => {
          expect(await RandomIpfsNFT.name()).equal('RandomIpfsNFT');
          expect(await RandomIpfsNFT.symbol()).equal('RIN');
        });
        it('init token uirs successfully', async () => {
          const tokenUri = await RandomIpfsNFT.getDogTokenUris(0);
          assert(tokenUri.includes('ipfs://'));
        });
      });
      describe('request Nft', () => {
        it('revert if value is not sent', async () => {
          await expect(
            RandomIpfsNFT.requestNFT()
          ).to.be.revertedWithCustomError(
            RandomIpfsNFT,
            'RandomIpfsNFT_NeedMoreETHSent'
          );
        });
        it('reverts if value is less than the mint fee', async function () {
          await expect(
            RandomIpfsNFT.requestNFT({
              value: mintFee - ethers.parseEther('0.001'),
            })
          ).to.be.revertedWithCustomError(
            RandomIpfsNFT,
            'RandomIpfsNFT_NeedMoreETHSent'
          );
        });
        it('request successfully if mint enough', async () => {
          await expect(RandomIpfsNFT.requestNFT({ value: mintFee })).to.emit(
            RandomIpfsNFT,
            'NftRequested'
          );
        });
      });
      describe('fulfillRandomWords', () => {
        it('mint successfully', async () => {
          await new Promise<void>(async (resolve) => {
            const event = RandomIpfsNFT.getEvent('NftMinted');
            RandomIpfsNFT.once(event, async () => {
              const tokenUri = await RandomIpfsNFT.tokenURI('0');
              const tokenCounter = await RandomIpfsNFT.getTokenCounter();
              assert(tokenCounter.toString() === '1');
              assert(tokenUri.includes('ipfs://'));
              resolve();
            });
            const tx = await RandomIpfsNFT.requestNFT({ value: mintFee });
            const receipt = await tx.wait();
            const consumerAddress = await RandomIpfsNFT.getAddress();
            await VRFCoordinatorV2Mock.fulfillRandomWords(
              //@ts-ignore
              receipt.logs[1].args[0],
              consumerAddress
            );
          });
        });
      });
      describe('getBreedFormModdedRng', () => {
        it('should return pug/0 if moddedRng < 10', async () => {
          expect(await RandomIpfsNFT.getBreedFormModdedRng(7)).equal(0);
        });
        it('should return shiba-inu/1 if moddedRng is between [10, 30)', async () => {
          expect(await RandomIpfsNFT.getBreedFormModdedRng(15)).equal(1);
        });
        it('should return st_bernard/2 if moddedRng is between [30 - 100)', async () => {
          expect(await RandomIpfsNFT.getBreedFormModdedRng(88)).equal(2);
        });
      });
      describe('withdraw', () => {
        it('revert if not the owner', async () => {
          const RandomIpfsNFT: RandomIpfsNFT = await ethers.getContract(
            'RandomIpfsNFT',
            user
          );
          await expect(RandomIpfsNFT.withDraw()).to.be.revertedWith(
            'Ownable: caller is not the owner'
          );
        });
        it('withdraw successfully if sender is the owner', async () => {
          const address = await RandomIpfsNFT.getAddress();
          const tx1 = await RandomIpfsNFT.requestNFT({ value: mintFee });
          await tx1.wait(1);
          const preBalance = await ethers.provider.getBalance(deployer);
          const preContractBalance = await ethers.provider.getBalance(address);
          const tx2 = await RandomIpfsNFT.withDraw();
          const receipt = await tx2.wait();
          //@ts-ignore
          const { gasPrice, gasUsed }: { gasPrice: bigint; gasUsed: bigint } =
            receipt;
          const curBalance = await ethers.provider.getBalance(deployer);
          const curContractBalance = await ethers.provider.getBalance(address);
          expect(curBalance + gasPrice * gasUsed).equal(
            preBalance + preContractBalance
          );
          expect(curContractBalance).equal(0);
        });
      });
      describe('getMintFee', () => {
        it('get mintFee successfully', async () => {
          const res = await RandomIpfsNFT.getMintFee();
          assert(res === mintFee);
        });
      });
    });
