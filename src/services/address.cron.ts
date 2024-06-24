import { ConfigurationService } from '@shafiqrathore/logeld-tenantbackend-common-future';
import TIDocument from 'mongoDb/documents/TIDocument';
import NodeGeocoder from 'node-geocoder';

const configService = new ConfigurationService();
const options = {
  provider: 'google',
  apiKey: configService.get('GOOGLE_API_KEY'),
  formatter: null,
};
const geocoder = NodeGeocoder(options);

export async function getAddress(data: TIDocument) {
  const updateAddressObject = {};
  if (
    isLatitude(data.location.latitude) &&
    isLongitude(data.location.longitude)
  ) {
    updateAddressObject['location.address'] = await getAddressForCoordinates(
      data.location.latitude,
      data.location.longitude,
    );
  }
  if (updateAddressObject) {
    return await data?.updateOne({ $set: updateAddressObject });
  } else {
    return {};
  }
}
async function getAddressForCoordinates(lat: number, lon: number) {
  let response;
  try {
    if (lat === 0 && lon === 0) {
      return (response = '');
    }
    const apiResponse = await geocoder.reverse({ lat: lat, lon: lon });
    response = apiResponse[0]?.formattedAddress || '';
    return response;
  } catch (error) {
    console.log(error);
    response = '';
    return response;
  }
}

const isLatitude = (num) => isFinite(num) && Math.abs(num) <= 90;
const isLongitude = (num) => isFinite(num) && Math.abs(num) <= 180;
