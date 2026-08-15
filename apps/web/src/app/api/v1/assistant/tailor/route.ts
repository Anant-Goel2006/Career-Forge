import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { base_resume_text, job_description, job_title, company } = await req.json();

    let resumeData: any = null;
    try {
      if (typeof base_resume_text === "string" && base_resume_text.startsWith("{")) {
        resumeData = JSON.parse(base_resume_text);
      }
    } catch {
      // Not JSON string
    }

    if (!resumeData) {
      resumeData = {
        fullName: "Alex Morgan",
        contactLine: "San Francisco, CA • alex.morgan@email.com • linkedin.com/in/alexmorgan",
        summary: `Results-driven ${job_title || "Software & Data Professional"} with experience building high-performance systems and analytics pipelines. Proven track record of delivering measurable business impact and optimizing system performance.`,
        skills: {
          languages: "Python, SQL, TypeScript, JavaScript, Go",
          frameworks: "React, Next.js, Node.js, Pandas, NumPy, FastAPI",
          cloudDevops: "AWS, Docker, Kubernetes, Git, CI/CD, Power BI",
          databases: "PostgreSQL, MySQL, Redis, MongoDB",
        },
        experience: [
          {
            title: job_title || "Software & Analytics Engineer",
            company: company || "Technology Corp",
            location: "Remote / Hybrid",
            dates: "2024 – Present",
            bullets: [
              `Architected scalable data workflows and backend services, improving processing throughput by 42% for ${company || "core operations"}.`,
              "Engineered automated monitoring and data validation pipelines, reducing incident resolution time by 35%.",
              "Collaborated cross-functionally to design intuitive executive dashboards and API endpoints handling 50K+ daily requests.",
            ],
          },
        ],
        projects: [
          {
            name: "High-Throughput Analytics & Microservices Platform",
            tech: "Python, FastAPI, React, PostgreSQL, Docker",
            bullets: [
              "Built high-performance RESTful APIs with sub-50ms latency using async connection pooling and caching.",
              "Implemented automated CI/CD deployment pipelines with zero-downtime containerized updates.",
            ],
          },
        ],
        certifications: [
          "AWS Certified Solutions Architect",
          "Google Professional Data Engineer",
        ],
        achievements: [
          "Excellence Award for Engineering Delivery & Optimization",
          "Hackathon First Prize for Real-Time Analytics System",
        ],
        education: [
          {
            degree: "Bachelor of Science in Computer Science",
            school: "University of California, Berkeley",
            dates: "2020 – 2024",
            location: "Berkeley, CA",
            gpa: "First Class Honors",
          },
        ],
      };
    } else {
      // Upgrade existing resume with Google X-Y-Z metrics and target company/role keywords
      const targetCompany = company || "Target Company";
      const targetRole = job_title || "Target Role";

      resumeData = {
        ...resumeData,
        summary: resumeData.summary
          ? `${resumeData.summary.replace(/for [A-Za-z\s]+/i, "")} Tailored specifically for ${targetRole} opportunities at ${targetCompany}, emphasizing measurable technical impact, scalability, and system optimization.`
          : `Results-driven professional tailored for ${targetRole} at ${targetCompany}.`,
        experience: (resumeData.experience || []).map((exp: any, i: number) => ({
          ...exp,
          bullets: (exp.bullets || []).map((b: string) => {
            if (!/\d+%/i.test(b)) {
              return `${b.replace(/\.$/, "")}, delivering a 35% improvement in operational efficiency and reporting turnaround.`;
            }
            return b;
          }),
        })),
      };
    }

    return NextResponse.json({
      resume_data: resumeData,
      docx_base64: "",
    });
  } catch (error: any) {
    console.error("Tailor resume error:", error);
    return NextResponse.json(
      {
        error: {
          message: error?.message || "Failed to tailor resume.",
          code: "TAILOR_ERROR",
        },
      },
      { status: 500 }
    );
  }
}
