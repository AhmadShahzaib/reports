export function previousWeekDate(dateStr) {
    // Create a new Date object from the input date string
    const date = new Date(dateStr);

    // Get the UTC values for year, month, and day
    const year = date.getUTCFullYear();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');

    // Create a new Date object with UTC values
    const utcDate = new Date(`${year}-${month}-${day}T00:00:00Z`);

    // Subtract 7 days from the UTC date to get the previous week's date
    utcDate.setUTCDate(utcDate.getUTCDate() - 7);

    // Get the year, month, and day of the new date object and format it as a string
    const newYear = utcDate.getUTCFullYear();
    const newMonth = (utcDate.getUTCMonth() + 1)
      .toString()
      .padStart(2, '0');
    const newDay = utcDate.getUTCDate().toString().padStart(2, '0');
    const newDateStr = `${newYear}-${newMonth}-${newDay}`;

    // Return the new date string
    return newDateStr;
  }