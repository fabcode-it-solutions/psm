// countrydata.ts
import countries from 'world-countries';

export interface CountryData {
  name: string;
  code: string;
  callingCodes: string[];
  currencyCode: string;
  currencySymbol: string;
}

export const countryList: CountryData[] = countries.map((country) => {
  const currencyData = country.currencies ? Object.values(country.currencies)[0] : null;
  const currencyCode = currencyData ? Object.keys(country.currencies)[0] : 'N/A';
  const currencySymbol = currencyData ? currencyData.symbol : 'N/A';

   const callingCodes =
    country.idd?.root && country.idd?.suffixes
      ? country.idd.suffixes.map(
          (suffix) => `${country.idd.root.replace("+", "")}${suffix}`
        )
      : [];

  return {
    name: country.name.common,
    code: country.cca2,
    callingCodes,
    currencyCode,
    currencySymbol,
  };
});


/**
 * Get country info from calling code
 * Example: "91" -> India
 */
export function getCountryByCallingCode(code?: string | number) {
  if (!code) return null;

  const callingCode = String(code);

  const matches = countryList.filter((country) =>
    country.callingCodes.includes(callingCode)
  );

  if (!matches.length) {
    return {
      code: callingCode,
      name: null,
      display: `+${callingCode}`,
    };
  }

  return {
    code: callingCode,
    name: matches[0].name, // primary country
    display: `${matches.map((c) => c.name).join(", ")} (+${callingCode})`,
  };
}

