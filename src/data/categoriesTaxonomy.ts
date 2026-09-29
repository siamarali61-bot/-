import { CategoryId } from '../types';

export interface SubCategoryItem {
  id: string;
  labelAr: string;
  labelFr: string;
  labelEn: string;
  badge?: string;
}

export interface SubCategoryGroup {
  id: string;
  labelAr: string;
  labelFr: string;
  labelEn: string;
  season?: 'spring-summer' | 'autumn-winter' | 'all-season';
  icon: string; // Emoji / Icon indicator
  items: SubCategoryItem[];
}

export interface CategoryTaxonomy {
  id: CategoryId;
  labelAr: string;
  labelFr: string;
  labelEn: string;
  icon: string;
  taglineAr: string;
  groups: SubCategoryGroup[];
}

export const CATEGORIES_TAXONOMY: CategoryTaxonomy[] = [
  {
    id: 'women-fashion',
    labelAr: 'الملابس النسائية والقفاطين',
    labelFr: 'Mode Femme & Caftans',
    labelEn: "Women's Fashion & Caftans",
    icon: '👑',
    taglineAr: 'أزياء راقية، قنادر أعراس، عبايات حريرية وإطلالات لجميع الفصول',
    groups: [
      {
        id: 'women-spring-summer',
        labelAr: 'ملابس ربيعية وصيفية',
        labelFr: 'Collection Printemps - Été',
        labelEn: 'Spring / Summer Collection',
        season: 'spring-summer',
        icon: '☀️',
        items: [
          {
            id: 'women-summer-events',
            labelAr: 'ملابس مناسبات وحفلات / أعراس / تخرج',
            labelFr: 'Cérémonies, Mariages & Soirées',
            labelEn: 'Events, Weddings & Celebrations',
            badge: 'الأكثر طلباً',
          },
          {
            id: 'women-summer-hijab-prayer',
            labelAr: 'حجابات وأطقم صلاة حريرية',
            labelFr: 'Hijabs & Ensembles de Prière',
            labelEn: 'Hijabs & Prayer Ensembles',
          },
          {
            id: 'women-summer-casual-travel',
            labelAr: 'ملابس خرجات ونزهات وسفر',
            labelFr: 'Sorties, Voyages & Détente',
            labelEn: 'Casual Outings & Travel',
          },
          {
            id: 'women-summer-homewear',
            labelAr: 'ملابس منزلية للعازبات والمتزوجات',
            labelFr: 'Tenues d’Intérieur & Homewear',
            labelEn: 'Homewear & Loungewear',
          },
        ],
      },
      {
        id: 'women-autumn-winter',
        labelAr: 'ملابس شتوية وخريفية',
        labelFr: 'Collection Automne - Hiver',
        labelEn: 'Autumn / Winter Collection',
        season: 'autumn-winter',
        icon: '❄️',
        items: [
          {
            id: 'women-winter-events',
            labelAr: 'ملابس مناسبات وحفلات شتوية (قطيفة ملكية ومجبود)',
            labelFr: 'Soirées Hivernales & Velours Mejboud',
            labelEn: 'Winter Royal Velvet & Mejboud',
            badge: 'ملكي فاخر',
          },
          {
            id: 'women-winter-hijab-prayer',
            labelAr: 'حجابات وأطقم صلاة شتوية دافئة',
            labelFr: 'Hijabs & Prière Hiver',
            labelEn: 'Warm Winter Prayer Sets',
          },
          {
            id: 'women-winter-casual-coats',
            labelAr: 'ملابس خرجات ومعاطف ونزهات شتوية',
            labelFr: 'Manteaux & Sorties Hiver',
            labelEn: 'Winter Coats & Outerwear',
          },
          {
            id: 'women-winter-homewear',
            labelAr: 'ملابس منزلية شتوية فاخرة وبيجامات عرائس',
            labelFr: 'Homewear Chaud & Trousseau Mariée',
            labelEn: 'Warm Bridal Homewear',
          },
        ],
      },
    ],
  },
  {
    id: 'mens-apparel',
    labelAr: 'أزياء رجالية راقية',
    labelFr: 'Mode Homme Prestige',
    labelEn: "Men's Luxury Apparel",
    icon: '👔',
    taglineAr: 'بدلات إيطالية، قشابيات وبرانيس وأطقم صلاة فخمة',
    groups: [
      {
        id: 'mens-all-categories',
        labelAr: 'تصنيفات الأزياء الرجالية',
        labelFr: 'Catégories Homme',
        labelEn: "Men's Categories",
        season: 'all-season',
        icon: '✦',
        items: [
          {
            id: 'mens-events-weddings',
            labelAr: 'أزياء مناسبات وأعراس وبدلات إيطالية',
            labelFr: 'Costumes & Mariages',
            labelEn: 'Suits, Weddings & Galas',
            badge: 'VIP',
          },
          {
            id: 'mens-formal-business',
            labelAr: 'أزياء رسمية وأطقم عمل راقية',
            labelFr: 'Tenues Professionnelles',
            labelEn: 'Formal & Business Attire',
          },
          {
            id: 'mens-casual-daily',
            labelAr: 'أزياء يومية وخرجات كاجوال فاخرة',
            labelFr: 'Style Casual Chic & Sorties',
            labelEn: 'Casual Chic & Weekend',
          },
          {
            id: 'mens-homewear',
            labelAr: 'أزياء منزلية مريحة وبيجامات راقية',
            labelFr: 'Homewear & Détente',
            labelEn: 'Comfort Homewear',
          },
          {
            id: 'mens-prayer-sets',
            labelAr: 'أطقم صلاة وعباءات وجبادور تقليدي',
            labelFr: 'Djellabas & Tenues de Prière',
            labelEn: 'Prayer Sets & Djellabas',
          },
        ],
      },
    ],
  },
  {
    id: 'sweets-bakery',
    labelAr: 'حلويات وكيك فاخر',
    labelFr: 'Pâtisserie Fine & Gâteaux',
    labelEn: 'Luxury Sweets & Cakes',
    icon: '🧁',
    taglineAr: 'حلويات جزائرية ملكية، بقلاوة اللوز، وصناديق الخطوبة والأعراس',
    groups: [
      {
        id: 'sweets-all-categories',
        labelAr: 'أقسام الحلويات والمناسبات',
        labelFr: 'Occasions & Pâtisseries',
        labelEn: 'Pastry Occasions',
        season: 'all-season',
        icon: '🍰',
        items: [
          {
            id: 'sweets-weddings',
            labelAr: 'حلويات أعراس وخطوبة ملكية (بقلاوة، مقروط، دزيريات)',
            labelFr: 'Mariages & Fiançailles',
            labelEn: 'Weddings & Engagements',
            badge: 'الأكثر طلباً',
          },
          {
            id: 'sweets-graduations',
            labelAr: 'حلويات حفلات تخرج ونجاح البكالوريا والجامعة',
            labelFr: 'Remises de Diplômes & Fêtes',
            labelEn: 'Graduations & Success',
          },
          {
            id: 'sweets-birthdays',
            labelAr: 'كيك وحلويات أعياد ميلاد راقية مخصصة',
            labelFr: 'Anniversaires & Cakes Prestige',
            labelEn: 'Prestige Birthday Cakes',
          },
          {
            id: 'sweets-family-holidays',
            labelAr: 'حلويات مناسبات عائلية وأعياد دينية',
            labelFr: 'Fêtes Religieuses & Réunions',
            labelEn: 'Family & Eid Celebrations',
          },
        ],
      },
    ],
  },
  {
    id: 'catering-buffet',
    labelAr: 'مملحات وبوفيهات راقية (Catering)',
    labelFr: 'Buffets & Traiteur Prestige',
    labelEn: 'Savory Buffets & Catering',
    icon: '🍱',
    taglineAr: 'بوفيهات مفتوحة، صواني مقبلات ملونة، وضيافة استثنائية لأرقى الحفلات',
    groups: [
      {
        id: 'catering-all-categories',
        labelAr: 'بوفيهات وضيافة المناسبات',
        labelFr: 'Services Traiteur',
        labelEn: 'Catering Services',
        season: 'all-season',
        icon: '✨',
        items: [
          {
            id: 'buffet-royal-open',
            labelAr: 'بوفيهات مفتوحة ملكية متكاملة (Open Buffet)',
            labelFr: 'Buffets Ouverts Royaux',
            labelEn: 'Royal Open Buffets',
            badge: 'ضيافة VIP',
          },
          {
            id: 'buffet-wedding-trays',
            labelAr: 'صواني أفراح ومقبلات برستيج (ميني برغر، كيش، كانابيه)',
            labelFr: 'Plateaux Prestiges & Mariages',
            labelEn: 'Prestigious Finger Foods & Trays',
          },
          {
            id: 'buffet-special-events',
            labelAr: 'بوفيهات مناسبات خاصة ومؤتمرات ولقاءات راقية',
            labelFr: 'Séminaires & Réceptions Privées',
            labelEn: 'Private Events & Conferences',
          },
        ],
      },
    ],
  },
  {
    id: 'beauty-cosmetics',
    labelAr: 'العناية والتجميل (HM Dalozi)',
    labelFr: 'Beauté & Cosmétique',
    labelEn: 'Beauty & Cosmetics',
    icon: '🌿',
    taglineAr: 'زيوت طبيعية نقية، إكسير النضارة، وعطور ملكية ساحرة',
    groups: [
      {
        id: 'beauty-all-categories',
        labelAr: 'أقسام الجمال والعناية',
        labelFr: 'Soins & Parfums',
        labelEn: 'Skincare & Scents',
        season: 'all-season',
        icon: '✨',
        items: [
          {
            id: 'beauty-skincare-elixirs',
            labelAr: 'عناية بالبشرة وإكسير طبيعي (تين شوكي، أرغان، ورد)',
            labelFr: 'Élixirs & Soins Botaniques',
            labelEn: 'Botanical Skincare & Elixirs',
            badge: '100% طبيعي',
          },
          {
            id: 'beauty-luxury-perfumes',
            labelAr: 'عطور فاخرة وبخور ودهن عود ملكي',
            labelFr: 'Parfums Rares & Bakhoor',
            labelEn: 'Luxury Scents & Royal Bakhoor',
          },
          {
            id: 'beauty-gift-sets',
            labelAr: 'مجموعات هدايا عناية متكاملة في علب فاخرة',
            labelFr: 'Coffrets Cadeaux Beauté',
            labelEn: 'Complete Beauty Gift Sets',
          },
        ],
      },
    ],
  },
];

/**
 * Find subcategory item by ID
 */
export function findSubCategoryById(subId: string): SubCategoryItem | undefined {
  for (const cat of CATEGORIES_TAXONOMY) {
    for (const grp of cat.groups) {
      const found = grp.items.find((item) => item.id === subId);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * Find parent category taxonomy by subcategory ID
 */
export function findCategoryBySubId(subId: string): CategoryTaxonomy | undefined {
  for (const cat of CATEGORIES_TAXONOMY) {
    for (const grp of cat.groups) {
      if (grp.items.some((item) => item.id === subId)) {
        return cat;
      }
    }
  }
  return undefined;
}
