// A2 MasterClass course data, copied from beta (/a2/api/load_sections and /a2/practice_tests), 06.10.2026.
window.A2_COURSE = {
  sections: [
    { id: "introduction", name: "Introduction", icon: "sec-introduction.svg", lessons: [
      "Introduction", "Orientation", "Design Your Study Plan", "Diagnostic Test"] },
    { id: "biology", name: "Biology", icon: "sec-biology.svg", lessons: [
      "Introduction to Biology", "Ecology", "Scientific Method and the Microscope", "The Cell", "Cellular organelles",
      "Passive Transport", "Active Transport", "Energy", "DNA", "Cellular Reproduction I: Mitosis",
      "Cellular Reproduction II: Meiosis", "Genetics", "Nutrition"] },
    { id: "chemistry", name: "Chemistry", icon: "sec-chemistry.svg", lessons: [
      "Atoms", "The Periodic", "Matter", "Chemical Bonding", "Chemical Reactions", "Acid Base Reactions",
      "Molar Relationships", "Reaction Rates and Equilibrium", "Organic Chemistry I", "Organic Chemistry II"] },
    { id: "anatomy", name: "Anatomy and Physiology", icon: "sec-anatomy.svg", lessons: [
      "Introduction to A&P (General Terminology)", "Histology and Skin", "Musculoskeletal I: Bones and Joints",
      "Musculoskeletal II: Muscle", "Nervous System", "Senses (Vision and Hearing)", "Endocrine System (Hormones)",
      "Male Reproductive System", "Female Reproductive System", "Urinary System", "Cardiovascular System I: The Heart",
      "Cardiovascular System II: Vasculature and Blood", "Respiratory System", "Gastrointestinal Tract", "Immune System"] },
    { id: "math", name: "Math", icon: "sec-math.svg", lessons: [
      "Introduction", "Basic Computations I: Addition and Subtraction", "Basic Computations II: Multiplication and Division",
      "Computations with Decimals", "Basic Computations Recap", "Positives and Negatives, Rounding, Power of 10",
      "Fractions I: Multiplication and Division", "Fractions II: Addition and Subtraction",
      "Conversions: Fractions -> Decimals; Percentages", "Ratios and Proportions", "Conversions", "Final words of advice"] },
    { id: "reading", name: "Reading Comprehension", icon: "sec-reading.svg", lessons: [
      "Active Reading", "Critical Reading", "Intro to Topic, Scope, Main Idea", "How to Identify the Main Idea",
      "Summary-type Questions & Inference Questions", "Keywords, Tone, Purpose", "Facts VS Opinions", "Vocabulary",
      "Genre", "All Except Questions", "Final tips and tricks"] },
    { id: "vocabulary", name: "Vocabulary", icon: "sec-vocabulary.svg", lessons: [
      "Intro and Strategies for Expanding Vocabulary", "Synonyms I", "Synonyms II: Practice", "Synonyms III: Context",
      "Antonyms", "Analogies", "Spelling I: Rules", "Spelling II: Practice"] },
    { id: "grammar", name: "Grammar", icon: "sec-grammar.svg", lessons: [
      "Subject-Verb Agreement I", "Subject-Verb Agreement II: Practice", "Direct Object and Indirect Object I",
      "Direct Object and Indirect Object II: Practice", "Adverbs and Adjectives I", "Adverbs and Adjectives II",
      "Adverb and Adjective Placement I", "Adverb and adjective placement II", "Pronouns I", "Pronouns II: Practice",
      "Relative Pronouns", "Ownership", "Prepositions I: Location", "Prepositions II: Time", "Passive Voice",
      "Present Tense I", "Present Tense II: Practice", "Past Tense I", "Past Tense II: Practice", "Present / Past Perfect I",
      "Present / Past Perfect II: Practice", "Future Tense I", "Future Tense II: Practice", "Unreal Conditional",
      "Modal Verbs", "Punctuation I", "Punctuation II", "Final Quiz"] },
    { id: "critical", name: "Critical Thinking", icon: "sec-critical.svg", lessons: [
      "Intro to Critical Thinking", "Prioritization", "Professional Behavior", "The CT Exam"] }
  ],
  // Practice tests: two per subject (questions per test), plus the diagnostic. 660 questions in total.
  practiceTests: [
    { name: "A2 Vocabulary and General Knowledge Practice Test", q: 55, subject: "vocabulary" },
    { name: "A2 Vocabulary and General Knowledge Practice Test 2", q: 55, subject: "vocabulary" },
    { name: "A2 Math Practice Test", q: 55, subject: "math" },
    { name: "A2 Math Practice Test 2", q: 55, subject: "math" },
    { name: "A2 Anatomy and Physiology Practice Test", q: 30, subject: "anatomy" },
    { name: "A2 Anatomy and Physiology Practice Test 2", q: 30, subject: "anatomy" },
    { name: "A2 Grammar Practice Test", q: 55, subject: "grammar" },
    { name: "A2 Grammar Practice Test 2", q: 55, subject: "grammar" },
    { name: "A2 Biology Practice Test", q: 30, subject: "biology" },
    { name: "A2 Biology Practice Test 2", q: 30, subject: "biology" },
    { name: "A2 Chemistry Practice Test", q: 30, subject: "chemistry" },
    { name: "A2 Chemistry Practice Test 2", q: 30, subject: "chemistry" },
    { name: "A2 Reading Comprehension Practice Test", q: 55, subject: "reading" },
    { name: "A2 Reading Comprehension Practice Test 2", q: 55, subject: "reading" },
    { name: "DIAGNOSTIC A2 TEST", q: 40, subject: null }
  ],
  plan: [
    { k: "intro", lead: "Start with the", link: "intro section", tail: "– it'll show you how everything works around here" },
    { k: "diagnostic", lead: "Take a quick", link: "diagnostic quiz", tail: "– to see where you're strong and where you can grow" },
    { k: "lessons", lead: "Learn a little each day", link: "", tail: "– go lesson by lesson, take the short quizzes, and just keep moving (no pressure, no burnout — just steady progress)" },
    { k: "final", lead: "Finish with a", link: "final test", tail: "– score over 90%, and you're more than ready for the real exam!" }
  ]
};
