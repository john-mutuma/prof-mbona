export interface Topic {
  id: string;
  title: Record<string, string>;
  description: Record<string, string>;
  icon: string;
  facts: string[];
}

export const TOPICS: Topic[] = [
  {
    id: "fermentation",
    title: {
      en: "Why Milk Goes Sour",
      kik: "N\u0129k\u0129\u0129 iria r\u0129\u0169magwo?",
      swh: "Kwa nini maziwa huwa machungu?",
      som: "Maxaa caanaha u dhanaan?",
      kln: "Amune chego ne kiyai murar?",
      mas: "Naa kule kule enairowua?",
      luo: "Ang'o momiyo chak doko makech?",
    },
    description: {
      en: "Learn about fermentation and bacteria",
      kik: "\u0128thome \u0169h\u0169r\u0169 fermentation na bacteria",
      swh: "Jifunze kuhusu uchachushaji na bakteria",
      som: "Baro ku saabsan khamiirada iyo bakteeriyada",
      kln: "Ingen komosta fermentation ak bacteria",
      mas: "Aitodolu tenebo fermentation le bacteria",
      luo: "Puonjri kuom fermentation gi bacteria",
    },
    icon: "\uD83E\uDD5B",
    facts: [
      "Milk contains a natural sugar called lactose. Tiny living things called bacteria feed on this sugar.",
      "When bacteria eat lactose, they produce lactic acid. This acid makes the milk taste sour and thick.",
      "Warm temperatures make bacteria grow faster, which is why milk left out in the sun goes sour quickly.",
      "Fermentation is the name for when tiny living things (microorganisms) break down food and change it. Making mursik (fermented milk) uses this same process on purpose.",
      "Keeping milk cold slows down the bacteria, which is why fresh milk lasts longer in a cool place or a pot buried in the ground.",
    ],
  },
  {
    id: "combustion",
    title: {
      en: "Why Fire Needs Air",
      kik: "N\u0129k\u0129\u0129 mwaki \u0169k\u0169ndaga r\u0169huho?",
      swh: "Kwa nini moto unahitaji hewa?",
      som: "Maxaa dabku ugu baahan yahay hawo?",
      kln: "Amune mat ne magei koriik?",
      mas: "Naa enkima enairowua engop?",
      luo: "Ang'o momiyo mach dwaro yamo?",
    },
    description: {
      en: "Learn about combustion and oxygen",
      kik: "\u0128thome \u0169h\u0169r\u0169 gwikia na oxygen",
      swh: "Jifunze kuhusu mwako na oksijeni",
      som: "Baro ku saabsan gubitaanka iyo oksijiinta",
      kln: "Ingen komosta combustion ak oxygen",
      mas: "Aitodolu tenebo enkima le oxygen",
      luo: "Puonjri kuom ng'wecho gi oxygen",
    },
    icon: "\uD83D\uDD25",
    facts: [
      "Fire needs three things to burn: fuel (like wood or charcoal), heat (a spark or match), and air. We call these three things the fire triangle.",
      "The part of air that fire uses is a gas called oxygen. Air is made of many gases, but oxygen is the one fire needs.",
      "When you cover a fire with a sufuria (pot) or blanket, you cut off the air. Without oxygen, the fire goes out.",
      "Blowing gently on embers makes fire grow because you are pushing more oxygen onto the hot fuel.",
      "Combustion is the science word for burning. It means fuel is combining with oxygen and releasing heat and light.",
    ],
  },
  {
    id: "photosynthesis",
    title: {
      en: "Why Plants Are Green",
      kik: "N\u0129k\u0129\u0129 m\u0129t\u0129 \u0129r\u0129 ya rangi wa k\u0129biriti?",
      swh: "Kwa nini mimea ni ya kijani?",
      som: "Maxaa dhirtu cagaaran u tahay?",
      kln: "Amune ketiik ne koi green?",
      mas: "Naa ilkeek enairowua green?",
      luo: "Ang'o momiyo buthe ngiyo marateng'?",
    },
    description: {
      en: "Learn about photosynthesis and chlorophyll",
      kik: "\u0128thome \u0169h\u0169r\u0169 photosynthesis na chlorophyll",
      swh: "Jifunze kuhusu usanisinuru na klorofili",
      som: "Baro ku saabsan photosynthesis iyo chlorophyll",
      kln: "Ingen komosta photosynthesis ak chlorophyll",
      mas: "Aitodolu tenebo photosynthesis le chlorophyll",
      luo: "Puonjri kuom photosynthesis gi chlorophyll",
    },
    icon: "\uD83C\uDF31",
    facts: [
      "Plants have a special green substance in their leaves called chlorophyll. This is what makes leaves look green.",
      "Chlorophyll captures sunlight, like a solar panel. Plants use this sunlight energy to make their own food from water and air.",
      "Plants take in water through their roots and a gas called carbon dioxide from the air. Using sunlight, they turn these into sugar (food) and release oxygen.",
      "Photosynthesis is the name for how plants make food using sunlight. Photo means light and synthesis means putting together.",
      "When leaves turn yellow or brown, it means the chlorophyll is breaking down. The green color disappears and other colors show through.",
    ],
  },
];

export function getTopicById(id: string): Topic | undefined {
  return TOPICS.find((t) => t.id === id);
}

/** Get a topic's title in the specified language, falling back to English */
export function getTopicTitle(topic: Topic, langCode: string): string {
  return topic.title[langCode] || topic.title.en;
}

/** Get a topic's description in the specified language, falling back to English */
export function getTopicDescription(topic: Topic, langCode: string): string {
  return topic.description[langCode] || topic.description.en;
}
