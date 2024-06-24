export const fileNameCreation = (lastName, licenceNumber, date, time) => {
    try {
        const filename=[];
        
        for(let i =0; i< 5 ; i++){
            if(lastName[i]){

                filename[i]=lastName[i];
            }else  {
                filename[i]="_";

            }}
            
            filename[5] = licenceNumber[licenceNumber.length-2];
            filename[6] = licenceNumber[licenceNumber.length-1];
            const sum = findSum(licenceNumber);
            filename[7]=sum[0];
            filename[8]=sum[1];
            filename[9]= date[0];
            filename[10]= date[1];
            filename[11]= date[2];
            filename[12]= date[3];
            filename[13]= date[4];
            filename[14]= date[5];

            filename[15]= "_";
            filename[16]= time[0];
            filename[17]= time[1];
            filename[18]= time[2];
            filename[19]= time[3];
           
            filename[14]= date[5];
            filename[20]= date[0];
            filename[21]= date[1];
            filename[22]= date[2];
            filename[23]= date[3];
            filename[24]= date[5];
            
return filename.join("");

        } catch (err) {}
    };

  
    
  function findSum(str)
	{
		let temp = "0";

		let sum = 0;

		for (let i = 0; i < str.length; i++) {
			const ch = str[i];

			if (!isNaN((ch) * 1))
				{temp += ch;

		
				sum += parseInt(temp);
        }
				
				temp = "0";
			
		}
let result: any = sum + parseInt(temp)
	
        if(result > 99){
            result = result % 100;
        }
        if(result < 10){
            result = "0" + result;
        }
       return result.toString()
	}