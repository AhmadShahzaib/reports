
export const isValidCarrierName = async (name:any) => {
    try {
        
            let WarningMessege=''
              if(name.length<4 || name.length>120){
                WarningMessege = "The Field Carrier Name has a lenght of "+name.length+" characters . Carrier Name fields should have a lenght between 4 and 120 characters."
              }
              return WarningMessege
          
    } catch (err) {
      return err;
    }
  };
  