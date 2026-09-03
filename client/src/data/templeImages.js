/**
 * DivYatra — Centralized Temple Image Registry
 *
 * All images are local assets in src/assets/
 */

// ── Somnath ──────────────────────────────────────────────────────────────────
import somnathHero      from '../assets/somnath.jpg';
import somnathGallery1  from '../assets/SomnathGallery1.jpg';
import somnathGallery2  from '../assets/SomnathGallery2jpg.jpg';
import somnathGallery3  from '../assets/SomnathGallery3.jpg';

// ── Dwarka ────────────────────────────────────────────────────────────────────
import dwarkaHero       from '../assets/dwarkadhish.jpg';
import dwarkaGallery1   from '../assets/dwarkadhishGallery1.jpg';
import dwarkaGallery2   from '../assets/dwarkadhishGallery2.jpg';
import dwarkaGallery3   from '../assets/DwarkadhishGallery3.jpg';

// ── Ambaji ────────────────────────────────────────────────────────────────────
import ambajiHero       from '../assets/ambaji.jpg';
import ambajiGallery1   from '../assets/ambajigallery1.jpg';
import ambajiGallery2   from '../assets/ambajigallery2.jpg';
import ambajiGallery3   from '../assets/ambajigallery3.jpg';

// ── Pavagadh ──────────────────────────────────────────────────────────────────
import pavagadhHero     from '../assets/pavagadh.jpg';
import pavagadhGallery1 from '../assets/Pavagadhgallery1.jpg';
import pavagadhGallery2 from '../assets/pavagadhgallery2jpg.jpg';
import pavagadhGallery3 from '../assets/pavagadhgallery3.jpg';

// ─────────────────────────────────────────────────────────────────────────────

export const TEMPLE_IMAGES = {
  somnath: {
    hero:            somnathHero,
    heroFallback:    somnathHero,
    thumbnail:       somnathHero,
    gallery:         [somnathGallery1, somnathGallery2, somnathGallery3],
    darshan:         somnathGallery1,
    prasad:          somnathGallery2,
    liveStreamThumb: somnathHero,
  },

  dwarka: {
    hero:            dwarkaHero,
    heroFallback:    dwarkaHero,
    thumbnail:       dwarkaHero,
    gallery:         [dwarkaGallery1, dwarkaGallery2, dwarkaGallery3],
    darshan:         dwarkaGallery1,
    prasad:          dwarkaGallery2,
    liveStreamThumb: dwarkaHero,
  },

  ambaji: {
    hero:            ambajiHero,
    heroFallback:    ambajiHero,
    thumbnail:       ambajiHero,
    gallery:         [ambajiGallery1, ambajiGallery2, ambajiGallery3],
    darshan:         ambajiGallery1,
    prasad:          ambajiGallery2,
    liveStreamThumb: ambajiHero,
  },

  pavagadh: {
    hero:            pavagadhHero,
    heroFallback:    pavagadhHero,
    thumbnail:       pavagadhHero,
    gallery:         [pavagadhGallery1, pavagadhGallery2, pavagadhGallery3],
    darshan:         pavagadhGallery1,
    prasad:          pavagadhGallery2,
    liveStreamThumb: pavagadhHero,
  },
};

/** Homepage hero — Somnath, most iconic of the four */
export const HOMEPAGE_HERO_IMAGE    = somnathHero;
export const HOMEPAGE_HERO_FALLBACK = somnathGallery1;

/**
 * Get a specific image for a temple, falling back to somnath if not found.
 * @param {string} templeId  — somnath | dwarka | ambaji | pavagadh
 * @param {string} type      — hero | thumbnail | darshan | prasad | liveStreamThumb
 */
export const getTempleImage = (templeId, type = 'thumbnail') => {
  return TEMPLE_IMAGES[templeId]?.[type] ?? TEMPLE_IMAGES.somnath[type];
};
