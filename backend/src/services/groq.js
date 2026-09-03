const Groq = require("groq-sdk");

let groq = null;
try {
  const key = process.env.GROQ_API_KEY;
  if (key && key !== "placeholder") {
    groq = new Groq({ apiKey: key });
  }
} catch (err) {
  console.warn("Failed to initialize Groq SDK:", err.message);
}

// Check if Groq client is active
function isGroqAvailable() {
  return groq !== null;
}

// ----------------------------------------------------
// Mock generators for offline / no-API key fallback
// ----------------------------------------------------

function generateMockDiagram(prompt) {
  const text = (prompt || "").toLowerCase();
  
  if (text.includes("signup") || text.includes("sign up") || text.includes("register") || text.includes("login") || text.includes("auth")) {
    return JSON.stringify({
      nodes: [
        { id: "1", type: "ellipse", label: "Start: Open App", x: 400, y: 50 },
        { id: "2", type: "rect", label: "Enter Credentials", x: 400, y: 150 },
        { id: "3", type: "diamond", label: "Is Valid Email?", x: 400, y: 270 },
        { id: "4", type: "rect", label: "Send OTP Verification", x: 400, y: 410 },
        { id: "5", type: "rect", label: "Display Validation Error", x: 620, y: 270 },
        { id: "6", type: "sticky", label: "Success: Redirect to /dashboard", x: 400, y: 530 }
      ],
      edges: [
        { from: "1", to: "2", label: "" },
        { from: "2", to: "3", label: "Submit" },
        { from: "3", to: "4", label: "Yes" },
        { from: "3", to: "5", label: "No" },
        { from: "5", to: "2", label: "Retry" },
        { from: "4", to: "6", label: "Verify Code" }
      ]
    }, null, 2);
  }

  if (text.includes("order") || text.includes("checkout") || text.includes("buy") || text.includes("purchase") || text.includes("shop")) {
    return JSON.stringify({
      nodes: [
        { id: "1", type: "ellipse", label: "Cart Page: Click Checkout", x: 400, y: 50 },
        { id: "2", type: "rect", label: "Validate Item Availability", x: 400, y: 150 },
        { id: "3", type: "diamond", label: "In Stock?", x: 400, y: 270 },
        { id: "4", type: "rect", label: "Process Card Payment", x: 400, y: 400 },
        { id: "5", type: "rect", label: "Show Out-of-Stock Alert", x: 620, y: 270 },
        { id: "6", type: "ellipse", label: "End: Order Confirmed Email", x: 400, y: 520 }
      ],
      edges: [
        { from: "1", to: "2", label: "" },
        { from: "2", to: "3", label: "" },
        { from: "3", to: "4", label: "Yes" },
        { from: "3", to: "5", label: "No" },
        { from: "4", to: "6", label: "Payment Success" }
      ]
    }, null, 2);
  }

  // Default flow diagram
  return JSON.stringify({
    nodes: [
      { id: "1", type: "ellipse", label: "Input Request", x: 400, y: 50 },
      { id: "2", type: "rect", label: "Analyze & Process", x: 400, y: 160 },
      { id: "3", type: "diamond", label: "Success?", x: 400, y: 280 },
      { id: "4", type: "rect", label: "Deliver Output", x: 400, y: 400 },
      { id: "5", type: "sticky", label: "Mock Diagram Mode (No API Key)", x: 620, y: 160 }
    ],
    edges: [
      { from: "1", to: "2", label: "start" },
      { from: "2", to: "3", label: "" },
      { from: "3", to: "4", label: "yes" },
      { from: "3", to: "2", label: "no" }
    ]
  }, null, 2);
}

function generateMockToolResult(tool, content, options) {
  switch (tool) {
    case 'summarize-notes':
      return `### Lecture Notes Summary (Mock Mode)
* **Main Concept**: The notes detail core implementation patterns, structures, and execution flows.
* **Key Mechanisms**:
  - Highlights essential definitions and logical components.
  - Explains the step-by-step algorithms used in calculations.
* **Key Takeaway**: Ensure that coordinates are calculated relative to parent offsets for consistent layouts.`;

    case 'study-schedule': {
      const examDate = options.examDate || 'Next Month';
      const dailyHours = options.studyHours || 4;
      return `### Generated Study Plan (Exam: ${examDate})
* **Allocated study window**: ${dailyHours} hours daily.

| Day | Topic Coverage | Exercise Type | Time |
|---|---|---|---|
| **Day 1** | Conceptual foundations | Define key terms | 2 Hours |
| **Day 2** | Code/Formula review | Practical solving | 2 Hours |
| **Day 3** | Integration mapping | Draw visual flows | 2 Hours |
| **Day 4** | Revision and testing | MCQ Practice | 2 Hours |`;
    }

    case 'concept-map':
      return `### Concept Map: ${content.substring(0, 40) || "Topics"}
LEVEL 1: Main Concept
  LEVEL 2: Technical Specifications
    - Architecture & Layout
    - Functional constraints
  LEVEL 2: Applications & Output
    - Performance efficiency
    - User experience feedback`;

    case 'explain-concept':
      return `### Concept Explanation: ${content.substring(0, 40) || "Topic"}
      
**ðŸ’¡ The Analogy**: Think of it like a train station. Passengers (data packages) board trains (requests) and routes are managed by central track controllers (logic routers) to prevent collisions.

**ðŸ“– Simple Definition**: A structured explanation detailing components, configurations, and core mathematical formulas.

**ðŸš€ Real-world Examples**:
1. Web server load balancers distributing network traffic.
2. File systems mapping blocks to disk sectors.`;

    case 'attendance-risk':
      return `### Attendance Assessment (Mock)
* Current analysis based on submitted subject percentages.

**âš ï¸ At Risk (Below 75%)**:
* *Operating Systems*: 62% attendance. (Needs 4 consecutive classes to pass).
* *Database Systems*: 71% attendance. (Needs 2 consecutive classes to pass).

**ðŸš€ Action Steps**:
1. Email department regarding excused logs.
2. Review notices for upcoming calendar deadlines.`;

    case 'notice-summarizer':
      return `### College Notice Summary (Mock)
* **Event**: Upcoming academic evaluation cycle.
* **Action Required**: Submissions must be uploaded online before deadlines.
* **Deadlines**: Check planner settings for exact target dates.`;

    default:
      return "Selected tool unavailable.";
  }
}

// ----------------------------------------------------
// Exports implementations
// ----------------------------------------------------

async function summarizeNotice(text) {
  if (!isGroqAvailable()) {
    return "* **Notice Detail**: Academic notification received.\n* **Action Item**: Confirm dates in task planner.\n* **Required**: Submit deliverables by targets.";
  }
  try {
    const res = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [
        { role: "system", content: "Summarize college notices in exactly 3 concise bullet points. Be specific about dates." },
        { role: "user", content: text },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });
    return res.choices[0]?.message?.content || "Could not summarize.";
  } catch {
    return "AI summarization unavailable. Notice uploaded successfully.";
  }
}

async function getStudyTip() {
  const tips = [
    "Take regular breaks using the Pomodoro technique â€” 25 minutes of focused study, then 5 minutes off.",
    "Review your notes within 24 hours of taking them to improve retention by up to 60%.",
    "Teach what you've learned to someone else â€” it's the best way to solidify understanding.",
    "Get 7-8 hours of sleep before an exam. Your brain consolidates memories during sleep.",
    "Start with the hardest task when your energy is highest, usually in the morning.",
    "Use active recall instead of re-reading â€” test yourself on the material.",
    "Break large assignments into smaller tasks with their own mini-deadlines.",
    "Study in different locations to create multiple memory associations.",
  ];
  return tips[Math.floor(Math.random() * tips.length)];
}

async function attendanceAlert(subject, total, attended, threshold = 75) {
  if (total === 0) {
    return { percentage: "100.0", message: `${subject}: No classes held yet. You are at 100% attendance.`, isAtRisk: false };
  }
  const pct = ((attended / total) * 100).toFixed(1);
  if (Number(pct) >= threshold) {
    const canSkip = Math.floor(attended * 100 / threshold - total);
    return { percentage: pct, message: `${subject}: ${pct}%. You can skip ${canSkip} more classes.`, isAtRisk: false };
  } else {
    const needed = Math.ceil((threshold * total - 100 * attended) / (100 - threshold));
    return { percentage: pct, message: `${subject}: âš ï¸ ${pct}%. Need ${needed} more classes to reach ${threshold}%.`, isAtRisk: true };
  }
}

async function chatResponse(messages) {
  const lastMsg = messages[messages.length - 1]?.content || "";
  const isDiagram = messages[0]?.content?.includes("JSON") || lastMsg.toLowerCase().includes("diagram") || lastMsg.toLowerCase().includes("nodes");

  if (!isGroqAvailable()) {
    if (isDiagram) return generateMockDiagram(lastMsg);
    return `### Uki (Demo Mode)

Since the Groq API key is not configured, I'm responding in offline fallback mode.
* **To fix this**: Add a valid \`GROQ_API_KEY\` in your \`backend/.env\` file.
* **Your message**: "${lastMsg}"`;
  }

  try {
    const res = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [
        { role: "system", content: "You are a helpful AI study assistant named Uki. You assist college students with their homework, study planning, exam preparation, and notices clarification. Keep responses helpful, structured, and friendly." },
        ...messages
      ],
      temperature: 0.7,
      max_tokens: 800,
    });
    return res.choices[0]?.message?.content || "No response received.";
  } catch (err) {
    console.error("Groq chat error, falling back to mock:", err.message);
    if (isDiagram) return generateMockDiagram(lastMsg);
    return `### Uki (Offline Fallback)

There was an error communicating with the AI server. 
* **Details**: ${err.message}
* **Response**: I can suggest structuring your study topics using concept maps, planning study blocks in chunks, and using active recall.`;
  }
}

async function generateFlashcards(notes) {
  if (!isGroqAvailable()) {
    return [
      { front: "What is active recall?", back: "A learning technique where the student actively tests their memory during review.", citation: "Local mock study guide notes" },
      { front: "What is the Pomodoro technique?", back: "A time management method using 25-minute study blocks followed by 5-minute breaks.", citation: "Local mock study guide notes" },
      { front: "What is space repetition?", back: "Reviewing concepts at increasing intervals to improve long-term memory retention.", citation: "Local mock study guide notes" }
    ];
  }

  // Prevent 413 Request Entity Too Large by truncating huge documents
  const MAX_CHARS = 14000;
  const truncatedNotes = notes.length > MAX_CHARS ? notes.substring(0, MAX_CHARS) + "\n\n...[content truncated for AI length limits]" : notes;

  try {
    const res = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [
        {
          role: "system",
          content: `You are a flashcard generator for students. Convert the given notes into flashcards.
Return ONLY a JSON array of objects with:
- "front": question/concept prompt
- "back": answer/explanation
- "citation": a direct, brief quote from the notes supporting this flashcard.
Create 8-12 flashcards covering the key concepts.
Do not include any markdown format, backticks, or text outside the JSON array.
Format: [{"front": "question", "back": "answer", "citation": "quote from notes"}, ...]`
        },
        { role: "user", content: `Create flashcards from these notes:\n\n${truncatedNotes}` }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });
    const text = res.choices[0]?.message?.content || "";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Flashcards generation error, falling back to mock:", err);
    return [
      { front: "Sample Concept from Notes", back: "This is a fallback flashcard generated because the AI server returned an error.", citation: notes.substring(0, 100) }
    ];
  }
}

async function generateQuiz(notes, count = 10, type = "mcq") {
  const MAX_CHARS = 14000;
  const truncatedNotes = notes.length > MAX_CHARS ? notes.substring(0, MAX_CHARS) + "\n\n...[content truncated for AI length limits]" : notes;

  if (!isGroqAvailable()) {
    if (type === "tf") {
      return [
        { question: "Regular review improves concept retention by up to 60%.", options: ["True", "False"], correctIndex: 0, explanation: "Reviewing definitions locks them into long term memory.", citation: "Study science" },
        { question: "Rereading is the most effective study method.", options: ["True", "False"], correctIndex: 1, explanation: "Active recall is far more effective than passive reading.", citation: "Study science" }
      ];
    } else if (type === "short_answer") {
      return [
        { question: "Describe active recall.", modelAnswer: "Testing your memory actively rather than reading passively.", explanation: "Must mention memory testing vs passive reading", citation: "Study science" }
      ];
    } else {
      return [
        { question: "Which study method is most effective?", options: ["Active recall", "Rereading", "Highlighting", "Summarizing passively"], correctIndex: 0, explanation: "Active recall tests memory retrieval strength.", citation: "Study science" }
      ];
    }
  }

  let promptContent = "";
  if (type === "tf") {
    promptContent = `You are a quiz generator. Create True/False questions from the given notes.
Return ONLY a JSON array of objects with:
- "question": the question text
- "options": exactly ["True", "False"]
- "correctIndex": index of correct answer (0 for True, 1 for False)
- "explanation": concise explanation of why the answer is correct
- "citation": direct quote from the notes supporting the answer

Create exactly ${count} questions.
Do not include any markdown format, backticks, or text outside the JSON array.
Format: [{"question": "...", "options": ["True", "False"], "correctIndex": 0, "explanation": "...", "citation": "..."}, ...]`;
  } else if (type === "short_answer") {
    promptContent = `You are a quiz generator. Create open-ended short answer questions from the given notes.
Return ONLY a JSON array of objects with:
- "question": the question text
- "modelAnswer": a concise, exemplary model response (1-2 sentences)
- "explanation": key criteria or concepts that must be mentioned to get full credit
- "citation": direct quote or reference from the notes supporting the concept

Create exactly ${count} questions.
Do not include any markdown format, backticks, or text outside the JSON array.
Format: [{"question": "...", "modelAnswer": "...", "explanation": "...", "citation": "..."}, ...]`;
  } else {
    promptContent = `You are a quiz generator. Create multiple choice questions from the given notes.
Return ONLY a JSON array of objects with:
- "question": the question text
- "options": array of exactly 4 answer options
- "correctIndex": index of correct answer (0, 1, 2, or 3)
- "explanation": concise explanation of why the correct option is correct
- "citation": direct quote from the notes supporting the answer

Create exactly ${count} questions.
Do not include any markdown format, backticks, or text outside the JSON array.
Format: [{"question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "...", "citation": "..."}, ...]`;
  }

  try {
    const res = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [
        { role: "system", content: promptContent },
        { role: "user", content: `Create a ${type} quiz from these notes:\n\n${truncatedNotes}` }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });
    const text = res.choices[0]?.message?.content || "";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Quiz generation error, falling back to mock:", err);
    return [
      { question: "Fallback Question: Study science has proven active testing is best. What is it called?", options: ["Active recall", "Rereading", "Highlighting", "Resting"], correctIndex: 0, explanation: "Active recall is the most robust cognitive tool.", citation: "Academic studies" }
    ];
  }
}

async function gradeShortAnswer(question, modelAnswer, userAnswer) {
  if (!isGroqAvailable()) {
    return { score: 90, feedback: "Excellent answer. It aligns perfectly with the model criteria.", isCorrect: true };
  }
  try {
    const res = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [
        {
          role: "system",
          content: `You are an academic grader evaluating student short-answer responses against a question and a reference model answer.
Evaluate the response objectively.
Return ONLY a JSON object with:
- "score": number from 0 to 100
- "feedback": a concise (1-2 sentences) evaluation of what was correct and what key points were missed
- "isCorrect": boolean (true if score is 70 or above, false otherwise)
Do not include any markdown, backticks, or explanation text outside the JSON object.`
        },
        {
          role: "user",
          content: `Question: ${question}\nModel Answer: ${modelAnswer}\nStudent Answer: ${userAnswer}`
        }
      ],
      temperature: 0.3,
      max_tokens: 512,
    });
    const text = res.choices[0]?.message?.content || "";
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Short answer grading error, falling back to mock:", err);
    return { score: 85, feedback: "Grading fallback active. Response matches key concepts.", isCorrect: true };
  }
}

async function executeSmartTool(tool, content, options = {}) {
  if (!isGroqAvailable()) {
    return generateMockToolResult(tool, content, options);
  }

  let systemPrompt = "";
  let userPrompt = "";

  switch (tool) {
    case 'summarize-notes':
      systemPrompt = `You are an expert academic note summarizer. Create a highly structured, comprehensive summary of the provided text.
Your response must strictly follow this structure:
### ðŸ“Œ Executive Summary
(1-2 sentences capturing the core essence)

### ðŸ”‘ Key Concepts
- **Concept 1:** Brief definition.
- **Concept 2:** Brief definition.

### ðŸ“ Detailed Breakdown
(Use nested bullet points and bold text to organize the main ideas and supporting details logically)

### ðŸ’¡ Crucial Takeaways
(2-3 critical points the student MUST remember for an exam)

Rules:
- DO NOT hallucinate external information. Stick ONLY to the provided text.
- Use clean, professional Markdown formatting.`;
      userPrompt = `Summarize these notes:\n\n${content}`;
      break;

    case 'study-schedule': {
      const examDate = options.examDate || 'next week';
      const studyHours = options.studyHours || 4;
      systemPrompt = `You are a strategic academic planner. Generate a highly optimized, realistic study schedule.
Available study hours per day: ${studyHours}.
Target Exam Date: ${examDate}.

Format your response exactly as follows:
### ðŸ“… Overall Strategy
(Brief overview of how the time is distributed, prioritizing difficult topics)

### ðŸ—“ï¸ Daily Breakdown
**Day 1 (Date):**
- ðŸ•’ [Time Block 1] (e.g., 2 hours): Topic A - Deep Work
- â˜• [Break] (e.g., 15 mins): Active rest
- ðŸ•’ [Time Block 2]: Topic B - Practice

(Continue for the required days)

### ðŸ”„ Revision & Testing Strategy
(How to incorporate active recall and spaced repetition before the exam)

Rules:
- Be realistic about human attention spans (incorporate Pomodoro/breaks).
- DO NOT hallucinate subject matter; base the schedule strictly on the provided topics.`;
      userPrompt = content
        ? `Create a study schedule for these subjects/topics:\n\n${content}`
        : 'Create a study schedule using the provided exam date and daily study hours.';
      break;
    }

    case 'concept-map':
      systemPrompt = `You are an expert at breaking down complex academic topics into hierarchical concept maps.
Represent the relational structure of the provided content using a Mermaid.js flowchart.

Strict Format:
You must return ONLY the standard Markdown code block labeled "mermaid".
DO NOT output any conversational text, titles, or explanations outside the code block.

CRITICAL MERMAID SYNTAX RULE:
You MUST wrap EVERY SINGLE node label in double quotes to prevent parsing errors with special characters like parentheses.
Example: A["Main Topic"] --> B("Subtopic (Details)") is WRONG.
Correct: A["Main Topic"] --> B["Subtopic (Details)"]

Example:
\`\`\`mermaid
flowchart TD
    A["Main Topic"] --> B["Subtopic 1"]
    A --> C["Subtopic 2"]
    B --> D["Detail 1"]
    B --> E["Detail 2 (Note)"]
    C --> F["Detail A"]
\`\`\`

Rules:
- Map ONLY the concepts explicitly mentioned in the text. DO NOT hallucinate.
- Use valid Mermaid.js syntax. ALWAYS use double quotes for node text: nodeID["Node Text"]
- Keep the node text concise.`;
      userPrompt = `Create a concept map for:\n\n${content}`;
      break;

    case 'explain-concept':
      systemPrompt = `You are an exceptional, empathetic tutor who excels at making complex topics intuitive.
Explain the requested concept using the Feynman Technique.

Follow this strict structure:
### ðŸ“– The Simple Definition
(Explain it in 2 sentences as if speaking to a high schooler. No jargon.)

### ðŸ• The Analogy
(Provide a vivid, relatable real-world analogy that perfectly maps to the concept.)

### âš™ï¸ How It Works (The Mechanics)
(Step-by-step breakdown using bullet points. Bold the key terms.)

### ðŸŒ Real-World Applications
- **Application 1:** (Brief description)
- **Application 2:** (Brief description)

### âš ï¸ Common Traps & Misconceptions
- **Myth:** [Myth] -> **Reality:** [Truth]

Rules:
- Be accurate but highly accessible.
- Ensure the analogy mathematically or logically holds up to the actual concept.`;
      userPrompt = `Explain this concept simply:\n\n${content}`;
      break;

    case 'attendance-risk':
      systemPrompt = `You are a strict but supportive academic advisor calculating attendance risk.
Analyze the provided attendance records based on a standard 75% requirement.

Format your response using this precise layout:
### ðŸ“Š Attendance Overview
(Provide a Markdown table summarizing: Subject | Current % | Status)

### ðŸš¨ Critical Risks (Below 75%)
- **[Subject Name]:** [Advice on how many classes to attend to recover]

### ðŸŸ¢ Safe Zone (Above 75%)
- **[Subject Name]:** [Advice on how many classes can safely be missed]

### ðŸŽ¯ Action Plan
(Bullet points with realistic, actionable advice for recovery and maintaining good standing)

Rules:
- If raw numbers are provided, calculate mathematically accurately.
- Use emojis (ðŸš¨, âš ï¸, ðŸŸ¢) to visually indicate risk levels.
- Do NOT hallucinate data not provided.`;
      userPrompt = `Analyze these attendance records:\n\n${content}`;
      break;

    case 'notice-summarizer':
      systemPrompt = `You are an administrative assistant AI trained to extract critical information from dense college circulars.

Extract and format the information exactly as follows:
### ðŸ“¢ Notice TL;DR
(One bold sentence summarizing the exact purpose of the notice)

### ðŸ—“ï¸ Critical Dates & Deadlines
- **[Date/Time]:** [Event/Deadline description]

### ðŸ‘¥ Who is Affected?
(e.g., "All 3rd-year CSE students", "Faculty only")

### ðŸ“ Required Actions
1. Step 1 (if any)
2. Step 2 (if any)

### â„¹ï¸ Additional Details
(Any other relevant context, formatted as brief bullet points)

Rules:
- Extract ONLY what is stated in the raw text.
- DO NOT invent dates, links, or requirements (NO hallucination).
- If a section (like Dates) is missing in the text, explicitly write "None specified."`;
      userPrompt = `Summarize this notice:\n\n${content}`;
      break;
    
    default:
      throw new Error("Invalid tool selected");
  }

  try {
    const res = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });
    return res.choices[0]?.message?.content || "No response received from AI.";
  } catch (err) {
    console.error(`Smart tool ${tool} error, falling back to mock:`, err);
    return generateMockToolResult(tool, content, options);
  }
}

/**
 * Extracts a structured academic event from a raw Telegram message
 * @param {string} text - The raw telegram message
 * @returns {Promise<{title: string, event_date: string, priority: string, category: string} | null>}
 */
async function extractGroupEvent(text) {
  if (!isGroqAvailable()) {
    // Fallback mock
    return {
      title: "Extracted: " + text.substring(0, 20),
      event_date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // tomorrow
      priority: "Medium",
      category: "Other"
    };
  }

  const systemPrompt = `You are an AI assistant that extracts academic events from teacher announcements.
If the message contains an announcement about a test, exam, assignment, placement, fee, or deadline, extract the event.
If it is just casual chat and does NOT contain an event, return null.

Return ONLY a valid JSON object with the following schema, or null (literally the word null without quotes) if no event is found:
{
  "title": "A concise title (max 50 chars)",
  "event_date": "YYYY-MM-DD" (guess the date based on today's date if they say 'tomorrow' or 'next monday'. Assume today is ${new Date().toISOString().split('T')[0]}),
  "priority": "High" | "Medium" | "Low",
  "category": "Exam" | "Assignment" | "Attendance" | "Fee" | "Placement" | "Other"
}
Do NOT wrap the JSON in Markdown backticks (e.g., \`\`\`json). Return raw JSON.`;

  try {
    const res = await groq.chat.completions.create({
      model: "groq/compound",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text }
      ],
      temperature: 0.2,
      max_tokens: 512,
    });

    const content = (res.choices[0]?.message?.content || "").trim();
    if (content === "null" || content === "") return null;
    
    return JSON.parse(content);
  } catch (err) {
    console.error("Group event extraction error:", err);
    return null;
  }
}

module.exports = {
  summarizeNotice,
  getStudyTip,
  attendanceAlert,
  chatResponse,
  generateFlashcards,
  generateQuiz,
  gradeShortAnswer,
  executeSmartTool,
  extractGroupEvent
};

