// Convert Date object → "MM/dd/yyyy" string
function DateToString(date) {
  if (!date) return '';

  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months start at 0
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

// Convert "MM/dd/yyyy" string → Date object
function StringToDate(dateString) {
  if (!dateString) return null;

  const [month, day, year] = dateString.split('/').map(Number);

  return new Date(year, month - 1, day); // month is zero-based
}

function isNullOrWhiteSpace(str) {
  return !str || str.trim().length === 0;
}