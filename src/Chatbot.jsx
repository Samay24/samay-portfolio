import { useState, useEffect, useRef, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { FaRobot, FaPaperPlane, FaMinus, FaCopy, FaTrash, FaDownload, FaRegCopy, FaCheck, FaVolumeUp, FaVolumeMute } from "react-icons/fa";
import { marked } from "marked";
import { GoogleGenerativeAI } from "@google/generative-ai";
import emailjs from "emailjs-com";

// --- MARKED CONFIGURATION ---
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
});

// --- FALLBACK RESPONSES (Enhanced) ---
const FALLBACK_RESPONSES = {
  "greeting": "Hi! 👋 I'm Samay's AI assistant. I can tell you all about his 1+ years of Data Analysis experience, his SQL/Python/Power BI skills, his projects like iPhone Sales Analysis and IPL Historical Dashboard, or his certifications from Oracle, IBM, AWS, and Databricks. What would you like to know?",
  "projects": "Samay has delivered high-impact data projects:\n\n1. **iPhone Sales Analysis** - Engineered a dynamic Power BI dashboard with automated data modeling and seasonal trend analysis to identify critical regional performance gaps, enabling data-driven inventory optimization.\n\n2. **IPL Historical Performance** - Analyzed 17+ years of complex cricket data with dynamic filtering for player achievements and team head-to-head metrics, uncovering hidden trends in player consistency for predictive performance modeling.\n\n3. **Global E-commerce Insights** - Visualized multi-dimensional datasets using advanced slicers and custom KPIs in Power BI, pinpointing high-cost shipping modes and supporting a **10% reduction in logistical overhead**.\n\n4. **Product Feedback Analysis** - Performed sentiment analysis on Zomato app reviews using NLP, thematic analysis, and sentiment scoring models. Found top 3 pain points and recommended app improvements boosting user satisfaction by **18%**.\n\n5. **Fraud Detection Analysis** - Performed comprehensive EDA using Python, Pandas, and Seaborn on 555K+ transactions, uncovering high-risk merchant categories and fraud patterns. Delivered actionable fraud prevention recommendations.",
  "skills": "Samay has a robust technical stack:\n\n• **SQL (86%)** - Advanced querying, Joins, CTEs, Window Functions, Optimization\n• **Python (85%)** - Data Analysis (Pandas, NumPy), Automation, Custom Visualizations\n• **Power BI (80%)** - Interactive Dashboards, Data Modeling, DAX Measures, Dynamic Slicers\n• **Excel (90%)** - Advanced Formulas, Pivot Tables, Business Intelligence\n• **Data Visualization (85%)** - Storytelling, Dashboard Design, KPI Tracking\n• **AI & Automation (75%)** - n8n workflows, Prompt Engineering, GenAI Fundamentals\n• **Data Storytelling (85%)** - Translating complex data into actionable narratives\n• **Research (80%)** - Market analysis, Competitive intelligence\n• **EDA (80%)** - Exploratory Data Analysis, pattern discovery, outlier detection\n• **Data Cleaning (85%)** - Handling missing values, outliers, data normalization\n• **Reporting & Dashboards (90%)** - KPI tracking, executive reports, interactive dashboards\n• **GitHub (80%)** - Version control, collaboration, CI/CD, repository management",
  "experience": "Samay has **1+ years of experience** as a Data Analyst. He specializes in turning raw, messy data into clear, actionable business intelligence with a focus on delivering measurable results. His approach: Think logically, analyze deeply, present clearly.",
  "certifications": "Samay holds several professional certifications:\n\n• **Oracle Cloud Infrastructure 2025 Certified AI Foundations Associate**\n• **Databricks Accreditation - Generative AI Fundamentals**\n• **AWS - Foundation of Prompt Engineering**\n• **IBM - Artificial Intelligence Fundamentals**\n• **Cisco - Introduction to Data Science**\n• **Analytics Vidhya - n8n Automation Tool**\n• **LinkedIn Learning** - Data Analytics & Business Analysis certifications",
  "hire": "Yes! Samay is **currently open to new opportunities** (Full-time, Contract, or Freelance).\n\nHe can help with:\n• Data Analysis & Exploration\n• Dashboard Design (Power BI, Excel)\n• Data Cleaning & Transformation (SQL, Python)\n• Automation (n8n, Python scripts)\n• Business Intelligence Reporting\n\n**Contact:** samaygupta963@email.com | +91-9157657443\n**LinkedIn:** linkedin.com/in/samaygupta24/\n**GitHub:** github.com/Samay24",
  "contact": "Let's connect! You can reach Samay via:\n\n• **Email:** samaygupta963@email.com\n• **Phone:** +91-9157657443\n• **LinkedIn:** linkedin.com/in/samaygupta24/\n• **GitHub:** github.com/Samay24\n\nOr use the contact form on this portfolio page!",
  "resume": "You can download Samay's latest resume using the **'Resume' button in the top navigation bar** of this portfolio, or directly from the Hero section!",
  "sql": "Samay uses SQL for complex data extraction, transformation, and optimization. He's proficient in:\n• Window Functions (ROW_NUMBER, RANK, LAG/LEAD)\n• Complex Aggregations & GROUP BY sets\n• CTEs & Recursive Queries\n• Query Optimization & Indexing Strategies\n• Subqueries & Correlated Subqueries",
  "python": "In Python, Samay uses:\n• **Pandas & NumPy** for EDA, cleaning, transformation\n• **Matplotlib, Seaborn, Plotly** for custom visualizations\n• **Automation scripts** for repetitive data tasks\n• **Jupyter Notebooks** for exploratory analysis\n• **scikit-learn** for basic ML modeling",
  "power bi": "Samay builds interactive Power BI dashboards featuring:\n• Automated Data Modeling (Star Schema)\n• Complex DAX Measures & Calculated Columns\n• Dynamic Slicers & Bookmarks for deep-dive analysis\n• Row-Level Security (RLS)\n• Power Query (M) for ETL pipelines\n• Performance optimization with VertiPaq Analyzer",
  "services": "Samay offers freelance services:\n\n📊 **Data Analysis** - Comprehensive analysis to uncover trends, patterns, and insights\n📈 **Dashboard Design** - Interactive dashboards/reports using Power BI & Excel\n💡 **Data Insights Reports** - Clear, actionable insights from raw data\n\nUse the 'Inquire Now' buttons in the Services section or contact him directly!",
  "default": "I'm Samay's AI assistant. I can tell you about his:\n• **Technical Skills** (SQL, Python, Power BI, Excel, AI)\n• **Projects** (iPhone Sales, IPL Analysis, E-commerce, Feedback Analysis, Fraud Detection)\n• **Experience** (1+ years Data Analysis)\n• **Certifications** (Oracle, Databricks, AWS, IBM, Cisco)\n• **Services** (Data Analysis, Dashboards, Insights Reports)\n• **Hiring/Contact** info\n\nWhat would you like to know?"
};

// --- KEYWORD MATCHING FOR FALLBACK ---
const FALLBACK_KEYWORDS = {
  greeting: ["hi", "hello", "hey", "greetings", "howdy", "hi there"],
  projects: ["project", "portfolio", "work", "case study", "dashboard", "analysis"],
  skills: ["skill", "tech", "technology", "stack", "tool", "proficient", "expert", "know"],
  experience: ["experience", "background", "career", "year", "worked"],
  certifications: ["certif", "certificate", "badge", "credential", "accreditation"],
  hire: ["hire", "job", "opportunity", "work", "freelance", "contract", "available"],
  contact: ["contact", "email", "phone", "call", "reach", "linkedin", "github"],
  resume: ["resume", "cv", "download"],
  sql: ["sql", "query", "database", "join", "cte", "window function"],
  python: ["python", "pandas", "numpy", "script", "jupyter", "sklearn"],
  "power bi": ["power bi", "powerbi", "dax", "dashboard", "visualization", "report"],
  services: ["service", "freelance", "offer", "consulting", "help with"]
};

const getFallbackResponse = (userText, conversationHistory = []) => {
  const lowerText = userText.toLowerCase();
  
  // Check for greeting first (only if it's the first message or a clear greeting)
  if (conversationHistory.length <= 1) {
    for (const keyword of FALLBACK_KEYWORDS.greeting) {
      if (lowerText.includes(keyword)) return FALLBACK_RESPONSES.greeting;
    }
  }
  
  // Prioritize hiring/contact
  for (const keyword of FALLBACK_KEYWORDS.hire) {
    if (lowerText.includes(keyword)) return FALLBACK_RESPONSES.hire;
  }
  for (const keyword of FALLBACK_KEYWORDS.contact) {
    if (lowerText.includes(keyword)) return FALLBACK_RESPONSES.contact;
  }
  
  // Check other categories
  for (const [category, keywords] of Object.entries(FALLBACK_KEYWORDS)) {
    if (category === 'greeting' || category === 'hire' || category === 'contact') continue;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) return FALLBACK_RESPONSES[category];
    }
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
- EDA (80%): Exploratory Data Analysis, pattern discovery, outlier detection.
- Data Cleaning (85%): Handling missing values, outliers, data normalization.
- Reporting & Dashboards (90%): KPI tracking, executive reports, interactive dashboards.
- GitHub (80%): Version control, collaboration, CI/CD, repository management.

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
4. Product Feedback Analysis: Sentiment analysis on Zomato reviews, boosting satisfaction by 18%.
5. Fraud Detection Analysis: EDA on 555K+ transactions using Python, Pandas, and Seaborn, uncovering fraud patterns and high-risk merchant categories.

FREELANCE SERVICES:
- Data Analysis
- Dashboard Design (Power BI, Excel)
- Data Insights Reports

TONE: Senior Professional, helpful, concise, and technically grounded.
Keep responses well-structured with markdown formatting.
`;

const QUICK_ACTIONS = [
  { label: "🛠️ Technical Skills", text: "What are your technical skills?" },
  { label: "📈 Detailed Projects", text: "Tell me about your data projects." },
  { label: "🤝 Hire Me", text: "Are you available for hire?" },
  { label: "📄 Get Resume", text: "How can I download your resume?" }
];

// --- UTILITY FUNCTIONS ---
const formatTime = (date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
};

const exportConversation = (messages) => {
  const text = messages
    .filter(m => m.sender !== 'system')
    .map(m => `[${m.timestamp}] ${m.sender === 'user' ? 'You' : 'Assistant'}: ${m.text}`)
    .join('\n\n');
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `samay-chat-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      text: "Hi! 👋 I'm Samay's AI assistant. I can tell you about his data expertise, projects, or experience. What's on your mind?",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  // Lead capture state
  const [leadInfo, setLeadInfo] = useState({ name: '', email: '', phone: '' });
  const [leadCaptureStep, setLeadCaptureStep] = useState(null); // null, 'name', 'email', 'phone', 'done'
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, streamingText, scrollToBottom]);

  // Load conversation from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('samay-chat-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setMessages(parsed.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
          setShowQuickActions(false);
        }
      } catch (e) {
        console.error('Failed to load chat history:', e);
      }
    }
  }, []);

  // Save conversation to localStorage
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem('samay-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  // Build conversation history for API
  const buildConversationHistory = useCallback(() => {
    return messages
      .filter(m => m.sender !== 'system')
      .slice(-10) // Keep last 10 messages for context
      .map(m => `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}`)
      .join('\n');
  }, [messages]);

  const handleSend = async (text) => {
    const userText = text || inputValue;
    if (!userText.trim() || isStreaming) return;

    const userMessage = {
      id: Date.now(),
      text: userText,
      sender: "user",
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue("");
    setShowQuickActions(false);
    setIsStreaming(true);
    setStreamingText("");
    retryCountRef.current = 0;

    // Check if we should trigger lead capture (hiring, services, contact inquiries)
    const lowerText = userText.toLowerCase();
    const leadTriggerKeywords = ['hire', 'job', 'opportunity', 'freelance', 'contract', 'service', 'consult', 'work with', 'project for', 'inquire'];
    const shouldCaptureLead = leadTriggerKeywords.some(kw => lowerText.includes(kw)) && leadCaptureStep === null;

    if (shouldCaptureLead) {
      setLeadCaptureStep('name');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "Great! I'd love to connect you with Samay. First, what's your **name**?",
          sender: "bot",
          timestamp: new Date()
        }]);
        setIsStreaming(false);
      }, 500);
      return;
    }

    // Handle lead capture flow
    if (leadCaptureStep === 'name') {
      setLeadInfo(prev => ({ ...prev, name: userText }));
      setLeadCaptureStep('email');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `Thanks, **${userText}**! What's your **email address**?`,
          sender: "bot",
          timestamp: new Date()
        }]);
        setIsStreaming(false);
      }, 500);
      return;
    }

    if (leadCaptureStep === 'email') {
      setLeadInfo(prev => ({ ...prev, email: userText }));
      setLeadCaptureStep('phone');
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: "Perfect! And your **phone number** (optional, but helpful for quick follow-up)?",
          sender: "bot",
          timestamp: new Date()
        }]);
        setIsStreaming(false);
      }, 500);
      return;
    }

    if (leadCaptureStep === 'phone') {
      setLeadInfo(prev => ({ ...prev, phone: userText }));
      setLeadCaptureStep('done');

      // Send lead info to Samay via EmailJS
      try {
        await emailjs.send(
          import.meta.env.VITE_EMAILJS_SERVICE_ID,
          import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
          {
            user_name: leadInfo.name,
            user_email: leadInfo.email,
            user_phone: leadInfo.phone || 'Not provided',
            message: `New lead from chatbot!\n\nName: ${leadInfo.name}\nEmail: ${leadInfo.email}\nPhone: ${leadInfo.phone || 'Not provided'}\n\nInquiry: ${messages[messages.length - 1]?.text || userText}`
          },
          import.meta.env.VITE_EMAILJS_PUBLIC_KEY
        );
      } catch (e) {
        console.error('Failed to send lead email:', e);
      }

      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now(),
          text: `Thanks **${leadInfo.name}**! 🎉 Samay has received your details and will reach out to you soon at **${leadInfo.email}**${leadInfo.phone ? ` or ${leadInfo.phone}` : ''}.\n\nIn the meantime, feel free to ask me anything about his skills, projects, or experience!`,
          sender: "bot",
          timestamp: new Date()
        }]);
        setIsStreaming(false);
        // Reset lead capture after a delay
        setTimeout(() => {
          setLeadCaptureStep(null);
          setLeadInfo({ name: '', email: '', phone: '' });
        }, 10000);
      }, 500);
      return;
    }

    // Create placeholder for bot response
    const botMessageId = Date.now() + 1;
    const botMessage = {
      id: botMessageId,
      text: "",
      sender: "bot",
      timestamp: new Date()
    };
    setMessages(prev => [...prev, botMessage]);

    const attemptRequest = async () => {
      try {
        const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

        if (!geminiKey || geminiKey === 'your_gemini_key') {
          throw new Error("Gemini API key not configured. Get a free key at https://aistudio.google.com/apikey");
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(geminiKey);
        const model = genAI.getGenerativeModel({
          model: "gemini-1.5-flash",
          generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
            topP: 0.9,
          }
        });

        // Build conversation history for Gemini
        const history = messages
          .filter(m => m.sender !== 'system')
          .slice(-10)
          .map(m => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: [{ text: m.text }]
          }));

        // Add system prompt as first user message if history is empty
        const chatHistory = history.length > 0
          ? [{ role: 'user', parts: [{ text: SYSTEM_PROMPT }] }, { role: 'model', parts: [{ text: "Understood. I'm ready to help!" }] }, ...history]
          : [{ role: 'user', parts: [{ text: SYSTEM_PROMPT }] }, { role: 'model', parts: [{ text: "Understood. I'm ready to help!" }] }];

        const chat = model.startChat({ history: chatHistory });

        // Use streaming
        const result = await chat.sendMessageStream(userText);

        let fullResponse = "";

        for await (const chunk of result.stream) {
          const content = chunk.text();
          if (content) {
            fullResponse += content;
            setStreamingText(fullResponse);
            setMessages(prev => prev.map(m =>
              m.id === botMessageId ? { ...m, text: fullResponse } : m
            ));
          }
        }

        // Finalize
        setMessages(prev => prev.map(m =>
          m.id === botMessageId ? { ...m, text: fullResponse || "I couldn't generate a response." } : m
        ));
        setIsStreaming(false);
        setStreamingText("");

      } catch (error) {
        console.error("Chatbot Error:", error);

        // Retry logic
        if (retryCountRef.current < maxRetries && !error.name === 'AbortError') {
          retryCountRef.current++;
          await new Promise(r => setTimeout(r, 1000 * retryCountRef.current));
          return attemptRequest();
        }

        // Fallback response
        const fallbackResponse = getFallbackResponse(userText, messages);
        setMessages(prev => prev.map(m =>
          m.id === botMessageId ? { ...m, text: fallbackResponse } : m
        ));
        setIsStreaming(false);
        setStreamingText("");
      }
    };

    await attemptRequest();
  };

  const handleClearConversation = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([
      { 
        id: Date.now(), 
        text: "Hi! 👋 I'm Samay's AI assistant. I can tell you about his data expertise, projects, or experience. What's on your mind?", 
        sender: "bot",
        timestamp: new Date()
      }
    ]);
    setShowQuickActions(true);
    localStorage.removeItem('samay-chat-history');
    setIsStreaming(false);
    setStreamingText("");
  };

  const handleExportConversation = () => {
    exportConversation(messages);
  };

  const handleCopyMessage = async (text, id) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleQuickAction = (text) => {
    handleSend(text);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chatbot-container">
      <style jsx>{`
        .chatbot-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          font-family: inherit;
        }
        .chat-bubble {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 32px rgba(56, 189, 248, 0.4);
          color: white;
          transition: all 0.3s ease;
        }
        .chat-bubble:hover {
          transform: scale(1.1);
          box-shadow: 0 12px 40px rgba(56, 189, 248, 0.5);
        }
        .chat-bubble svg {
          width: 28px;
          height: 28px;
        }
        .chat-window {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 380px;
          max-height: 600px;
          background: var(--card-bg, #1e293b);
          border: 1px solid var(--border-color, #334155);
          border-radius: 16px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .chat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          background: var(--header-bg, #0f172a);
          border-bottom: 1px solid var(--border-color, #334155);
        }
        .header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .bot-icon {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
        .header-info span {
          font-weight: 600;
          font-size: 15px;
          color: var(--text-primary, #f1f5f9);
        }
        .header-actions {
          display: flex;
          gap: 8px;
        }
        .header-actions button {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: none;
          background: var(--input-bg, #1e293b);
          color: var(--text-secondary, #94a3b8);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .header-actions button:hover {
          background: var(--hover-bg, #334155);
          color: var(--text-primary, #f1f5f9);
        }
        .chat-messages {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .message {
          display: flex;
          flex-direction: column;
          gap: 4px;
          max-width: 85%;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .message.user {
          align-self: flex-end;
          align-items: flex-end;
        }
        .message.bot {
          align-self: flex-start;
          align-items: flex-start;
        }
        .message-content {
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.6;
          position: relative;
        }
        .message.user .message-content {
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          color: white;
          border-bottom-right-radius: 4px;
        }
        .message.bot .message-content {
          background: var(--input-bg, #1e293b);
          color: var(--text-primary, #f1f5f9);
          border: 1px solid var(--border-color, #334155);
          border-bottom-left-radius: 4px;
        }
        .message-content pre {
          background: #0f172a;
          border-radius: 8px;
          padding: 12px;
          overflow-x: auto;
          margin: 8px 0;
          font-size: 12px;
        }
        .message-content code {
          font-family: 'Fira Code', 'Monaco', monospace;
        }
        .message-content pre code {
          background: transparent;
          padding: 0;
        }
        .message-content ul, .message-content ol {
          margin: 8px 0;
          padding-left: 20px;
        }
        .message-content li {
          margin: 4px 0;
        }
        .message-content strong {
          font-weight: 600;
        }
        .message-content a {
          color: #38bdf8;
          text-decoration: none;
        }
        .message-content a:hover {
          text-decoration: underline;
        }
        .message-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: var(--text-muted, #64748b);
        }
        .message.user .message-meta {
          justify-content: flex-end;
        }
        .message.bot .message-meta {
          justify-content: flex-start;
        }
        .message-actions {
          display: flex;
          gap: 4px;
          opacity: 0;
          transition: opacity 0.2s;
        }
        .message:hover .message-actions {
          opacity: 1;
        }
        .message-action-btn {
          width: 28px;
          height: 28px;
          border-radius: 6px;
          border: none;
          background: transparent;
          color: var(--text-muted, #64748b);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .message-action-btn:hover {
          background: var(--hover-bg, #334155);
          color: var(--text-primary, #f1f5f9);
        }
        .message-action-btn.copied {
          color: #22c55e;
        }
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 8px 12px;
        }
        .typing-indicator span {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #38bdf8;
          animation: typing 1.4s infinite ease-in-out;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        .quick-actions {
          padding: 0 16px 16px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .quick-action-btn {
          padding: 8px 14px;
          border-radius: 20px;
          border: 1px solid var(--border-color, #334155);
          background: var(--input-bg, #1e293b);
          color: var(--text-secondary, #94a3b8);
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .quick-action-btn:hover {
          border-color: #38bdf8;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
        }
        .chat-input {
          display: flex;
          gap: 10px;
          padding: 16px;
          border-top: 1px solid var(--border-color, #334155);
          background: var(--header-bg, #0f172a);
        }
        .chat-input input {
          flex: 1;
          padding: 12px 16px;
          border-radius: 24px;
          border: 1px solid var(--border-color, #334155);
          background: var(--input-bg, #1e293b);
          color: var(--text-primary, #f1f5f9);
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }
        .chat-input input:focus {
          border-color: #38bdf8;
        }
        .chat-input input::placeholder {
          color: var(--text-muted, #64748b);
        }
        .chat-input button {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: none;
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .chat-input button:hover:not(:disabled) {
          transform: scale(1.05);
          box-shadow: 0 4px 16px rgba(56, 189, 248, 0.4);
        }
        .chat-input button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chat-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 16px;
          border-top: 1px solid var(--border-color, #334155);
          background: var(--header-bg, #0f172a);
          font-size: 11px;
          color: var(--text-muted, #64748b);
        }
        .footer-actions {
          display: flex;
          gap: 8px;
        }
        .footer-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid var(--border-color, #334155);
          background: transparent;
          color: var(--text-secondary, #94a3b8);
          font-size: 11px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: all 0.2s;
        }
        .footer-btn:hover {
          border-color: #38bdf8;
          color: #38bdf8;
          background: rgba(56, 189, 248, 0.1);
        }
        .streaming-cursor {
          display: inline-block;
          width: 2px;
          height: 1em;
          background: #38bdf8;
          margin-left: 2px;
          animation: blink 1s infinite;
        }
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        @media (max-width: 480px) {
          .chat-window {
            width: calc(100vw - 32px);
            max-height: calc(100vh - 120px);
            bottom: 80px;
            right: -16px;
          }
          .chatbot-container {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>

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
            aria-label="Open chat"
          >
            <FaRobot />
          </Motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            className="chat-window"
            initial={{ y: 50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            role="dialog"
            aria-label="Chat with Samay's Assistant"
          >
            <div className="chat-header">
              <div className="header-info">
                <div className="bot-icon">
                  <FaRobot size={18} />
                </div>
                <span>Samay's Assistant</span>
              </div>
              <div className="header-actions">
                <button onClick={() => setIsOpen(false)} aria-label="Close chat">
                  <FaMinus size={16} />
                </button>
              </div>
            </div>

            <div className="chat-messages" ref={scrollRef}>
              {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.sender}`}>
                  <div className="message-content" dangerouslySetInnerHTML={{ __html: (msg.sender === 'bot' && isStreaming && msg.id === messages[messages.length - 1]?.id ? marked.parse(streamingText || msg.text) + '<span class="streaming-cursor"></span>' : marked.parse(msg.text)) }} />
                  <div className="message-meta">
                    <span>{formatTime(msg.timestamp)}</span>
                    <div className="message-actions">
                      {msg.sender === 'bot' && (
                        <>
                          <button
                            className={`message-action-btn ${copiedId === msg.id ? 'copied' : ''}`}
                            onClick={() => handleCopyMessage(msg.text, msg.id)}
                            aria-label={copiedId === msg.id ? "Copied!" : "Copy message"}
                          >
                            {copiedId === msg.id ? <FaCheck size={14} /> : <FaRegCopy size={14} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {isStreaming && (
                <div className="message bot">
                  <div className="message-content typing">
                    <div className="typing-indicator">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {showQuickActions && messages.length < 8 && (
              <div className="quick-actions">
                {QUICK_ACTIONS.map(action => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.text)}
                    className="quick-action-btn"
                    disabled={isStreaming}
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
                onKeyDown={handleKeyDown}
                disabled={isStreaming}
                aria-label="Message input"
                autoFocus
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isStreaming}
                aria-label="Send message"
              >
                <FaPaperPlane size={18} />
              </button>
            </form>

            <div className="chat-footer">
              <span>Powered by Google Gemini</span>
              <div className="footer-actions">
                <button className="footer-btn" onClick={handleExportConversation} aria-label="Export conversation">
                  <FaDownload size={12} /> Export
                </button>
                <button className="footer-btn" onClick={handleClearConversation} aria-label="Clear conversation">
                  <FaTrash size={12} /> Clear
                </button>
              </div>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}