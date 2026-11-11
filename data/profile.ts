export interface SocialLink {
  label: string;
  url: string;
  icon: "github" | "linkedin" | "email" | "twitter" | "scholar" | "globe" | "leetcode";
}

export interface EducationEntry {
  degree: string;
  institution: string;
  location: string;
  start: string;
  end: string;
  score?: string;
  coursework?: string[];
  achievements?: string[];
  thesis?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  problem: string;
  contribution: string;
  tech: string[];
  methods?: string[];
  metrics?: string[];
  category: string;
  featured?: boolean;
  githubUrl?: string;
  demoUrl?: string;
  paperUrl?: string;
}

export interface ResearchInterest {
  title: string;
  description: string;
}

export interface PipelineStage {
  label: string;
  description?: string;
}

export interface FlagshipResearch {
  title: string;
  tagline: string;
  status: string;
  problem: string;
  motivation: string;
  architecture: string;
  dataset: string;
  methodology: string;
  experimentalSetup: string;
  results: string;
  contributions: string[];
  tech: string[];
  futureWork: string;
  pipeline: PipelineStage[];
  githubUrl?: string;
  paperUrl?: string;
}

export interface ExperienceEntry {
  role: string;
  organization: string;
  location?: string;
  type: string;
  start: string;
  end?: string;
  points: string[];
}

export interface Publication {
  title: string;
  authors: string;
  venue: string;
  year: string;
  description: string;
  type: "Conference Paper" | "Journal Paper" | "Preprint" | "Poster" | "Technical Report";
  paperUrl?: string;
  doi?: string;
  codeUrl?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface Achievement {
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface GithubRepo {
  name: string;
  description: string;
  url: string;
  language?: string;
  stars?: number;
}

// ── Profile ────────────────────────────────────────────────────────────

export const profile = {
  name: "Chandra Sekhar Reddy",
  title: "M.Tech Artificial Intelligence",
  role: "AI/ML Engineer & Researcher",
  location: "Bhopal, India",
  email: "chandureddyv143@gmail.com",
  heroHeadline: ["Building intelligent systems", "at the edge of research and code."],
  heroSubline:
    "M.Tech Artificial Intelligence student at IIIT Bhopal with a strong foundation in Machine Learning, Data Analytics, Deep Learning, and Full-Stack Web Development. I enjoy turning raw data into decisions to solve real-world problems and looking for research and industry opportunities in AI/ML and software development.",
  status: "Open to research internships & AI/ML roles",
  focusAreas: ["Machine Learning", "Deep Learning", "Graph Neural Networks", "Federated Learning"],
  about: {
    summary:
      "I work at the boundary between research and engineering: reading papers closely enough to reimplement their ablations, and writing production-grade code closely enough that the two don't feel like separate skills. Most of my recent work sits in graph representation learning — modeling relational structure that plain sequence or grid architectures miss — applied to problems where the data is messy, imbalanced, or only partially labeled.",
    approach:
      "I default to building a working baseline before reaching for complexity, instrument everything I train, and treat a negative result as data rather than a wasted week. Outside of modeling, I care about the parts of ML that don't show up in a paper's headline number: data pipelines, reproducibility, and whether a system still works when the input distribution shifts.",
    lookingFor:
      "Research internships, applied AI/ML roles, and collaborations in graph learning, healthcare AI, or multimodal systems where I can keep working on problems like these with more time and better compute.",
    highlights: [
      { label: "Education", value: "M.Tech, Artificial Intelligence" },
      { label: "Focus", value: "Graph Learning & Applied Deep Learning" },
      { label: "Interests", value: "GNNs · AI · ML · Deep Learning" },
      { label: "Currently", value: "Research project - AI in Healthcare" },
    ],
  },
  philosophy:
    "A model is only as trustworthy as the pipeline that feeds it and the evaluation that questions it — I try to spend as much care on both as on the architecture itself.",
};

export const socialLinks: SocialLink[] = [
  { label: "GitHub", url: "https://github.com/Chandu593", icon: "github" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/vasala-chandra-sekhar-reddy-b69289263", icon: "linkedin" },
  { label: "LeetCode", url: "https://leetcode.com/u/ChandraSekhar21/", icon: "leetcode" },
  { label: "Email", url: "mailto:chandureddyv143@gmail.com", icon: "email" },
  // Optional
  // { label: "Google Scholar", url: "[ADD YOUR SCHOLAR URL]", icon: "scholar" },
  // { label: "X / Twitter", url: "[ADD YOUR TWITTER URL]", icon: "twitter" },
];

export const resume = {
  fileName: "Chandra_Sekhar_reddy_Resume.pdf",
  url: "/resume.pdf",
};

// ── Contact form delivery ────────────────────────────────────────────────
export const emailjs = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "[ADD YOUR EMAILJS SERVICE ID — optional]",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "[ADD YOUR EMAILJS TEMPLATE ID — optional]",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "[ADD YOUR EMAILJS PUBLIC KEY — optional]",
};

// ── Education ──────────────────────────────────────────────────────────

export const education: EducationEntry[] = [
  {
    degree: "M.Tech, Artificial Intelligence",
    institution: "Indian Institute of Information Technology, Bhopal",
    location: "Madhya Pradesh, India",
    start: "2025",
    end: "Present",
    score: "8.46 CGPA",
    coursework: [
      "Deep Learning",
      "Machine Learning",
      "Graph Representation Learning",
      "Natural Language Processing",
      "Artificial Intelligence",
    ],
    // achievements: ["[ADD ACADEMIC ACHIEVEMENT — optional]"],
    thesis: "AI in Healthcare: In-hospital Sepsis and Mortality Prediction",
  },
  {
    degree: "B.Tech, Information Technology",
    institution: "Andhra University, Visakhapatnam",
    location: "Andhra Pradesh, India",
    start: "2021",
    end: "2025",
    score: "8.66 CGPA",
    coursework: [
      "Cloud Computing",
      "Machine Learning",
      "DBMS",
      "Data Warehousing and Mining",
      "Theory of Computation",
    ],
  },
  {
    degree: "Higher Secondary Education",
    institution: "Sri Chaitanya Institutions, Vizianagaram",
    location: "Andhra Pradesh, India",
    start: "2019",
    end: "2021",
    score: "96.30%",
    coursework: [
      "Maths",
      "Physics",
      "Chemistry"
    ]
  },
  {
    degree: "Matriculation",
    institution: "Dr. Besant EM School, Vizianagaram",
    location: "Andhra Pradesh, India",
    start: "2009",
    end: "2019",
    score: "10.00 CGPA"
  },
];

// ── Skills ─────────────────────────────────────────────────────────────

export const skillGroups: SkillGroup[] = [
  {
    category: "Programming",
    items: ["Python", "SQL", "C", "JavaScript"],
  },
  {
    category: "AI / ML",
    items: ["Classification", "Regression", "Clustering", "Scikit-learn", "ANN", "CNN", "RNN", "LSTM", "GRU", "Transformers", "PyTorch", "OPTUNA", "FAISS"],
  },
  {
    category: "Graph & Advanced ML",
    items: ["PyTorch Geometric", "Graph Neural Networks", "Knowledge Graphs", "Federated Learning"],
  },
  {
    category: "Data",
    items: ["Pandas", "NumPy", "Feature Engineering", "Matplotlib", "Seaborn", "ydata-profiling"],
  },
  {
    category: "Tools & Infrastructure",
    items: ["Git", "GitHub", "Docker", "GitHub Actions CI/CD", "Google Colab", "VS Code", "Postman"],
  },
  {
    category: "Web Development",
    items: ["React.js", "Node.js", "Express.js", "MongoDB", "MySQL", "JWT", "RESTful APIs", "Material UI"]
  }
];

// ── Projects ───────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    id: "project-one",
    title: "Hybrid Movie Recommender System",
    description: "Production-grade hybrid movie recommender combining content, collaborative, sequential, sentiment, and deep-learning signals for personalized Top-K recommendations.",
    problem: "Addresses limitations of single-model recommenders by combining multiple user and movie signals to improve personalized ranking and recommendation quality.",
    contribution: "Built a two-stage retrieve-then-rank pipeline using SBERT, FAISS, NCF-BPR, Transformer-based sequential modeling, Deep Fusion, and LambdaRank.",
    tech: [
      "Python",
      "PyTorch",
      "TensorFlow",
      "FAISS",
      "LightGBM",
      "Transformers",
      "Streamlit"
    ],
    methods: [
      "SBERT + FAISS",
      "NCF + BPR",
      "Transformer",
      "Deep Fusion",
      "DistilBERT Sentiment",
      "LambdaRank"
    ],
    metrics: [
      "HR@10: 0.8380",
      "NDCG@10: 0.6136"
    ],
    category: "ML / Deep Learning",
    featured: true,
    githubUrl: "https://github.com/Chandu593/Hybrid_Recommender_System",
    demoUrl: "https://hybridrecommendersystem-hnf7wmxye8rvpmffmy832a.streamlit.app/",
    paperUrl: ""
  }
  ,
  {
    id: "project-two",
    title: "Hire Mitra",
    description: "A full-stack hiring pipeline that helps recruiters manage job openings, candidates, interviews, feedback, and stalled applications in one shared system.",
    problem: "Replaces fragmented spreadsheets and inbox-based hiring workflows with a centralized, role-based recruitment pipeline.",
    contribution: "Built a complete hiring workflow with recruiter/interviewer RBAC, stage-based candidate management, bulk actions, immutable history, server-side search, CSV export, and stalled-application alerts.",
    tech: [
      "React",
      "Vite",
      "Node.js",
      "Express",
      "MongoDB",
      "Mongoose",
      "JWT",
      "Vercel",
      "Render"
    ],
    methods: [
      "Role-Based Access Control",
      "REST API",
      "JWT Authentication",
      "Server-Side Search & Pagination",
      "Pipeline State Management",
      "Immutable Activity Timeline",
      "Stalled-Application Detection"
    ],
    // metrics: [
    //   "10/10 core requirements implemented",
    //   "Built and deployed in 11–12 hours"
    // ],
    category: "Full-Stack Development",
    featured: true,
    githubUrl: "https://github.com/Chandu593/Hire_Mitra",
    demoUrl: "https://hire-mitra-liart.vercel.app",
    paperUrl: ""
  }
  ,
  {
    id: "project-three",
    title: "Customer Churn Analytics",
    description: "An end-to-end telecom churn analytics pipeline transforming subscriber data into actionable retention insights and measurable business ROI.",
    problem: "Helps identify customers at high risk of churn and understand the behavioral factors driving customer attrition.",
    contribution: "Built a complete descriptive, predictive, and prescriptive analytics pipeline with XGBoost modeling, SHAP explainability, retention strategies, and ROI simulation.",
    tech: [
      "Python",
      "Pandas",
      "Scikit-learn",
      "XGBoost",
      "LightGBM",
      "SHAP",
      "Matplotlib"
    ],
    methods: [
      "Exploratory Data Analysis",
      "Feature Engineering",
      "SMOTE",
      "Multi-Model Benchmarking",
      "XGBoost + Hyperparameter Tuning",
      "SHAP Explainability",
      "ROI Simulation"
    ],
    metrics: [
    "Recall-focused churn prediction",
    "96.8% accuracy and 78.2% recall",
    "Positive ROI simulation"
    ],
    category: "Data Analytics & Machine Learning",
    featured: false,
    githubUrl: "https://github.com/Chandu593/Churn_data_analytics",
    demoUrl: "",
    paperUrl: ""
  }
  ,
  {
    id: "project-four",
    title: "BookMonkey",
    description: "A full-stack online marketplace for buying, selling, and exchanging books with a responsive and user-friendly interface.",
    problem: "Provides a unified platform for discovering books, managing purchases, selling personal books, and exchanging books with other users.",
    contribution: "Built a MERN-based platform with authentication, search and filtering, cart, wishlist, orders, book listings, exchange workflows, and delivery tracking.",
    tech: [
      "React.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Bootstrap",
      "MUI"
    ],
    methods: [
      "MERN Stack",
      "User Authentication",
      "Search & Filtering",
      "Shopping Cart",
      "Wishlist Management",
      "Order Management",
      "Book Exchange System"
    ],
    // metrics: [
    // "Full-stack MERN application",
    // "Responsive web interface"
    // ],
    category: "Full-Stack Development",
    featured: false,
    githubUrl: "https://github.com/Chandu593/BookMonkey",
    demoUrl: "",
    paperUrl: ""
  }
  ,
  {
  id: "project-five",
  title: "Study Assistant",
  description: "An AI-powered study platform that transforms notes and topics into interactive flashcards, quizzes, and personalized practice drills to improve learning and retention.",
  problem: "Helps students study more effectively by automatically generating learning materials, identifying knowledge gaps through quizzes, and providing targeted practice on weak topics.",
  contribution: "Developed an AI-powered study assistant using React.js and Groq API that generates flashcards and quizzes from user-provided notes or topics. Implemented automatic wrong-answer retesting, personalized weak-topic drills, review checklists, and browser-based session persistence with the ability to resume or delete previous sessions.",
  tech: [
    "React.js",
    "JavaScript",
    "Groq API",
    "Node.js",
    "Vercel",
    "HTML5",
    "CSS3",
    "Local Storage"
  ],
  methods: [
    "Generative AI Integration",
    "Prompt Engineering",
    "AI-Powered Flashcard Generation",
    "Automated Quiz Generation",
    "Adaptive Learning",
    "Weak Topic Detection",
    "Automated Answer Retesting",
    "Personalized Practice Drills",
    "JSON Schema Validation",
    "React State Management",
    "Session Persistence",
    "Serverless API Deployment"
  ],
  category: "AI/ML & Full-Stack Development",
  featured: false,
  githubUrl: "https://github.com/Chandu593/study_assistant",
  demoUrl: "https://study-assistant-three-wheat.vercel.app/",
  paperUrl: ""
}
,

];

// ── Research interests ────────────────────────────────────────────────

export const researchInterests: ResearchInterest[] = [
  { title: "Graph Neural Networks", description: "Learning over relational and structured data." },
  { title: "Knowledge Graphs", description: "Entity/relation modeling and reasoning." },
  { title: "Recommendation Systems", description: "Personalized item recommendations." },
  { title: "Federated Learning", description: "Decentralized, privacy-preserving training." },
  { title: "Explainable AI", description: "Interpretability of learned representations." },
];

// ── Flagship research ─────────────────────────────────────────────────
export const flagshipResearch: FlagshipResearch = {
  title: "Fed-THOR: AI for In-Hospital Sepsis and Mortality Prediction",
  tagline: "A privacy-preserving federated temporal hypergraph framework for early sepsis and mortality prediction.",
  status: "In progress",
  problem: "ICU prediction is challenging due to heterogeneous, sparse, time-dependent data distributed across hospitals. Conventional models often miss temporal deterioration and complex patient relationships, while centralized learning raises privacy and generalization concerns.",
  motivation: "Fed-THOR combines temporal modeling, relational reasoning, and federated learning to capture evolving clinical deterioration and high-order patient relationships while keeping raw patient data local to each hospital.",
  architecture: "GRU-based temporal encoding → Temporal Knowledge Graph with RGCN → Dynamic Hypergraph with DHGNN → Multi-Head Cross-Attention Fusion → Federated Prototype Alignment → Multi-Task Sepsis and Mortality Prediction.",
  dataset: "eICU Collaborative Research Database — ~200,859 ICU patients from 208 hospitals, with 199 eligible hospitals used as federated graph/hypergraph clients.",
  methodology: "Multi-source ICU data are cleaned, aligned into 4-hour windows, and encoded with a GRU. Temporal clinical relationships are modeled using an RGCN-based knowledge graph, while dynamic hypergraphs capture evolving high-order patient relationships. Cross-attention fuses both representations, followed by hospital-level federated learning and prototype alignment. The final model jointly predicts Sepsis-3 onset and in-hospital mortality.",
  experimentalSetup: "Hospital-level federated experiments compare local, centralized, graph, and hypergraph-based approaches. Data use a 70/15/15 train-validation-test split with seed 42. Evaluation includes AUROC, AUPRC, accuracy, precision, recall, and F1-score, with emphasis on class imbalance and cross-hospital generalization.",
  results: "Final experimental results are not yet available. The project is currently under development.",
  contributions: [
    "Temporal patient representation learning using GRU-based trajectories and a temporal clinical knowledge graph.",
    "Dynamic hypergraph learning for modeling evolving high-order relationships among ICU patients.",
    "Privacy-preserving multi-task federated learning with prototype alignment for cross-hospital generalization.",
  ],
  tech: [
    "PyTorch",
    "PyTorch Geometric",
    "Python",
    "GRU",
    "RGCN",
    "DHGNN",
    "FedAvg",
    "Federated Prototype Learning",
    "Multi-Task Learning",
    "SHAP"
  ],
  futureWork: "Complete full-scale federated training, conduct systematic ablations and baseline comparisons, evaluate robustness to hospital-level non-IID data, measure communication and computational costs, and strengthen temporal and hyperedge-level explainability.",
  pipeline: [
    {
      label: "Data",
      description: "Multi-source eICU ICU records"
    },
    {
      label: "Preprocessing",
      description: "Cleaning, alignment and 4-hour windows"
    },
    {
      label: "Temporal Modeling",
      description: "GRU-based patient trajectory encoding"
    },
    {
      label: "Knowledge Graph",
      description: "Temporal clinical graph with RGCN"
    },
    {
      label: "Dynamic Hypergraph",
      description: "Evolving high-order patient relationships"
    },
    {
      label: "Graph Learning",
      description: "DHGNN relational representation learning"
    },
    {
      label: "Fusion",
      description: "Cross-attention representation fusion"
    },
    {
      label: "Federated Learning",
      description: "Hospital-level FedAvg with prototype alignment"
    },
    {
      label: "Prediction",
      description: "Joint Sepsis and Mortality prediction"
    },
    {
      label: "Explainability",
      description: "SHAP and attention-based interpretation"
    },
  ],
  githubUrl: "[ADD GITHUB LINK — optional]",
  paperUrl: "[ADD PAPER LINK — optional]",
};

// ── Experience ─────────────────────────────────────────────────────────

export const experience: ExperienceEntry[] = [
  {
    role: "Full Stack Developer",
    organization: "I&T Labs",
    location: "Visakhapatnam",
    type: "Internship",
    start: "Jul 2023",
    end: "Nov 2023",
    points: [
      "Built Study Assistant, a full-stack tool that generates flashcards and quizzes from notes using the Groq API, with adaptive retesting and weak-topic drills.",
      "Implemented a strict JSON schema + validator layer for reliable LLM output and deployed it as a serverless app on Vercel.",
    ],
  },
  {
    role: "Frontend Developer",
    organization: "Oasis Infobyte",
    location: "Remote",
    type: "Internship",
    start: "Aug 2023",
    end: "Sep 2023",
    points: [
      "Designed and developed a dynamic college website UI using React.js and Bootstrap with strong focus on mobile responsiveness and clean UI architecture.",
      "Developed 4+ beginner-level web applications, including a To-do List, Gym Landing Page, and Temperature Converter.",
      "Implemented modern UI practices to improve usability, responsiveness, and overall user experience.",
    ],
  },
];

// ── Publications ───────────────────────────────────────────────────────
export const publications: Publication[] = [
  // {
  //   title: "[ADD PAPER TITLE]",
  //   authors: "[ADD AUTHORS]",
  //   venue: "[ADD VENUE]",
  //   year: "[ADD YEAR]",
  //   description: "[ADD A SHORT DESCRIPTION]",
  //   type: "Conference Paper",
  //   paperUrl: "[ADD LINK]",
  //   codeUrl: "[ADD CODE LINK — optional]",
  // },
];

// ── Certifications ─────────────────────────────────────────────────────

export const certifications: Certification[] = [
  // { name: "[ADD CERTIFICATION]", issuer: "[ADD ISSUER]", date: "[ADD DATE]", credentialUrl: "[ADD LINK]" },
];

// ── Achievements ───────────────────────────────────────────────────────

export const achievements: Achievement[] = [
  // { title: "[ADD ACHIEVEMENT]", issuer: "[ADD ISSUER / EVENT]", date: "[ADD DATE]", description: "[ADD CONTEXT]" },
];

// ── GitHub ─────────────────────────────────────────────────────────────

export const githubProfileUrl = "https://github.com/Chandu593";

export const githubRepos: GithubRepo[] = [
  {
    name: "Hybrid Movie Recommender System",
    description: "Production-grade hybrid movie recommender combining content, collaborative, sequential, sentiment, and deep-learning signals for personalized Top-K recommendations.",
    url: "https://github.com/Chandu593/hybrid-movie-recommender",
    language: "ML/Deep Learning",
  },
  {
    name: "Hire Mitra",
    description: "A full-stack hiring pipeline that helps recruiters manage job openings, candidates, interviews, feedback, and stalled applications in one shared system.",
    url: "https://github.com/Chandu593/hire-mitra",
    language: "Full-Stack Development",
  },
];

// ── Navigation ─────────────────────────────────────────────────────────

export const navLinks = [
  { id: "about", label: "About" },
  { id: "education", label: "Education" },
  { id: "skills", label: "Skills" },
  { id: "projects", label: "Projects" },
  { id: "research", label: "Research" },
  { id: "experience", label: "Experience" },
  { id: "contact", label: "Contact" },
];

// ── SEO ────────────────────────────────────────────────────────────────

export const seo = {
  title: `${profile.name} — AI/ML Engineer & Researcher`,
  description:
    "Portfolio of an M.Tech Artificial Intelligence student specializing in graph learning and applied deep learning — projects, research, and publications.",
  siteUrl: "https://chandra-research-3d.chandureddyv143.chatgpt.site",
};
