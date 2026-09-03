import somnathPrasad from '../assets/prasad/somnath_prasad.jpg';
import dwarkaPrasad from '../assets/prasad/dwarka_prasad.jpg';
import ambajiPrasad from '../assets/prasad/ambaji_prasad.jpg';
import pavagadhPrasad from '../assets/prasad/pavagadh_prasad.jpg';
import panchamrutPrasad from '../assets/prasad/panchamrut_prasad.jpg';
import blessingsBox from '../assets/prasad/blessings_box.jpg';

export const PRASAD_IMAGE_MAP = {
  // Somnath
  'prasad-somnath-maha': somnathPrasad,
  'prasad-somnath-panchamrut': panchamrutPrasad,
  'prasad-somnath-bhog': somnathPrasad,
  'prasad-somnath-dryfruit': blessingsBox,
  'prasad-somnath-blessings': blessingsBox,

  // Dwarkadhish
  'prasad-dwarka-56bhog': dwarkaPrasad,
  'prasad-dwarka-maha': dwarkaPrasad,
  'prasad-dwarka-panchamrut': panchamrutPrasad,
  'prasad-dwarka-rajbhog': dwarkaPrasad,
  'prasad-dwarka-chardham': blessingsBox,

  // Ambaji
  'prasad-ambaji-maha': ambajiPrasad,
  'prasad-ambaji-arasuri': ambajiPrasad,
  'prasad-ambaji-mohanthal': ambajiPrasad,
  'prasad-ambaji-chundadi': ambajiPrasad,
  'prasad-ambaji-blessings': blessingsBox,

  // Pavagadh
  'prasad-pavagadh-maha': pavagadhPrasad,
  'prasad-pavagadh-box': pavagadhPrasad,
  'prasad-pavagadh-bhog': pavagadhPrasad,
  'prasad-pavagadh-panchamrut': panchamrutPrasad,
  'prasad-pavagadh-ashirwad': blessingsBox,
};

export const getPrasadItemImage = (itemId, templeId) => {
  if (PRASAD_IMAGE_MAP[itemId]) {
    return PRASAD_IMAGE_MAP[itemId];
  }
  if (templeId === 'somnath') return somnathPrasad;
  if (templeId === 'dwarka') return dwarkaPrasad;
  if (templeId === 'ambaji') return ambajiPrasad;
  if (templeId === 'pavagadh') return pavagadhPrasad;
  return somnathPrasad;
};
