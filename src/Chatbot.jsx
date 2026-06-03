import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaPaperPlane, FaMinus } from "react-icons/fa";

// --- FALLBACK LOGIC ---
const FALLBACK_RESPONSES = {
  "projects": "I've delivered high-impact data projects:\n1. iPhone Sales Analysis: Engineered a dynamic Power BI dashboard to identify regional gaps.\n2. IPL Historical Dashboard: Analyzed 17+ years of complex cricket data for predictive modeling.\n3. Global E-commerce Insights: Visualized multi-dimensional datasets, supporting a 10% reduction in logistical overhead.",
  "skills": "I have a robust technical stack:\n• SQL: Advanced querying, Joins, and CTEs (86%)\n• Python: Data cleaning and analysis with Pandas/NumPy (85%)\n• Power BI: Interactive dashboards and automated data modeling (80%)\n• Excel: Advanced formulas, Pivot Tables, and business intelligence (90%)\n• Others: AI, Data Visualization, n8n Automation, and Machine Learning.",
  "experience": "I have over 1 year of experience as a Data Analyst. I specialize in turning raw, messy data into clear, actionable business intelligence with a focus on delivering measurable results.",
  "certifications": "I hold several professional certifications:\n• Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate\n• Databricks Accreditation - Generative AI Fundamentals\n• AWS - Foundation of Prompt Engineering\n• IBM - Artificial Intelligence Fundamentals\n• Cisco - Introduction to Data Science\n• Analytics Vidhya - n8n automation tool\n• LinkedIn Learning certifications in Data Analytics and Business Analysis.",
  "hire": "I am currently open to new opportunities! I can help with data analysis, dashboard design, automation, or deep-dive reporting. You can reach out to Samay directly at samaygupta963@email.com or call him at +91-9157657443.",
  "contact": "Let's connect! You can use the contact form on this page, or reach out via:\n• Email: samaygupta963@email.com\n• Phone: +91-9157657443\n• LinkedIn: linkedin.com/in/samaygupta24/\n• GitHub: github.com/Samay24",
  "resume": "You can download my latest resume using the 'Resume' button in the top navigation bar of this portfolio!",
  "sql": "I use SQL for complex data extraction, transformation, and optimization. I'm proficient in window functions, aggregations, and subqueries.",
  "python": "In Python, I use Pandas and NumPy for Exploratory Data Analysis (EDA) and cleaning. I also build automation scripts and custom visualizations.",
  "power bi": "I build interactive Power BI dashboards that feature automated data modeling, DAX measures, and dynamic slicers for deep-dive analysis.",
  "default": "I'm Samay's AI assistant. I can tell you all about his 1+ years of Data Analysis experience, his SQL/Python skills, his Power BI projects, or his certifications from Oracle, IBM, and AWS!"
};

const getFallbackResponse = (userText) => {
  const lowerText = userText.toLowerCase();
  
  // Prioritize hiring/contact
  if (lowerText.includes("hire") || lowerText.includes("opportunity") || lowerText.includes("work")) return FALLBACK_RESPONSES.hire;
  if (lowerText.includes("contact") || lowerText.includes("email") || lowerText.includes("phone") || lowerText.includes("call")) return FALLBACK_RESPONSES.contact;
  
  for (const key in FALLBACK_RESPONSES) {
    if (lowerText.includes(key)) return FALLBACK_RESPONSES[key];
  }
  return FALLBACK_RESPONSES.default;
};

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
You are an AI assistant for Samay Gupta's portfolio.
Samay is a Data Analyst with 1+ years of experience.
Your goal is to provide detailed and professional answers about Samay's expertise.

PROFESSIONAL BACKGROUND:
CONTACT INFO:
- Email: samaygupta963@email.com
- Phone: +91-9157657443

- Role: Data Analyst / AI & Automation Specialist.
- Experience: 1+ Years delivering actionable insights.

CORE TECHNICAL SKILLS:
- SQL (86%): Advanced querying, Joins, CTEs, Optimization.
- Python (85%): Data Analysis (Pandas, NumPy), Automation.
- Power BI (80%): Interactive Dashboards, Data Modeling, DAX.
- Excel (90%): Advanced formulas, Pivot Tables, Business Intelligence.

CERTIFICATIONS:
- Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate.
- Databricks Accreditation - Generative AI Fundamentals.
- AWS - Foundation of Prompt Engineering.
- IBM - Artificial Intelligence Fundamentals.
- Cisco - Introduction to Data Science.
- Analytics Vidhya - n8n automation tool.
- LinkedIn - Data Analytics & Business Analysis.

FEATURED PROJECTS:
1. iPhone Sales Analysis: Power BI dashboard identifying regional performance gaps.
2. IPL Historical Performance: Analyzing 17+ years of cricket data with dynamic filtering.
3. Global E-commerce Insights: Visualizing profitability drivers and reducing logistical overhead by 10%.

TONE: Senior Professional, helpful, concise, and technically grounded.
`;

const QUICK_ACTIONS = [
  { label: "🛠️ Technical Skills", text: "What are your technical skills?" },
  { label: "📈 Detailed Projects", text: "Tell me about your data projects." },
  { label: "🤝 Hire Me", text: "Are you available for hire?" },
  { label: "📄 Get Resume", text: "How can I download your resume?" }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! 👋 I'm Samay's AI assistant. I can tell you about his data expertise, projects, or experience. What's on your mind?", sender: "bot" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    const userText = text || inputValue;
    if (!userText.trim()) return;

    const newMessages = [...messages, { text: userText, sender: "user" }];
    setMessages(newMessages);
    setInputValue("");
    setIsTyping(true);

    try {
      const hfToken = import.meta.env.VITE_HUGGING_FACE_TOKEN;

      if (!hfToken) throw new Error("Hugging Face Token missing in .env");

      const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

      const response = await fetch(HF_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `[INST] ${SYSTEM_PROMPT} \n User: ${userText} [/INST]`,
          parameters: { max_new_tokens: 300, temperature: 0.7 }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.estimated_time) {
          throw new Error(`Model is starting up. Please wait about ${Math.round(errorData.estimated_time)} seconds.`);
        }
        throw new Error(errorData.error || `Error ${response.status}`);
      }

      const data = await response.json();
      let botResponse = Array.isArray(data) ? data[0].generated_text : data.generated_text;

      if (botResponse && botResponse.includes("[/INST]")) {
        botResponse = botResponse.split("[/INST]").pop().trim();
      }

      setMessages(prev => [...prev, { text: botResponse || "I couldn't generate a response.", sender: "bot" }]);
    } catch (error) {
      console.error("Chatbot Connection Error:", error);
      setTimeout(() => {
        const fallbackResponse = getFallbackResponse(userText);
        const debugInfo = `\n\n(Debug Info: ${error.message})`;
        setMessages(prev => [...prev, { text: fallbackResponse + debugInfo, sender: "bot" }]);
        setIsTyping(false);
      }, 800);
      return;
    }

    setIsTyping(false);
  };

  return (
    <div className="chatbot-container">
      <AnimatePresence>
        {!isOpen && (
          <Motion.button
            className="chat-bubble"
            onClick={() => setIsOpen(true)}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FaRobot />
          </Motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            className="chat-window"
            initial={{ y: 100, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.8 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="chat-header">
              <div className="header-info">
                <FaRobot className="bot-icon" />
                <span>Samay's Assistant</span>
              </div>
              <div className="header-actions">
                <button onClick={() => setIsOpen(false)}><FaMinus /></button>
              </div>
            </div>

            <div className="chat-messages" ref={scrollRef}>
              {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <div className="message-content">{msg.text}</div>
                </div>
              ))}
              {isTyping && (
                <div className="message bot">
                  <div className="message-content typing">
                    <span>.</span><span>.</span><span>.</span>
                  </div>
                </div>
              )}
            </div>

            {messages.length < 10 && (
              <div className="quick-actions">
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action.label}
                    onClick={() => handleSend(action.text)}
                    className="quick-action-btn"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <form
              className="chat-input"
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            >
              <input
                type="text"
                placeholder="Ask me something..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit" disabled={!inputValue.trim() || isTyping}>
                <FaPaperPlane />
              </button>
            </form>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
