export const acresToHectares = (acres) => {
  if (acres === null || acres === undefined || acres === '') return acres;
  return Number(acres) * 0.404686;
};

export const hectaresToAcres = (hectares) => {
  if (hectares === null || hectares === undefined || hectares === '') return hectares;
  return Number(hectares) / 0.404686;
};

export const kgHaToKgAcre = (kgHa) => {
  if (kgHa === null || kgHa === undefined || kgHa === '') return kgHa;
  return Number(kgHa) * 0.404686;
};

export const kgAcreToKgHa = (kgAcre) => {
  if (kgAcre === null || kgAcre === undefined || kgAcre === '') return kgAcre;
  return Number(kgAcre) / 0.404686;
};
