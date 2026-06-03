import { useState, useEffect, useRef } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaPaperPlane, FaMinus } from "react-icons/fa";

// --- FALLBACK LOGIC ---
const FALLBACK_RESPONSES = {
  "projects": "I've delivered high-impact data projects:\n1. iPhone Sales Analysis: Identified regional gaps using Power BI.\n2. IPL Historical Dashboard: Analyzed 17+ years of cricket data.\n3. E-commerce Insights: Reduced logistical overhead by 10%.\nWhich one would you like to hear more about?",
  "skills": "I have a robust technical stack:\n• SQL: Advanced querying, Joins, and CTEs (86%)\n• Python: Data cleaning with Pandas/NumPy (85%)\n• Visualization: Power BI and interactive dashboards (80%)\n• Excel: Advanced formulas and Pivot Tables (90%)",
  "experience": "I have over 1 year of experience as a Data Analyst. I specialize in turning 'messy' data into clear, actionable business intelligence with a focus on client satisfaction.",
  "contact": "Let's connect! You can use the contact form below, or reach out directly:\n• LinkedIn: linkedin.com/in/samaygupta24/\n• GitHub: github.com/Samay24",
  "resume": "My resume highlights my technical certifications and project metrics. You can download it using the button in the top navigation bar!",
  "sql": "I use SQL for complex data extraction and transformation. I'm comfortable with aggregations, window functions, and optimizing queries for large datasets.",
  "python": "In Python, I primarily use Pandas and NumPy for EDA (Exploratory Data Analysis). I also have experience with Matplotlib/Seaborn for custom data viz.",
  "power bi": "I build dynamic Power BI dashboards that feature automated data modeling, DAX measures, and interactive slicers for stakeholders.",
  "hiring": "I am currently open to freelance opportunities and full-time Data Analyst roles! I can help with dashboarding, data cleaning, or deep-dive analysis reports.",
  "default": "I'm currently running in 'Lite Mode' because my AI brain is resting. But I can still tell you about my SQL/Python skills, specific projects, or my availability for hire!"
};

const getFallbackResponse = (userText) => {
  const lowerText = userText.toLowerCase();
  for (const key in FALLBACK_RESPONSES) {
    if (lowerText.includes(key)) return FALLBACK_RESPONSES[key];
  }
  return FALLBACK_RESPONSES.default;
};

// --- SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
You are an AI assistant for Samay Gupta's portfolio. 
Samay is a Data Analyst with 1+ years of experience.
Your goal is to answer questions about Samay's skills, projects, and professional background.

TECHNICAL SKILLS: SQL (86%), Python (85%), Power BI (80%), Excel (90%).
FEATURED PROJECTS: iPhone Sales Analysis, IPL Historical Performance, Global E-commerce Insights.
TONE: Professional, helpful, concise.
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
      
      // Security Check: Log token status (NOT the token itself)
      console.log("Token check:", hfToken ? `Present (Starts with ${hfToken.substring(0, 3)}...)` : "MISSING");

      if (!hfToken) throw new Error("Hugging Face Token missing in .env");

      const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";
      
      console.log("Connecting to Hugging Face...");

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
