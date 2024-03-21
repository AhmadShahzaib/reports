
export const isValidVin = async (vin:any) => {
  try {
    
        // Check if the VIN has the correct length
        if (vin.length !== 17) {
          return false;
        }
        
        // Check if the VIN only contains capital letters and numbers
        if (!/^[A-Z0-9]+$/.test(vin)) {
          return false;
        }
        
        // Check if the VIN does not contain the characters 'I', 'O', or 'Q'
        if (/[IOQ]/.test(vin)) {
          return false;
        }
        
        return true;
      
  } catch (err) {
    return err;
  }
};
