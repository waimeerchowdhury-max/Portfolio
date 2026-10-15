/* ============================================================
   the’apostrophe — content manifest
   ------------------------------------------------------------
   Everything you may want to change lives here: the seven series,
   frame ownership, hero sequence, about copy, and contact details.
   Keep original source filenames in imageSources; the public site
   uses optimized, watermarked WebP renditions from assets/img/watermarked/.
   ============================================================ */
window.SITE_DATA = {

  brand: {
    word: "the’apostrophe",
    tagline: "portraits · events · studio · street",
    owner: "Waimeer",
    ownerCredit: "pictured by Umair"
  },

  /* ---------- untouched upload inventory ----------
     These originals are retained for archive/rebuild; page images are
     generated separately at multiple sizes and always carry a watermark.
  ---------------------------------------------- */
  imageSources: {
    "hasib-1": "1-DSC05380.jpg",
    "hasib-2": "2-DSC05363.jpg",
    "hasib-3": "4-DSC05297.jpg",
    "night-1": "editedIMG_7706.png",
    "night-2": "IMG_7743.jpg",
    "noir-1": "IMG_3907.jpg",
    "noir-2": "IMG_3934.jpg",
    "noir-3": "IMG_3988.jpg",
    "noir-4": "IMG_4093.jpg",
    "noir-5": "IMG_4223.jpg",
    "noir-6": "DB1851A9-0BA5-46C8-9B3C-8A51E21629E2.jpeg",
    "park-1": "IMG_6538.jpg",
    "park-2": "IMG_6684.jpg",
    "park-3": "IMG_6848.jpg",
    "park-4": "IMG_6938.jpg",
    "park-5": "IMG_7508(2).JPG",
    "park-6": "IMG_7876.JPG",
    "spidy-1": "BND SEG 1.png",
    "spidy-2": "BND SEG 5.png",
    "stone-2": "DSC04996.png",
    "stone-4": "DSC05011.png",
    "stone-5": "DSC05017.png",
    "stone-6": "DSC05024.png",
    "stone-7": "DSC05041.png",
    "stone-10": "IMG_6215.png",
    "stone-11": "IMG_6232.png",
    "stone-13": "IMG_6245.png",
    "stone-14": "IMG_6274.png",
    "stone-17": "IMG_6341.png",
    "studio-1": "2-Edited.png",
    "studio-2": "3.png",
    "studio-3": "5-Edited.png",
    "studio-4": "3.2.JPG",
    "studio-5": "Name 4-Edited.png"
  },

  /* ---------- the seven chapters ----------
     34 active photos remain across the same seven series. The seven
     Stone frames deleted upstream are intentionally omitted below.

     person → default subject; credit → per-frame override; pos → hero crop.
  ----------------------------------------- */
  series: [
    {
      id: "studio",
      title: "The Studio Sessions",
      person: "Umair",
      imgs: ["studio-1", "studio-2", "studio-3", "studio-4", "studio-5"],
      pos: "50% 38%"
    },
    {
      id: "spidy",
      title: "Spider-Verse",
      person: "Umair",
      imgs: ["spidy-1", "spidy-2"],
      pos: "50% 42%"
    },
    {
      id: "noir",
      title: "City Noir",
      person: "Umair",
      imgs: ["noir-1", "noir-2", "noir-3", "noir-4", "noir-5", "noir-6"],
      pos: "50% 45%"
    },
    {
      id: "stone",
      title: "Stone & Light",
      person: "Waimeer",
      imgs: ["stone-2", "stone-4", "stone-5", "stone-6", "stone-7", "stone-10", "stone-11", "stone-13", "stone-14", "stone-17"],
      pos: "50% 50%"
    },
    {
      id: "hasib",
      title: "Analog Nights",
      person: "Hasib",
      imgs: ["hasib-1", "hasib-2", "hasib-3"],
      pos: "50% 30%"
    },
    {
      id: "park",
      title: "Dusk Wanderer",
      person: "Ahanaf",
      credit: { "park-4": "Hasib" },
      imgs: ["park-1", "park-2", "park-3", "park-4", "park-5", "park-6"],
      pos: "50% 55%"
    },
    {
      id: "night",
      title: "Streetlight Stories",
      person: "Moskayet",
      imgs: ["night-1", "night-2"],
      pos: "50% 40%"
    }
  ],

  /* ---------- featured work ---------- */
  featuredWorks: [
    { img: "studio-1", series: "studio" },  // 2-Edited.png
    { img: "noir-2", series: "noir" },      // IMG_3934.jpg
    { img: "park-1", series: "park" }       // IMG_6538.jpg
  ],

  /* Five hero photographs; no Stone & Light portrait of Waimeer or Analog Nights frame is used here. */
  heroSlides: [
    { img: "studio-2", series: "studio", pos: "50% 34%" },
    { img: "spidy-1", series: "spidy", pos: "50% 40%" },
    { img: "noir-3", series: "noir", pos: "54% 42%" },
    { img: "park-4", series: "park", pos: "50% 53%" },
    { img: "night-1", series: "night", pos: "50% 38%" }
  ],

  /* ---------- the muses ---------- */
  persons: [
    { name: "Umair", img: "noir-2" },
    { name: "Hasib", img: "hasib-1" },
    { name: "Moskayet", img: "night-1" },
    { name: "Ahanaf", img: "park-6" },
    { name: "Waimeer", img: "stone-13", owner: true }
  ],

  /* ---------- about ---------- */
  about: {
    lead: "",
    portrait: { img: "stone-5", pos: "50% 48%" },
    paragraphs: [
      "Hi, my name is Waimeer Chowdhury an independent photographer based in New York  and this is my working portfolio. I treat photography as my creative outlet and like to take unposed pictures that feel natural and real. I focus on personal portraits, studio shoots and events.",
      "Whether I’m photographing everyday life or exploring a creative portrait, I want each image to feel honest and natural. Additionally setting mood and theme based on clients choice and preference.",
      "Every session starts with a conversation about ideas, frames and emotion. By setting the target it helps me provide a better result where both sides are comfortable. Whether it is me or my partner (Umair) our aim is to create photographs worth returning to years later bringing back the memories of the moment the picture was taken."
    ],
    signoff: "Waimeer Chowdhury",
    stats: [
      { n: "07", label: "series" },
      { n: "34", label: "frames" },
      { n: "05", label: "muses" },
      { n: "’1", label: "mark" }
    ]
  },

  /* ---------- contact ---------- */
  contact: {
    email: "team.theapostrophe@gmail.com",
    instagram: "@theapostrophemedia",
    instagramUrl: "https://www.instagram.com/theapostrophemedia",
    location: "New York, NY"
  }
};
