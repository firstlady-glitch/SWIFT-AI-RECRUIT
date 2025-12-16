export const SKILLS_DATA = [
    // --- Technology & Development ---
    // Programming Languages
    "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "Swift", "Kotlin", "PHP", "Ruby", "C", "Scala", "Perl", "Lua", "Haskell", "Elixir", "Clojure", "Julia", "Dart", "Objective-C", "Assembly", "R", "Matlab", "VBA", "Groovy", "F#", "Erlang", "Cobol", "Fortran", "Pascal", "Ada", "Lisp", "Prolog", "Scheme", "Tcl", "Visual Basic", "Bash", "Shell Scripting", "PowerShell", "SQL", "HTML/CSS", "Sass/SCSS", "Less", "GraphQL",

    // Web Development
    "React.js", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "SvelteKit", "Ember.js", "Backbone.js", "jQuery", "Node.js", "Express.js", "NestJS", "Django", "Flask", "FastAPI", "Ruby on Rails", "Laravel", "Symfony", "Spring Boot", "ASP.NET Core", "Blazor", "HTMX", "Tailwind CSS", "Bootstrap", "Material UI", "Chakra UI", "Radix UI", "Shadcn UI", "Ant Design", "Bulma", "Foundation", "WebAssembly", "PWA (Progressive Web Apps)", "SEO", "Web Accessibility (WCAG)", "WebSockets", "REST API", "gRPC", "TRPC",

    // Mobile Development
    "React Native", "Flutter", "Ionic", "Xamarin", "Maui", "Cordova", "Capacitor", "Android Development", "iOS Development", "SwiftUI", "UIKit", "Jetpack Compose", "Expo", "NativeScript",

    // DevOps & Cloud
    "AWS", "Azure", "Google Cloud Platform (GCP)", "DevOps", "CI/CD", "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "GitLab CI", "CircleCI", "Travis CI", "Puppet", "Chef", "Vagrant", "Nginx", "Apache", "Linux Administration", "Windows Server", "Serverless", "Lambda", "CloudFormation", "OpenStack", "Prometheus", "Grafana", "ELK Stack", "Datadog", "Splunk", "New Relic", "Sentry", "PagerDuty",

    // Database
    "PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite", "MariaDB", "Oracle DB", "SQL Server", "DynamoDB", "Cassandra", "CouchDB", "Firestore", "Supabase", "Firebase", "Neo4j", "Elasticsearch", "Prisma", "Drizzle ORM", "TypeORM", "Sequelize", "Mongoose", "Knex.js",

    // AI & Machine Learning
    "Machine Learning", "Deep Learning", "Artificial Intelligence", "Neural Networks", "NLP (Natural Language Processing)", "Computer Vision", "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Pandas", "NumPy", "OpenCV", "Generative AI", "LLMs (Large Language Models)", "Prompt Engineering", "LangChain", "OpenAI API", "Hugging Face", "Stable Diffusion", "Midjourney", "Whisper", "RAG (Retrieval-Augmented Generation)", "Fine-tuning", "Data Science", "Data Engineering", "Big Data", "Spark", "Hadoop", "Tableau", "Power BI",

    // Blockchain & Web3
    "Blockchain", "Smart Contracts", "Solidity", "Ethereum", "Web3.js", "Ethers.js", "Hardhat", "Truffle", "DeFi", "NFTs", "Cryptography", "Bitcoin", "Hyperledger",

    // Cybersecurity
    "Cybersecurity", "Penetration Testing", "Ethical Hacking", "Network Security", "Application Security", "Information Security", "Security Compliance", "SOC 2", "GDPR", "HIPAA", "OWASP", "Kali Linux", "Wireshark", "Metasploit", "Burp Suite", "Identity Management (IAM)",

    // Game Development
    "Game Development", "Unity", "Unreal Engine", "Godot", "C# (Game Dev)", "C++ (Game Dev)", "Game Design", "3D Modeling", "Blender", "Maya", "3ds Max", "Animation", "VFX", "Level Design",

    // --- Business & Management ---
    "Project Management", "Product Management", "Agile", "Scrum", "Kanban", "Waterfall", "Jira", "Asana", "Trello", "Monday.com", "Notion", "Linear", "Business Analysis", "Strategic Planning", "Business Strategy", "Operations Management", "Risk Management", "Change Management", "Stakeholder Management", "Leadership", "Team Leadership", "Mentoring", "Coaching", "Public Speaking", "Negotiation", "Conflict Resolution", "Decision Making", "Problem Solving", "Critical Thinking", "Emotional Intelligence", "Time Management", "Communication",

    // Marketing & Sales
    "Digital Marketing", "SEO (Search Engine Optimization)", "SEM (Search Engine Marketing)", "Content Marketing", "Social Media Marketing", "Email Marketing", "Affiliate Marketing", "Influencer Marketing", "Brand Management", "Market Research", "Copywriting", "Technical Writing", "Ghostwriting", "SEO Copywriting", "UX Writing", "Sales", "Business Development", "Lead Generation", "CRM", "Salesforce", "HubSpot", "Zendesk", "Customer Success", "Customer Support", "Account Management", "E-commerce", "Shopify", "WooCommerce", "Amazon FBA",

    // Finance & Accounting
    "Finance", "Accounting", "Bookkeeping", "Financial Analysis", "Financial Modeling", "Budgeting", "Forecasting", "Auditing", "Taxation", "QuickBooks", "Xero", "NetSuite", "Excel", "Payroll", "Investment Banking", "Corporate Finance", "Venture Capital", "Private Equity", "Cryptocurrency Trading",

    // Human Resources
    "Human Resources", "Recruitment", "Talent Acquisition", "HRIS", "Employee Relations", "Performance Management", "Compensation & Benefits", "Training & Development", "Onboarding", "Diversity & Inclusion", "Employment Law", "Workday", "BambooHR", "Lever", "Greenhouse",

    // --- Creative & Design ---
    "Graphic Design", "UI Design", "UX Design", "Product Design", "Web Design", "Logo Design", "Branding", "Illustration", "Adobe Creative Suite", "Photoshop", "Illustrator", "InDesign", "Figma", "Sketch", "Adobe XD", "After Effects", "Premiere Pro", "Video Editing", "Motion Graphics", "Photography", "Videography", "Creative Direction", "Art Direction", "Interior Design", "Fashion Design", "Industrial Design", "Architecture",

    // Writing & Translation
    "Writing", "Editing", "Proofreading", "Creative Writing", "Journalism", "Blogging", "Translation", "Localization", "Transcription", "Subtitling", "Research", "Academic Writing", "Grant Writing", "Resume Writing", "Scriptwriting",

    // --- Specialized & Niche ---
    // Engineering
    "Mechanical Engineering", "Electrical Engineering", "Civil Engineering", "Chemical Engineering", "Biomedical Engineering", "Aerospace Engineering", "Robotics", "Embedded Systems", "PLC Programming", "AutoCAD", "SolidWorks", "MATLAB",

    // Science & Research
    "Biology", "Chemistry", "Physics", "Biotechnology", "Genetics", "Pharmaceuticals", "Clinical Research", "Lab Technician", "Environmental Science",

    // Healthcare
    "Nursing", "Medicine", "Pharmacy", "Dentistry", "Physical Therapy", "Psychology", "Counseling", "Healthcare Management", "Medical Coding",

    // Legal
    "Law", "Legal Research", "Contract Law", "Corporate Law", "Intellectual Property", "Paralegal", "Litigation",

    // Education
    "Teaching", "Curriculum Development", "Instructional Design", "E-learning", "Tutoring", "Academic Administration",

    // Miscellaneous
    "Virtual Assistant", "Data Entry", "Event Planning", "Travel Planning", "Logistics", "Supply Chain Management", "Procurement", "Real Estate", "Construction Management", "Hospitality", "Culinary Arts"
].sort();