/* ============================================================
   APPLICATION DATA (Class 10 CBSE / State Curriculum)
   Yahan tum naye subjects/chapters/topics/quiz add ya edit
   kar sakte ho. Baaki kisi file ko chhedne ki zaroorat nahi.
   ============================================================ */
const APP_DATA = [
  {
    id: "science",
    name: "Science",
    studyTime: "68 hrs",
    subSections: [
      { id: "chem", title: "Chemistry" },
      { id: "phy", title: "Physics" },
      { id: "bio", title: "Biology" }
    ],
    chapters: [
      {
        id: "chem-1",
        subSectionId: "chem",
        title: "Chemical Reactions & Equations",
        updated: "Today",
        studyTime: "35 min",
        isCompleted: true,
        topics: [
          {
            id: "chem-1-t1",
            title: "1. Balancing Chemical Equations",
            imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80",
            bulletPoints: [
              "Law of Conservation of Mass: Mass can neither be created nor destroyed in a chemical reaction.",
              "Total mass of elements on reactant side = Total mass of elements on product side.",
              "Step 1: Write skeleton equation, e.g., Fe + H₂O → Fe₃O₄ + H₂.",
              "Step 2: Balance oxygen atoms first, then hydrogen, and lastly iron atoms.",
              "Balanced Equation: 3Fe + 4H₂O → Fe₃O₄ + 4H₂."
            ],
            summary: "Balancing equations ensures the total number of atoms of each element remains identical before and after the chemical change."
          },
          {
            id: "chem-1-t2",
            title: "2. Types of Chemical Reactions",
            imageUrl: "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=600&q=80",
            bulletPoints: [
              "Combination Reaction: Two or more substances combine to form a single product (CaO + H₂O → Ca(OH)₂ + Heat).",
              "Decomposition Reaction: Single reactant breaks down to give simpler products (Thermal, Electrolytic, Photolytic).",
              "Displacement Reaction: More reactive element displaces less reactive element from its solution (Fe + CuSO₄ → FeSO₄ + Cu).",
              "Oxidation & Reduction (Redox): Gain of oxygen is oxidation; loss of oxygen is reduction."
            ],
            summary: "Reactions are categorized by how atoms recombine, release energy, or exchange electrons."
          }
        ],
        quiz: [
          {
            q: "Which law states that mass cannot be created or destroyed during a chemical reaction?",
            options: ["Law of Definite Proportions", "Law of Conservation of Mass", "Avogadro's Law", "Dalton's Atomic Law"],
            correct: 1,
            exp: "The Law of Conservation of Mass requires that total reactant mass equals total product mass."
          },
          {
            q: "What type of reaction is CaO + H₂O → Ca(OH)₂?",
            options: ["Decomposition", "Combination", "Displacement", "Double Displacement"],
            correct: 1,
            exp: "Two compounds combine into a single product, making it a Combination Reaction."
          }
        ]
      },
      {
        id: "phy-1",
        subSectionId: "phy",
        title: "Light: Reflection & Refraction",
        updated: "2 days ago",
        studyTime: "45 min",
        isCompleted: false,
        topics: [
          {
            id: "phy-1-t1",
            title: "1. Laws of Reflection & Spherical Mirrors",
            imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
            bulletPoints: [
              "First Law: Angle of incidence (i) = Angle of reflection (r).",
              "Second Law: Incident ray, reflected ray, and normal at the point of incidence all lie in the same plane.",
              "Concave Mirror: Converging mirror, produces real/inverted (or virtual/erect) images based on object position.",
              "Convex Mirror: Diverging mirror, always produces virtual, erect, and diminished images. Used in rear-view mirrors.",
              "Mirror Formula: 1/f = 1/v + 1/u (f = focal length, v = image distance, u = object distance)."
            ],
            summary: "Spherical mirrors form images according to precise geometric laws and the sign convention."
          },
          {
            id: "phy-1-t2",
            title: "2. Refraction & Snell's Law",
            imageUrl: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=600&q=80",
            bulletPoints: [
              "Refraction occurs due to change in speed of light when traveling from one medium to another.",
              "Snell's Law: sin(i) / sin(r) = constant (Refractive Index n).",
              "Lens Formula: 1/f = 1/v - 1/u.",
              "Power of Lens P = 1 / f (in meters), measured in Dioptres (D)."
            ],
            summary: "Bending of light across media powers optical instruments like cameras, microscopes, and spectacles."
          }
        ],
        quiz: [
          {
            q: "What type of mirror is used in vehicle rear-view mirrors?",
            options: ["Plane Mirror", "Concave Mirror", "Convex Mirror", "Cylindrical Mirror"],
            correct: 2,
            exp: "Convex mirrors give a wider field of view and always produce upright, diminished images."
          },
          {
            q: "The SI unit of power of a lens is:",
            options: ["Meter", "Watt", "Dioptre", "Joule"],
            correct: 2,
            exp: "Power of a lens (P = 1/f) is measured in Dioptres (D)."
          }
        ]
      },
      {
        id: "bio-1",
        subSectionId: "bio",
        title: "Life Processes: Nutrition & Respiration",
        updated: "Yesterday",
        studyTime: "50 min",
        isCompleted: true,
        topics: [
          {
            id: "bio-1-t1",
            title: "1. Autotrophic & Heterotrophic Nutrition",
            imageUrl: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80",
            bulletPoints: [
              "Photosynthesis: 6CO₂ + 12H₂O + Sunlight + Chlorophyll → C₆H₁₂O₆ + 6O₂ + 6H₂O.",
              "Stomata: Microscopic pores on leaf surfaces bounded by guard cells that regulate gas exchange.",
              "Human Digestion: Amylase digests starch in mouth; HCl & Pepsin digest proteins in stomach; Bile & Lipase complete digestion in Small Intestine.",
              "Villi: Finger-like projections in small intestine maximizing surface area for nutrient absorption."
            ],
            summary: "Nutrition supplies organisms with organic molecules essential for growth, tissue repair, and cellular energy."
          }
        ],
        quiz: [
          {
            q: "Which enzyme in human saliva breaks down starch into simple sugars?",
            options: ["Pepsin", "Trypsin", "Salivary Amylase", "Lipase"],
            correct: 2,
            exp: "Salivary Amylase initiates carbohydrate digestion inside the oral cavity."
          }
        ]
      }
    ]
  },
  {
    id: "math",
    name: "Mathematics",
    studyTime: "54 hrs",
    subSections: [],
    chapters: [
      {
        id: "math-1",
        subSectionId: null,
        title: "Real Numbers",
        updated: "3 days ago",
        studyTime: "40 min",
        isCompleted: true,
        topics: [
          {
            id: "math-1-t1",
            title: "1. Fundamental Theorem of Arithmetic",
            imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80",
            bulletPoints: [
              "Statement: Every composite number can be uniquely expressed as a product of prime factors.",
              "Key Property: HCF(a, b) × LCM(a, b) = a × b for any two positive integers.",
              "Irrationality Proof: Proving √2, √3, or √5 are irrational using proof by contradiction.",
              "If prime p divides a², then p divides a."
            ],
            summary: "Prime factorization forms the foundation of number theory, LCM/HCF calculations, and irrationality proofs."
          }
        ],
        quiz: [
          {
            q: "If HCF(a, b) = 4 and LCM(a, b) = 48 with a = 12, what is b?",
            options: ["16", "12", "24", "18"],
            correct: 0,
            exp: "Using HCF × LCM = a × b → 4 × 48 = 12 × b → 192 / 12 = 16."
          }
        ]
      },
      {
        id: "math-2",
        subSectionId: null,
        title: "Quadratic Equations",
        updated: "1 week ago",
        studyTime: "38 min",
        isCompleted: false,
        topics: [
          {
            id: "math-2-t1",
            title: "1. Standard Form & Discriminant",
            imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80",
            bulletPoints: [
              "Standard Form: ax² + bx + c = 0 (a ≠ 0).",
              "Quadratic Formula: x = [-b ± √(b² - 4ac)] / 2a.",
              "Discriminant D = b² - 4ac determines root nature:",
              "• D > 0: Two distinct real roots.",
              "• D = 0: Two equal real roots.",
              "• D < 0: No real roots."
            ],
            summary: "Analyzing the discriminant gives instant clarity on equation solutions."
          }
        ],
        quiz: [
          {
            q: "If D = b² - 4ac = 0, the roots of the quadratic equation are:",
            options: ["Real and distinct", "Real and equal", "Imaginary", "Infinite"],
            correct: 1,
            exp: "A zero discriminant signifies two identical real roots (-b/2a)."
          }
        ]
      }
    ]
  },
  {
    id: "sst",
    name: "Social Studies",
    studyTime: "48 hrs",
    subSections: [
      { id: "hist", title: "History" },
      { id: "geo", title: "Geography" },
      { id: "pol", title: "Civics" }
    ],
    chapters: [
      {
        id: "hist-1",
        subSectionId: "hist",
        title: "The Rise of Nationalism in Europe",
        updated: "4 days ago",
        studyTime: "42 min",
        isCompleted: true,
        topics: [
          {
            id: "hist-1-t1",
            title: "1. French Revolution & Idea of the Nation",
            imageUrl: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80",
            bulletPoints: [
              "1789 French Revolution introduced La Patrie (the fatherland) and Le Citoyen (the citizen).",
              "Napoleonic Code (1804): Abolished feudal system, established equality before law, secured property rights.",
              "Unification of Italy: Led by Cavour, Garibaldi (Red Shirts), and King Victor Emmanuel II.",
              "Unification of Germany: Engineered by Otto von Bismarck through three strategic wars."
            ],
            summary: "Nationalism transformed Europe from multi-ethnic dynastic empires into modern constitutional nation-states."
          }
        ],
        quiz: [
          {
            q: "Who was known as the chief architect of German Unification?",
            options: ["Giuseppe Mazzini", "Otto von Bismarck", "Napoleon Bonaparte", "Victor Emmanuel II"],
            correct: 1,
            exp: "Otto von Bismarck unified Germany using his 'Blood and Iron' strategy."
          }
        ]
      }
    ]
  },
  {
    id: "english",
    name: "English",
    studyTime: "32 hrs",
    subSections: [],
    chapters: [
      {
        id: "eng-1",
        subSectionId: null,
        title: "A Letter to God (First Flight)",
        updated: "5 days ago",
        studyTime: "25 min",
        isCompleted: true,
        topics: [
          {
            id: "eng-1-t1",
            title: "1. Summary & Key Themes",
            imageUrl: "https://images.unsplash.com/photo-1516962215378-7fa2e137ae93?auto=format&fit=crop&w=600&q=80",
            bulletPoints: [
              "Protagonist: Lencho, a hard-working farmer whose cornfield was destroyed by a devastating hailstorm.",
              "Unshakable Faith: Writes a letter directly to God requesting 100 pesos to re-sow his field.",
              "Postmaster's Kindness: Collects 70 pesos from employees to keep Lencho's faith alive.",
              "Irony: Lencho suspects the post office employees of stealing the remaining 30 pesos, calling them a 'bunch of crooks'."
            ],
            summary: "Highlights absolute faith alongside the poignant irony of human misunderstanding."
          }
        ],
        quiz: [
          {
            q: "How many pesos did Lencho ask God for, and how many did he receive?",
            options: ["Asked 100, received 50", "Asked 100, received 70", "Asked 50, received 50", "Asked 70, received 100"],
            correct: 1,
            exp: "Lencho asked for 100 pesos and received 70 pesos collected by the postmaster."
          }
        ]
      }
    ]
  }
];
