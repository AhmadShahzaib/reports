export const vinChecksum = (vin) => {
  if (vin) {
    const vinArr = vin.split('');
    const orignalArr = vin.split('');
    const sampleArr = vinArr;
    let sum = 0;
    for (let i = 0; i < vinArr.length; i++) {
      switch (vinArr[i]) {
        case 'A':
          vinArr[i] = '1';
          break;
        case 'B':
          vinArr[i] = '2';
          break;
        case 'C':
          vinArr[i] = '3';
          break;
        case 'D':
          vinArr[i] = '4';
          break;
        case 'E':
          vinArr[i] = '5';
          break;
        case 'F':
          vinArr[i] = '6';
          break;
        case 'G':
          vinArr[i] = '7';
          break;
        case 'H':
          vinArr[i] = '8';
          break;
        case 'I':
          vinArr[i] = vinArr[i];
          break;
        case 'J':
          vinArr[i] = '1';
          break;
        case 'K':
          vinArr[i] = '2';
          break;
        case 'L':
          vinArr[i] = '3';
          break;
        case 'M':
          vinArr[i] = '4';
          break;
        case 'N':
          vinArr[i] = '5';
          break;
        case 'O':
          vinArr[i] = vinArr[i];

          break;

        case 'P':
          vinArr[i] = '7';
          break;
        case 'Q':
          vinArr[i] = vinArr[i];
          break;
        case 'R':
          vinArr[i] = '9';
          break;
        case 'S':
          vinArr[i] = '2';
          break;
        case 'T':
          vinArr[i] = '3';
          break;
        case 'U':
          vinArr[i] = '4';
          break;
        case 'V':
          vinArr[i] = '5';
          break;

        case 'W':
          vinArr[i] = '6';
          break;
        case 'X':
          vinArr[i] = '7';
          break;
        case 'Y':
          vinArr[i] = '8';
          break;
        case 'Z':
          vinArr[i] = '9';
          break;
        default:
          vinArr[i] = vinArr[i];
          break;
        // code block
      }

      switch (i + 1) {
        case 1:
          sampleArr[i] = vinArr[i] * 8;
          break;
        case 2:
          sampleArr[i] = vinArr[i] * 7;
          break;
        case 3:
          sampleArr[i] = vinArr[i] * 6;
          break;
        case 4:
          sampleArr[i] = vinArr[i] * 5;
          break;
        case 5:
          sampleArr[i] = vinArr[i] * 4;
          break;
        case 6:
          sampleArr[i] = vinArr[i] * 3;
          break;
        case 7:
          sampleArr[i] = vinArr[i] * 2;
          break;
        case 8:
          sampleArr[i] = vinArr[i] * 10;
          break;
        case 9:
          sampleArr[i] = vinArr[i] * 0;
          break;
        case 10:
          sampleArr[i] = vinArr[i] * 9;
          break;
        case 11:
          sampleArr[i] = vinArr[i] * 8;
          break;
        case 12:
          sampleArr[i] = vinArr[i] * 7;
          break;
        case 13:
          sampleArr[i] = vinArr[i] * 6;
          break;
        case 14:
          sampleArr[i] = vinArr[i] * 5;
          break;
        case 15:
          sampleArr[i] = vinArr[i] * 4;
          break;
        case 16:
          sampleArr[i] = vinArr[i] * 3;
          break;
        case 17:
          sampleArr[i] = vinArr[i] * 2;
          break;

        default:
          sampleArr[i] = vinArr[i];
          break;
        // code block
      }
      sum += Number(sampleArr[i]);
    }
    orignalArr[8] = sum % 11;
    return orignalArr.join('');
  } else {
    return '';
  }
  
};
