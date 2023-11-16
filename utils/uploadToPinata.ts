import pinataSDK from '@pinata/sdk';
import * as fs from 'fs';
import path from 'path';
import { MetaData } from '../types';

const pinata = new pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_KEY
);

export const storeImages = async (imagesFolderPath: string) => {
  const files = fs.readdirSync(imagesFolderPath);
  let ipfsRes = [];
  for (let i = 0; i < files.length; i++) {
    const imagePath = path.join(imagesFolderPath, files[i]);
    try {
      const readableStreamForFile = fs.createReadStream(imagePath);
      const res = await pinata.pinFileToIPFS(readableStreamForFile, {
        pinataMetadata: {
          name: files[i],
        },
      });
      ipfsRes.push(res);
    } catch (e) {
      console.error(e);
    }
  }
  return { ipfsRes, files };
};

export const storeMetaData = async (metadata: MetaData) => {
  try {
    const res = await pinata.pinJSONToIPFS(metadata, {
      pinataMetadata: {
        name: `${metadata.name} metaData`,
      },
    });
    return res;
  } catch (e) {
    console.error(e);
  }
};
