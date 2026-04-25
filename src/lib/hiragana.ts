export type HiraganaInfo = { romaji: string; group: string; thai: string };

export const hiraganaData: Record<string, HiraganaInfo> = {
  あ: { romaji: "a", group: "a", thai: "อา" },
  い: { romaji: "i", group: "a", thai: "อิ" },
  う: { romaji: "u", group: "a", thai: "อุ" },
  え: { romaji: "e", group: "a", thai: "เอะ" },
  お: { romaji: "o", group: "a", thai: "โอะ" },
  か: { romaji: "ka", group: "k", thai: "คะ" },
  き: { romaji: "ki", group: "k", thai: "คิ" },
  く: { romaji: "ku", group: "k", thai: "คุ" },
  け: { romaji: "ke", group: "k", thai: "เคะ" },
  こ: { romaji: "ko", group: "k", thai: "โคะ" },
  さ: { romaji: "sa", group: "s", thai: "ซะ" },
  し: { romaji: "shi", group: "s", thai: "ชิ" },
  す: { romaji: "su", group: "s", thai: "ซุ" },
  せ: { romaji: "se", group: "s", thai: "เซะ" },
  そ: { romaji: "so", group: "s", thai: "โซะ" },
  た: { romaji: "ta", group: "t", thai: "ทะ" },
  ち: { romaji: "chi", group: "t", thai: "ชิ" },
  つ: { romaji: "tsu", group: "t", thai: "ซึ" },
  て: { romaji: "te", group: "t", thai: "เตะ" },
  と: { romaji: "to", group: "t", thai: "โตะ" },
  な: { romaji: "na", group: "n", thai: "นะ" },
  に: { romaji: "ni", group: "n", thai: "นิ" },
  ぬ: { romaji: "nu", group: "n", thai: "นุ" },
  ね: { romaji: "ne", group: "n", thai: "เนะ" },
  の: { romaji: "no", group: "n", thai: "โนะ" },
  は: { romaji: "ha", group: "h", thai: "ฮะ" },
  ひ: { romaji: "hi", group: "h", thai: "ฮิ" },
  ふ: { romaji: "fu", group: "h", thai: "ฟุ" },
  へ: { romaji: "he", group: "h", thai: "เฮะ" },
  ほ: { romaji: "ho", group: "h", thai: "โฮะ" },
  ま: { romaji: "ma", group: "m", thai: "มะ" },
  み: { romaji: "mi", group: "m", thai: "มิ" },
  む: { romaji: "mu", group: "m", thai: "มุ" },
  め: { romaji: "me", group: "m", thai: "เมะ" },
  も: { romaji: "mo", group: "m", thai: "โมะ" },
  や: { romaji: "ya", group: "y", thai: "ยะ" },
  ゆ: { romaji: "yu", group: "y", thai: "ยุ" },
  よ: { romaji: "yo", group: "y", thai: "โยะ" },
  ら: { romaji: "ra", group: "r", thai: "ระ" },
  り: { romaji: "ri", group: "r", thai: "ริ" },
  る: { romaji: "ru", group: "r", thai: "รุ" },
  れ: { romaji: "re", group: "r", thai: "เระ" },
  ろ: { romaji: "ro", group: "r", thai: "โระ" },
  わ: { romaji: "wa", group: "w", thai: "วะ" },
  を: { romaji: "wo", group: "w", thai: "โวะ" },
  ん: { romaji: "n", group: "n", thai: "น" },
};

export const allCharacters = (): string[] => Object.keys(hiraganaData);

export const getRomaji = (c: string) => hiraganaData[c]?.romaji ?? "";
export const getGroup = (c: string) => hiraganaData[c]?.group ?? "";

export const shuffle = <T,>(arr: T[]): T[] => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const randomChar = () => {
  const chars = allCharacters();
  return chars[Math.floor(Math.random() * chars.length)];
};

export const generateChoices = (correct: string, count: number, asRomaji = true) => {
  const correctVal = asRomaji ? getRomaji(correct) : correct;
  const wrong = new Set<string>();
  const correctGroup = getGroup(correct);
  const chars = allCharacters();
  // half from same group
  const sameGroup = chars.filter((c) => getGroup(c) === correctGroup && c !== correct);
  shuffle(sameGroup)
    .slice(0, Math.floor(count / 2))
    .forEach((c) => wrong.add(asRomaji ? getRomaji(c) : c));
  while (wrong.size < count - 1) {
    const c = chars[Math.floor(Math.random() * chars.length)];
    const v = asRomaji ? getRomaji(c) : c;
    if (v !== correctVal) wrong.add(v);
  }
  return shuffle([correctVal, ...Array.from(wrong)]);
};

export const checkRomaji = (user: string, correct: string): boolean => {
  const u = user.toLowerCase().trim();
  const c = correct.toLowerCase().trim();
  if (u === c) return true;
  const aliases: Record<string, string[]> = {
    wo: ["o"],
    n: ["nn"],
    tsu: ["tu"],
    fu: ["hu"],
    chi: ["ti"],
    shi: ["si"],
    ji: ["zi"],
  };
  return aliases[c]?.includes(u) ?? false;
};

export const playSound = (text: string) => {
  if (typeof window === "undefined") return;
  if ("speechSynthesis" in window) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    u.rate = 0.8;
    window.speechSynthesis.speak(u);
  }
};
