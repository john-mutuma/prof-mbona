export interface Topic {
  id: string;
  title: string;
  titleKikuyu: string;
  description: string;
  icon: string;
  facts: string[];
}

export const TOPICS: Topic[] = [
  {
    id: "fermentation",
    title: "Why Milk Goes Sour",
    titleKikuyu: "Nĩkĩĩ iria rĩũmagwo?",
    description: "Learn about fermentation and bacteria",
    icon: "🥛",
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
    title: "Why Fire Needs Air",
    titleKikuyu: "Nĩkĩĩ mwaki ũkũndaga rũhuho?",
    description: "Learn about combustion and oxygen",
    icon: "🔥",
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
    title: "Why Plants Are Green",
    titleKikuyu: "Nĩkĩĩ mĩtĩ ĩrĩ ya rangi wa kĩbiriti?",
    description: "Learn about photosynthesis and chlorophyll",
    icon: "🌱",
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
