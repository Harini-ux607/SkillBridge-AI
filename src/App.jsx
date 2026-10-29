
import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { jsPDF } from "jspdf";
import "./App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const careerSkills = {
  "Frontend Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Git",
    "TypeScript",
  ],
  "Full Stack Developer": [
    "HTML",
    "CSS",
    "JavaScript",
    "React",
    "Node.js",
    "SQL",
    "REST API",
    "Git",
  ],
  "AI Application Developer": [
    "Python",
    "JavaScript",
    "React",
    "SQL",
    "REST API",
    "Git",
  ],
};

const skillTasks = {
  Git: [
    "Learn Git basics and repositories",
    "Practice commit, push, and pull",
    "Upload a project to GitHub",
  ],
  TypeScript: [
    "Learn basic types and variables",
    "Practice interfaces and typed functions",
    "Use TypeScript in a small component",
  ],
  "REST API": [
    "Understand API requests and responses",
    "Practice fetch() in JavaScript",
    "Display API data in a React component",
  ],
  React: [
    "Revise components and props",
    "Practice useState and events",
    "Build a small React project",
  ],
  Python: [
    "Revise Python variables and functions",
    "Practice lists and dictionaries",
    "Build a small Python program",
  ],
  SQL: [
    "Practice SELECT and WHERE",
    "Learn JOIN and GROUP BY",
    "Solve SQL practice questions",
  ],
  "Node.js": [
    "Understand Node.js basics",
    "Learn npm and modules",
    "Build a simple server",
  ],
  HTML: [
    "Practice semantic HTML",
    "Build forms and tables",
    "Create an accessible webpage",
  ],
  CSS: [
    "Practice Flexbox and Grid",
    "Learn responsive design",
    "Style a complete webpage",
  ],
  JavaScript: [
    "Revise functions and arrays",
    "Practice objects and array methods",
    "Build an interactive feature",
  ],
};

const allSkills = [
  "HTML",
  "CSS",
  "JavaScript",
  "React",
  "Python",
  "SQL",
  "Node.js",
  "Git",
  "REST API",
  "TypeScript",
];

function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/node\.js/g, "nodejs")
    .replace(/react\.js/g, "react")
    .replace(/typescript/g, "typescript")
    .replace(/restful apis?/g, "rest api")
    .replace(/rest apis?/g, "rest api")
    .replace(/javascript/g, "javascript")
    .replace(/[^a-z0-9+#.]+/g, " ")
    .trim();
}

function containsSkill(text, skill) {
  const normalizedText = normalizeText(text);
  const normalizedSkill = normalizeText(skill);

  const aliases = {
    "REST API": ["rest api", "restful api", "restful apis"],
    "Node.js": ["nodejs", "node js", "node.js"],
    JavaScript: ["javascript", "js"],
    TypeScript: ["typescript", "ts"],
    HTML: ["html", "html5"],
    CSS: ["css", "css3"],
    SQL: ["sql", "mysql", "postgresql"],
    React: ["react", "reactjs", "react js"],
    Git: ["git", "github"],
  };

  const terms = aliases[skill] || [normalizedSkill];

  return terms.some((term) => {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(^|\\s)${escaped}(?=\\s|$)`, "i");
    return pattern.test(normalizedText);
  });
}

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  }).promise;

  let extractedText = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    extractedText += pageText + "\n";
  }

  return extractedText.trim();
}

function App() {
  const [career, setCareer] = useState("Frontend Developer");
  const [mySkills, setMySkills] = useState("");
  const [assessment, setAssessment] = useState(null);

  const [resume, setResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [aiFeedback, setAiFeedback] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [analysisError, setAnalysisError] = useState("");

  const [completedTasks, setCompletedTasks] = useState([]);

  async function handlePDFUpload(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setPdfError("");
    setPdfLoading(true);

    try {
      if (file.type !== "application/pdf") {
        throw new Error("Please select a PDF file.");
      }

      const extractedText = await extractTextFromPDF(file);

      if (!extractedText) {
        throw new Error(
          "No text found. Please upload a text-based PDF, not a scanned image."
        );
      }

      setResume(extractedText);
      setAnalysis(null);
      setAiFeedback("");
      setAnalysisError("");
    } catch (error) {
      setPdfError(error.message || "Unable to read this PDF.");
    } finally {
      setPdfLoading(false);
      event.target.value = "";
    }
  }

  function assessCareer() {
    if (!mySkills.trim()) {
      setAssessment(null);
      return;
    }

    const requiredSkills = careerSkills[career];

    const matched = requiredSkills.filter((skill) =>
      containsSkill(mySkills, skill)
    );

    const missing = requiredSkills.filter(
      (skill) => !matched.includes(skill)
    );

    const score = Math.round(
      (matched.length / requiredSkills.length) * 100
    );

    setAssessment({ matched, missing, score });
  }

  function analyzeResume() {
    if (!resume.trim() || !jobDescription.trim()) {
      setAnalysisError(
        "Please provide both your resume and the job description."
      );
      return;
    }

    setAiLoading(true);
    setAnalysisError("");
    setAiFeedback("");
    setAnalysis(null);

    try {
      const requiredSkills = allSkills.filter((skill) =>
        containsSkill(jobDescription, skill)
      );

      if (requiredSkills.length === 0) {
        setAnalysisError(
          "No supported technical skills were detected in the job description. Try including skills such as HTML, CSS, JavaScript, React, Python, SQL, Git, Node.js, REST API, or TypeScript."
        );
        return;
      }

      const matched = requiredSkills.filter((skill) =>
        containsSkill(resume, skill)
      );

      const missing = requiredSkills.filter(
        (skill) => !matched.includes(skill)
      );

      const score = Math.round(
        (matched.length / requiredSkills.length) * 100
      );

      const roadmap = missing.map((skill, index) => ({
        skill,
        day: `Day ${index * 2 + 1}-${index * 2 + 2}`,
      }));

      setAnalysis({ matched, missing, score, roadmap });
      setCompletedTasks([]);

      let feedback = "SKILLBRIDGE AI — RESUME ANALYSIS\n\n";

      feedback +=
        "Resume strengths:\n" +
        (matched.length
          ? `Your resume contains these tracked skills: ${matched.join(", ")}.\n`
          : "No tracked skills matched the detected job requirements.\n");

      feedback +=
        "\nRelevant skills found:\n" +
        (matched.join(", ") || "No matching tracked skills found.");

      feedback +=
        "\n\nMissing skills from this job description:\n" +
        (missing.join(", ") || "No missing tracked skills found.");

      feedback += `\n\nKeyword match score: ${score}%`;

      feedback += "\n\nSuggestions:\n";

      if (missing.length > 0) {
        feedback += missing
          .map((skill) => `- Learn and practise ${skill}.`)
          .join("\n");
      } else {
        feedback +=
          "- Continue practising relevant skills.\n" +
          "- Build projects that demonstrate your experience.\n" +
          "- Tailor your resume to the specific role.";
      }

      feedback +=
        "\n\nNext steps:\n" +
        "1. Review the skills listed in this report.\n" +
        "2. Practise missing skills through small projects.\n" +
        "3. Add only skills and experience you can genuinely demonstrate.";

      feedback +=
        "\n\nImportant: This is rule-based demo feedback, not AI-generated advice. The score measures tracked keyword matches only; it does not evaluate your full resume quality.";

      setAiFeedback(feedback);
    } catch (error) {
      setAnalysisError(
        "Unable to analyze the resume: " + error.message
      );
    } finally {
      setAiLoading(false);
    }
  }

  function downloadReport() {
    if (!analysis || !aiFeedback) {
      alert("Please analyze your resume first.");
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    const bottomLimit = pageHeight - 22;

    let y = 20;

    function ensureSpace(height) {
      if (y + height > bottomLimit) {
        doc.addPage();
        y = 20;
      }
    }

    function addSection(title, content, titleColor, bgColor) {
      const lines = doc.splitTextToSize(
        content || "None found",
        contentWidth - 12
      );

      const boxHeight = Math.max(18, lines.length * 6 + 10);
      ensureSpace(boxHeight + 20);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...titleColor);
      doc.text(title, margin, y);
      y += 7;

      doc.setFillColor(...bgColor);
      doc.roundedRect(
        margin,
        y - 2,
        contentWidth,
        boxHeight,
        3,
        3,
        "F"
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(45, 55, 72);
      doc.text(lines, margin + 6, y + 6);

      y += boxHeight + 12;
    }

    // Professional header
    doc.setFillColor(28, 65, 130);
    doc.rect(0, 0, pageWidth, 43, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("SkillBridge AI", margin, 19);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("Resume Analysis Report", margin, 30);

    doc.setFontSize(9);
    doc.text(
      `Generated: ${new Date().toLocaleDateString("en-IN")}`,
      margin,
      37
    );

    y = 56;

    // Score card
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(margin, y, contentWidth, 36, 4, 4, "F");

    doc.setTextColor(28, 65, 130);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("KEYWORD MATCH SCORE", margin + 8, y + 11);

    doc.setFontSize(23);
    doc.text(`${analysis.score}%`, margin + 8, y + 27);

    const barX = margin + 55;
    const barY = y + 17;
    const barWidth = contentWidth - 68;

    doc.setFillColor(215, 226, 242);
    doc.roundedRect(barX, barY, barWidth, 5, 2, 2, "F");

    if (analysis.score > 0) {
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(
        barX,
        barY,
        (barWidth * analysis.score) / 100,
        5,
        2,
        2,
        "F"
      );
    }

    y += 49;

    addSection(
      "Matched Skills",
      analysis.matched.join(", "),
      [22, 120, 75],
      [232, 248, 239]
    );

    addSection(
      "Skills to Learn",
      analysis.missing.join(", "),
      [180, 100, 20],
      [255, 245, 225]
    );

    addSection(
      "Feedback and Recommendations",
      analysis.missing.length
        ? analysis.missing
            .map((skill) => `Practise ${skill} through a small project.`)
            .join("\n")
        : "Continue practising and building projects that demonstrate your skills.",
      [28, 65, 130],
      [239, 246, 255]
    );

    addSection(
      "Next Steps",
      "1. Review the missing skills listed in this report.\n" +
        "2. Practise those skills with small projects.\n" +
        "3. Update your resume with skills you can genuinely demonstrate.",
      [28, 65, 130],
      [245, 247, 250]
    );

    addSection(
      "How to Read This Score",
      "This report uses rule-based keyword matching. The percentage reflects the tracked skills found in both the job description and resume. It is not a measure of overall resume quality and is not AI-generated advice.",
      [90, 90, 90],
      [245, 247, 250]
    );

    // Footer on every page
    const pageCount = doc.internal.getNumberOfPages();

    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page);

      doc.setDrawColor(220, 228, 238);
      doc.line(
        margin,
        pageHeight - 14,
        pageWidth - margin,
        pageHeight - 14
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(110, 120, 135);

      doc.text(
        "SkillBridge AI | Career Development Report",
        margin,
        pageHeight - 8
      );

      doc.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 8,
        { align: "right" }
      );
    }

    doc.save("SkillBridge-AI-Resume-Report.pdf");
  }

  const roadmapSkills = analysis
    ? analysis.missing
    : ["Git", "TypeScript", "REST API"];

  const tasks = roadmapSkills.flatMap((skill, skillIndex) =>
    (skillTasks[skill] || [
      `Learn ${skill} fundamentals`,
      `Practise ${skill} with examples`,
      `Build a small project using ${skill}`,
    ]).map((task, taskIndex) => ({
      id: `${skill}-${taskIndex}`,
      skill,
      task,
      day: `Day ${skillIndex * 2 + 1}-${skillIndex * 2 + 2}`,
    }))
  );

  const completedCount = tasks.filter((task) =>
    completedTasks.includes(task.id)
  ).length;

  const progress =
    tasks.length === 0
      ? 0
      : Math.round((completedCount / tasks.length) * 100);

  function toggleTask(taskId) {
    setCompletedTasks((previous) =>
      previous.includes(taskId)
        ? previous.filter((id) => id !== taskId)
        : [...previous, taskId]
    );
  }

  return (
    <div className="app">
      <header className="navbar">
        <a className="logo" href="#home">
          SkillBridge AI
        </a>

        <nav>
          <a href="#home">Home</a>
          <a href="#assessment">Skill Assessment</a>
          <a href="#resume">Resume Analyzer</a>
          <a href="#roadmap">Learning Roadmap</a>
        </nav>
      </header>

      <main>
        <section className="hero" id="home">
          <div className="hero-content">
            <p className="eyebrow">YOUR CAREER JOURNEY STARTS HERE</p>

            <h1>
              Bridge the gap between your skills and your dream career.
            </h1>

            <p>
              Discover skill gaps, compare your resume with job
              requirements, and follow a learning roadmap to prepare
              for your next role.
            </p>

            <a className="primary-button" href="#assessment">
              Start Your Journey
            </a>
          </div>

          <div className="hero-card">
            <span className="hero-icon">✦</span>
            <h3>Your next opportunity starts with a plan.</h3>
            <p>
              Assess your skills. Discover gaps. Track your progress.
            </p>
          </div>
        </section>

        <section className="section" id="assessment">
          <div className="section-heading">
            <p className="eyebrow">01 — KNOW YOURSELF</p>
            <h2>Career Skill Assessment</h2>
            <p>
              Choose a role and enter your current skills separated
              by commas.
            </p>
          </div>

          <div className="panel">
            <label htmlFor="career">Target career</label>

            <select
              id="career"
              value={career}
              onChange={(event) => {
                setCareer(event.target.value);
                setAssessment(null);
              }}
            >
              {Object.keys(careerSkills).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <label htmlFor="mySkills">Your current skills</label>

            <textarea
              id="mySkills"
              value={mySkills}
              onChange={(event) => {
                setMySkills(event.target.value);
                setAssessment(null);
              }}
              placeholder="Example: HTML, CSS, JavaScript, React"
              rows="3"
            />

            <button
              className="primary-button"
              onClick={assessCareer}
              disabled={!mySkills.trim()}
            >
              Assess My Skills
            </button>

            {assessment && (
              <div className="result">
                <h3>{assessment.score}% skill coverage</h3>

                <div
                  className="progress-track"
                  role="progressbar"
                  aria-valuenow={assessment.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="progress-fill"
                    style={{ width: `${assessment.score}%` }}
                  />
                </div>

                <p>
                  <strong>Matched skills:</strong>{" "}
                  {assessment.matched.join(", ") || "None yet"}
                </p>

                <p>
                  <strong>Skills to learn:</strong>{" "}
                  {assessment.missing.join(", ") ||
                    "You matched all listed skills!"}
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="section alternate" id="resume">
          <div className="section-heading">
            <p className="eyebrow">02 — CHECK YOUR RESUME</p>
            <h2>Resume Analyzer</h2>
            <p>
              Compare your resume with a job description to find
              tracked skills that match and skills you may need to learn.
            </p>
          </div>

          <div className="panel">
            <label htmlFor="resumePdf">Upload Resume (PDF)</label>

            <input
              id="resumePdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePDFUpload}
              disabled={pdfLoading || aiLoading}
            />

            {pdfLoading && (
              <p className="hint">Reading your PDF, please wait...</p>
            )}

            {pdfError && (
              <p className="hint" role="alert">
                {pdfError}
              </p>
            )}

            <label htmlFor="resume">Resume text</label>

            <textarea
              id="resume"
              value={resume}
              onChange={(event) => {
                setResume(event.target.value);
                setAnalysis(null);
                setAiFeedback("");
                setAnalysisError("");
              }}
              placeholder="Upload a PDF or paste your resume text here..."
              rows="5"
            />

            <label htmlFor="jobDescription">
              Job description
            </label>

            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(event) => {
                setJobDescription(event.target.value);
                setAnalysis(null);
                setAiFeedback("");
                setAnalysisError("");
              }}
              placeholder="Paste the job description and required technical skills..."
              rows="5"
            />

            <button
              className="primary-button"
              onClick={analyzeResume}
              disabled={
                aiLoading ||
                pdfLoading ||
                !resume.trim() ||
                !jobDescription.trim()
              }
            >
              {aiLoading ? "Analyzing Resume..." : "Analyze Resume"}
            </button>

            {aiLoading && (
              <p className="hint">
                Comparing tracked skills in your resume and job description...
              </p>
            )}

            {analysisError && (
              <p className="hint" role="alert">
                {analysisError}
              </p>
            )}

            {analysis && (
              <div className="result">
                <h3>{analysis.score}% keyword match</h3>

                <div
                  className="progress-track"
                  role="progressbar"
                  aria-valuenow={analysis.score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="progress-fill"
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>

                <p>
                  <strong>Matched skills:</strong>{" "}
                  {analysis.matched.join(", ") || "None found"}
                </p>

                <p>
                  <strong>Skills to learn:</strong>{" "}
                  {analysis.missing.join(", ") || "None found"}
                </p>

                <p className="hint">
                  This score measures tracked keyword matches only.
                  It does not measure overall resume quality.
                </p>
              </div>
            )}

            {aiFeedback && (
              <div className="result">
                <h3>Resume Feedback</h3>
                <p style={{ whiteSpace: "pre-wrap" }}>
                  {aiFeedback}
                </p>
              </div>
            )}

            {analysis && aiFeedback && (
              <button
                className="primary-button"
                onClick={downloadReport}
                type="button"
              >
                Download PDF Report
              </button>
            )}
          </div>
        </section>

        <section className="section" id="roadmap">
          <div className="section-heading">
            <p className="eyebrow">03 — TAKE ACTION</p>
            <h2>Your Interactive Learning Roadmap</h2>

            <p>
              {analysis
                ? analysis.missing.length
                  ? "Use this roadmap to practise the tracked skills missing from your comparison."
                  : "No tracked skills are missing from this comparison. Keep practising and building projects."
                : "Start with these example skills, or analyze your resume to create a skill-gap roadmap."}
            </p>
          </div>

          <div className="panel roadmap-panel">
            <div className="roadmap-summary">
              <div>
                <span className="muted">YOUR LEARNING PROGRESS</span>
                <h3>{progress}% completed</h3>
                <p>
                  {completedCount} of {tasks.length} tasks completed
                </p>
              </div>

              <div className="progress-circle">{progress}%</div>
            </div>

            <div
              className="progress-track large"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              />
            </div>

            {tasks.length > 0 ? (
              tasks.map((task) => (
                <label
                  className={`roadmap-task ${
                    completedTasks.includes(task.id)
                      ? "task-complete"
                      : ""
                  }`}
                  key={task.id}
                >
                  <input
                    type="checkbox"
                    checked={completedTasks.includes(task.id)}
                    onChange={() => toggleTask(task.id)}
                  />

                  <span className="task-details">
                    <span className="task-day">
                      {task.day} · {task.skill}
                    </span>
                    <span className="task-title">{task.task}</span>
                  </span>

                  {completedTasks.includes(task.id) && (
                    <span className="done-label">Completed ✓</span>
                  )}
                </label>
              ))
            ) : (
              <p>
                Great! No missing tracked skills were found.
                Continue practising and building projects.
              </p>
            )}

            {progress === 100 && tasks.length > 0 && (
              <div className="success-message">
                🎉 Amazing! You completed this learning roadmap.
              </div>
            )}

            <button
              className="secondary-button"
              onClick={() => setCompletedTasks([])}
              disabled={completedTasks.length === 0}
            >
              Reset Progress
            </button>
          </div>
        </section>

        <section className="closing">
          <p className="eyebrow">
            YOUR FUTURE IS BUILT ONE SKILL AT A TIME
          </p>

          <h2>Learn with purpose. Grow with confidence.</h2>

          <a className="primary-button" href="#roadmap">
            Continue Learning
          </a>
        </section>
      </main>

      <footer>
        <p>SkillBridge AI · Learn skills. Build your future.</p>
        <p className="hint">
          Demo version · Resume feedback uses rule-based keyword matching.
        </p>
      </footer>
    </div>
  );
}

export default App;
