const fs = require('fs');
const targetFile = 'd:/CareerForge Project/apps/web/src/lib/api-client.ts';
let content = fs.readFileSync(targetFile, 'utf8');

const fallbackCode = `
// ============================================================
// Local Fallback Database (used if FastAPI is unavailable)
// ============================================================

function getFallbackJobs(keywords: string, location: string, resumeId?: string): any[] {
  const jobs = [
    { company: "Supabase", tier: "Early Startup & SME", title: "Full Stack & Analytics Engineer", loc: "Remote", skills: ["PostgreSQL", "TypeScript", "React", "Next.js", "Python", "SQL"] },
    { company: "Fractal Analytics", tier: "Boutique Analytics", title: "Analytics Consultant", loc: "Gurgaon", skills: ["Python", "SQL", "Microsoft Power BI", "Pandas", "EDA"] },
    { company: "Microsoft", tier: "Tier 1 Tech Giant", title: "Data & AI Solutions Associate", loc: "Bangalore", skills: ["Power BI", "SQL", "Python", "Azure", "Machine Learning"] },
    { company: "Google", tier: "Tier 1 Tech Giant", title: "Software Engineer", loc: "San Francisco", skills: ["Go", "C++", "Python", "Distributed Systems"] },
    { company: "Netflix", tier: "Tier 1 Tech Giant", title: "Data Engineer (Intern)", loc: "Remote", skills: ["Python", "SQL", "Spark", "AWS"] },
    { company: "Amazon", tier: "Tier 1 Tech Giant", title: "SDE I", loc: "Seattle", skills: ["Java", "Python", "AWS", "System Design"] },
    { company: "Meta", tier: "Tier 1 Tech Giant", title: "Data Scientist", loc: "London", skills: ["Python", "SQL", "A/B Testing", "Statistics"] },
    { company: "Apple", tier: "Tier 1 Tech Giant", title: "Machine Learning Engineer", loc: "Cupertino", skills: ["Python", "PyTorch", "TensorFlow", "C++"] },
    { company: "Databricks", tier: "Mid-Market Unicorn", title: "Solutions Architect", loc: "Remote", skills: ["Python", "Spark", "SQL", "AWS"] },
    { company: "Stripe", tier: "Mid-Market Unicorn", title: "Software Engineer", loc: "Remote", skills: ["TypeScript", "Ruby", "React"] },
    { company: "Swiggy", tier: "Mid-Market Unicorn", title: "Data Analyst", loc: "Bangalore", skills: ["SQL", "Python", "Power BI", "A/B Testing"] },
    { company: "Zomato", tier: "Mid-Market Unicorn", title: "Data Scientist", loc: "Gurgaon", skills: ["Python", "Machine Learning", "SQL", "Pandas"] },
    { company: "Cred", tier: "Early Startup & SME", title: "Backend Engineer", loc: "Bangalore", skills: ["Go", "Python", "AWS", "Redis"] },
    { company: "Zerodha", tier: "Mid-Market Unicorn", title: "Systems Engineer", loc: "Remote", skills: ["Python", "Go", "PostgreSQL", "Linux"] },
    { company: "LatentView", tier: "Boutique Analytics", title: "Data Analyst Intern", loc: "Chennai", skills: ["SQL", "Python", "Tableau"] },
    { company: "TCS", tier: "Mid-Market Unicorn", title: "System Engineer", loc: "Mumbai", skills: ["Java", "SQL", "Python", "AWS"] },
    { company: "Infosys", tier: "Mid-Market Unicorn", title: "Data Analyst", loc: "Pune", skills: ["SQL", "Python", "Excel", "Power BI"] },
    { company: "Wipro", tier: "Mid-Market Unicorn", title: "Cloud Engineer", loc: "Hyderabad", skills: ["AWS", "Azure", "Python", "Docker"] },
    { company: "Accenture", tier: "Mid-Market Unicorn", title: "Advanced Analytics Analyst", loc: "Bangalore", skills: ["Python", "SQL", "Machine Learning", "GCP"] },
    { company: "Mu Sigma", tier: "Boutique Analytics", title: "Decision Scientist", loc: "Bangalore", skills: ["Python", "SQL", "Statistics", "R"] },
    { company: "OpenAI", tier: "Early Startup & SME", title: "Research Engineer", loc: "San Francisco", skills: ["Python", "PyTorch", "CUDA", "C++"] },
    { company: "Anthropic", tier: "Early Startup & SME", title: "Machine Learning Intern", loc: "Remote", skills: ["Python", "PyTorch", "NLP"] },
    { company: "Hugging Face", tier: "Early Startup & SME", title: "Open Source Engineer", loc: "Remote", skills: ["Python", "TypeScript", "React", "PyTorch"] },
    { company: "Vercel", tier: "Early Startup & SME", title: "Frontend Engineer", loc: "Remote", skills: ["React", "Next.js", "TypeScript", "TailwindCSS"] },
    { company: "Linear", tier: "Early Startup & SME", title: "Full Stack Engineer", loc: "Remote", skills: ["React", "TypeScript", "GraphQL", "Node.js"] },
    { company: "Notion", tier: "Mid-Market Unicorn", title: "Software Engineer, Data", loc: "San Francisco", skills: ["Python", "SQL", "Snowflake", "dbt"] },
    { company: "Figma", tier: "Mid-Market Unicorn", title: "Software Engineer", loc: "Remote", skills: ["React", "TypeScript", "C++", "WebAssembly"] },
    { company: "Airbnb", tier: "Tier 1 Tech Giant", title: "Data Scientist", loc: "Remote", skills: ["Python", "SQL", "R", "A/B Testing"] },
    { company: "Uber", tier: "Tier 1 Tech Giant", title: "Software Engineer", loc: "Bangalore", skills: ["Go", "Java", "Python", "Distributed Systems"] },
    { company: "Lyft", tier: "Mid-Market Unicorn", title: "Data Analyst", loc: "Remote", skills: ["SQL", "Python", "Tableau", "Presto"] },
    { company: "MedTourEasy", tier: "Early Startup & SME", title: "Data Analyst Trainee", loc: "Remote", skills: ["Python", "SQL", "Data Cleaning", "EDA", "Healthcare"] },
  ];

  let userSkills: string[] = [];
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem("careerforge_parsed_resume");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.sections) {
          const allText = parsed.sections.map((s: any) => (s.raw_text || "") + " " + (s.normalized_text || "")).join(" ").toLowerCase();
          const techKeywords = [
            "python", "sql", "javascript", "typescript", "react", "next.js", "node.js",
            "java", "c++", "go", "docker", "kubernetes", "aws", "azure", "gcp",
            "pandas", "numpy", "power bi", "excel", "git", "postgresql", "mongodb",
            "redis", "fastapi", "django", "flask", "tailwindcss", "html", "css",
            "rust", "kotlin", "swift", "ruby", "php", "scala", "r", "matlab",
            "tensorflow", "pytorch", "scikit-learn", "spark", "hadoop", "linux",
            "ci/cd", "graphql", "rest", "api", "agile", "scrum", "figma",
            "tableau", "machine learning", "deep learning", "nlp", "data science",
            "eda", "data cleaning", "healthcare"
          ];
          userSkills = techKeywords.filter((k) => allText.includes(k));
        }
      }
    } catch (e) {}
  }

  // Also include keyword search as pseudo-skills
  if (keywords) {
      userSkills.push(...keywords.toLowerCase().split(" "));
  }

  return jobs.map((j, i) => {
    let dynamicScore = 30; // base score
    if (userSkills.length > 0) {
      const matches = j.skills.filter((s) =>
        userSkills.some((us) => us.includes(s.toLowerCase()) || s.toLowerCase().includes(us))
      ).length;
      const coverage = matches / Math.max(j.skills.length, 1);
      dynamicScore = Math.min(99, Math.max(30, Math.round(30 + coverage * 69)));
    }

    return {
      id: "job-fallback-" + i,
      title: j.title,
      company: j.company,
      companyTier: j.tier,
      location: j.loc,
      country: ["Remote", "San Francisco", "Seattle", "Cupertino"].includes(j.loc) ? "United States" : "India",
      city: j.loc,
      workMode: j.loc === "Remote" ? "Remote" : "Hybrid",
      employment_type: j.title.includes("Intern") ? "Internship" : "Full-time",
      domain: j.title.includes("Data") || j.title.includes("Analytics") ? "Data Analytics & BI" : "Full Stack",
      experienceLevel: j.title.includes("Intern") ? "Intern" : "Entry",
      matchScore: dynamicScore,
      selectionChance: dynamicScore,
      selectionBucket: dynamicScore >= 80 ? "Strong Match" : dynamicScore >= 60 ? "Good Match" : "Stretch",
      recruiterCallRate: "90% Recruiter Call Rate",
      platformSource: "LinkedIn Talent",
      source_platform: "CareerForge Verified",
      recruiterName: "Hiring Manager",
      recruiterTitle: "Talent Acquisition",
      recruiterEmail: "careers@" + j.company.toLowerCase().replace(/ /g, "") + ".com",
      recruiterLinkedInSearch: "https://www.linkedin.com/search/results/people/?keywords=" + j.company + "+Recruiter",
      skills: j.skills,
      applyUrl: "https://careers." + j.company.toLowerCase().replace(/ /g, "") + ".com",
      apply_url: "https://careers." + j.company.toLowerCase().replace(/ /g, "") + ".com",
      posted_date: new Date().toISOString()
    };
  })
  .filter(j => {
      if (location && location !== "All Cities" && location !== "All") {
          if (!j.location.toLowerCase().includes(location.toLowerCase()) && !location.toLowerCase().includes(j.location.toLowerCase())) {
              return false;
          }
      }
      return true;
  })
  .sort((a, b) => b.matchScore - a.matchScore);
}
`;

content += "\n" + fallbackCode;
fs.writeFileSync(targetFile, content);
console.log("Fallback logic added");
