import { sign } from 'jsonwebtoken';

export const splitSign = async (
imageUrl: string,
) => {
 

    const keyIndex = imageUrl.indexOf('/', imageUrl.indexOf('https://') + 'https://'.length);
    const key = imageUrl.substring(keyIndex + 1);
  
    const imageNameIndex = imageUrl.lastIndexOf('/');
    const imageName = imageUrl.substring(imageNameIndex + 1);
  
    return { key, imageName,imageUrl };




};
