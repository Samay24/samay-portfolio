import { useState, useRef, useEffect } from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { Typewriter } from "react-simple-typewriter";
import emailjs from "emailjs-com";
import { motion as Motion, useInView } from "framer-motion";
import "./App.css";
import { FaGithub, FaLinkedin, FaDownload, FaPython, FaChartBar, FaChartPie, FaDatabase, FaRobot, FaExternalLinkAlt, FaFileExcel, FaCalculator } from "react-icons/fa";
import { SiPandas, SiNumpy, SiMysql } from "react-icons/si";

const SkillCard = ({ name, percent, icon: Icon }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const duration = 1000; // 1 second for animation
      const target = parseInt(percent);
      const stepTime = duration / target;
      
      const timer = setInterval(() => {
        start += 1;
        if (start > target) {
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [isInView, percent]);

  return (
    <div className="skill-card" ref={ref}>
      <div className="skill-icon-wrapper">
        <Icon className="skill-brand-icon" />
      </div>
      <div 
        className="circle" 
        style={{ 
          background: `conic-gradient(#38bdf8 ${count}%, rgba(255,255,255,0.08) 0%)` 
        }}
      >
        <span className="counter">{count}%</span>
      </div>
      <h3>{name}</h3>
    </div>
  );
};

const Section = ({ id, children, className = "" }) => {
  return (
    <Motion.section
      id={id}
      className={`section ${className}`}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {children}
    </Motion.section>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const form = useRef();

  const handleInquiry = (serviceName) => {
    const messageField = document.querySelector('textarea[name="message"]');
    if (messageField) {
      messageField.value = `Hi, I'm interested in your ${serviceName} service. Please let me know more details.`;
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const particlesInit = async (main) => {
    await loadFull(main);
  };

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      form.current,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    )
    .then(() => {
      alert("Message Sent Successfully!");
      form.current.reset();
    }, (error) => {
      console.error("EmailJS Error:", error);
      alert("Failed to send message. Please try again.");
    });
  };

  return (
    <div className={darkMode ? "dark" : "light"}>
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: false },
          particles: {
            number: { value: 60, density: { enable: true, value_area: 800 } },
            color: { value: ["#38bdf8", "#60a5fa"] },
            links: { 
              enable: true, 
              distance: 150, 
              color: "#38bdf8", 
              opacity: 0.2,
              width: 1
            },
            move: { 
              enable: true, 
              speed: 1, 
              direction: "none",
              random: true,
              straight: false,
              out_mode: "out",
              bounce: false,
            },
            opacity: { 
              value: 0.3, 
              random: true,
              anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false }
            },
            size: { 
              value: { min: 1, max: 3 },
              random: true,
              anim: { enable: true, speed: 2, size_min: 0.1, sync: false }
            },
          },
          interactivity: {
            events: {
              onhover: { enable: true, mode: "grab" },
              onclick: { enable: true, mode: "push" },
              resize: true,
            },
            modes: {
              grab: { distance: 140, line_linked: { opacity: 0.5 } },
              push: { particles_nb: 4 },
            },
          },
          retina_detect: true,
        }}
      />

      <nav>
        <div className="nav-links">
          <a href="#hero">Home</a>
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#projects">Projects</a>
          <a href="#services">Services</a>
          <a href="#contact">Contact</a>
        </div>

        <div className="nav-actions">
          <a href="/Samay_Gupta_Resume.pdf" download className="resume-btn">
            <FaDownload /> Resume
          </a>
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section id="hero" className="section hero">
        <Motion.div 
          className="hero-content"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <h1>Hi, I'm Samay Gupta</h1>
          <p className="hero-subtitle">Data Analyst</p>
          <h2 className="hero-typewriter">
            <Typewriter
              words={[
                "Transforming raw data into actionable insights",
                "Building interactive dashboards that drive decisions",
                "Uncovering patterns others miss",
              ]}
              loop
              cursor
              cursorStyle="_"
              typeSpeed={50}
              deleteSpeed={40}
              delaySpeed={2000}
            />
          </h2>
          <div className="hero-cta">
            <a href="#projects" className="cta-primary">View My Work</a>
            <a href="#contact" className="cta-secondary">Get In Touch</a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="stat-value">1+</span>
              <span className="stat-label">Years Experience</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">2</span>
              <span className="stat-label">Projects Delivered</span>
            </div>
            <div className="hero-stat">
              <span className="stat-value">99%</span>
              <span className="stat-label">Client Satisfaction</span>
            </div>
          </div>
          <div className="hero-social">
            <a href="https://github.com/Samay24" target="_blank" rel="noopener noreferrer" className="social-link github" aria-label="GitHub Profile">
              <FaGithub />
            </a>
            <a href="https://www.linkedin.com/in/samaygupta24/" target="_blank" rel="noopener noreferrer" className="social-link linkedin" aria-label="LinkedIn Profile">
              <FaLinkedin />
            </a>
          </div>
        </Motion.div>
      </section>

      {/* ABOUT */}
      <Section id="about">
        <div className="section-content about-container">
          <div className="photo-wrapper">
            <img src="/profile.png" alt="Samay Gupta" />
            <div className="photo-glow"></div>
          </div>

          <div className="about-text">
            <h2>About Me</h2>
            <p>
              I'm a Data Analyst who transforms data into insights, and insights into decisions.
            </p>
            <p>
              Data is everywhere—but insights are rare. I help bridge that gap by turning raw, messy data into meaningful, actionable intelligence.
            </p>
            <p>
              I specialize in SQL, Python, Excel, and data visualization tools to uncover patterns, build dashboards, and solve real-world business problems.
            </p>
            <div className="about-highlights">
              <p><span>🎯 What I Do Best:</span> Finding patterns others miss and turning them into clear insights.</p>
              <p><span>📊 My Approach:</span> Think logically, analyze deeply, and present data clearly.</p>
              <p><span>👥 Who It's For:</span> Built for everyone to see, understand, and make smarter decisions.</p>
              <p><span>✨ My Goal:</span> Make data simple, powerful, and impactful.</p>
            </div>
          </div>
        </div>
      </Section>

      {/* SKILLS */}
      <Section id="skills">
        <div className="section-content skills-premium">
          <h2>Technical Expertise</h2>
          <div className="skills-grid">
            <SkillCard name="SQL" percent="86" icon={SiMysql} />
            <SkillCard name="Python" percent="85" icon={FaPython} />
            <SkillCard name="Power BI" percent="80" icon={FaChartBar} />
            <SkillCard name="Excel" percent="90" icon={FaFileExcel} />
            <SkillCard name="Data Analysis" percent="85" icon={FaCalculator} />
            <SkillCard name="Pandas" percent="82" icon={SiPandas} />
            <SkillCard name="Data Visualization" percent="85" icon={FaChartPie} />
            <SkillCard name="AI" percent="75" icon={FaRobot} />
          </div>
        </div>
      </Section>

      {/* PROJECTS */}
      <Section id="projects">
        <div className="section-content">
          <h2>Featured Projects</h2>
          <div className="projects-grid">
            <div className="project-card">
              <img src="/project1.png" alt="Iphone Sales Analysis" />
              <div className="project-info">
                <h3>Iphone Sales Analysis</h3>
                <ul className="project-points">
                  <li><strong>Situation:</strong> Sales data across regions was static and difficult to interpret for stakeholders.</li>
                  <li><strong>Action:</strong> Engineered a dynamic Power BI dashboard with automated data modeling and seasonal trend analysis.</li>
                  <li><strong>Result:</strong> Identified critical regional performance gaps, enabling data-driven inventory optimization.</li>
                </ul>
                <div className="project-links centered">
                  <a href="https://github.com/Samay24/data-analysis_projects" target="_blank" rel="noopener noreferrer" className="github-link">
                    <FaGithub /> GitHub
                  </a>
                </div>
              </div>
            </div>
            <div className="project-card">
              <img src="/project2.png" alt="Ipl Analysis Dashboard" />
              <div className="project-info">
                <h3>IPL Historical Performance</h3>
                <ul className="project-points">
                  <li><strong>Situation:</strong> Needed to synthesize 17+ years of complex IPL cricket data into digestible insights.</li>
                  <li><strong>Action:</strong> Developed an interactive system with dynamic filtering for player achievements and team head-to-head metrics.</li>
                  <li><strong>Result:</strong> Uncovered hidden trends in player consistency used for predictive performance modeling.</li>
                </ul>
                <div className="project-links centered">
                  <a href="https://github.com/Samay24/data-analysis_projects" target="_blank" rel="noopener noreferrer" className="github-link">
                    <FaGithub /> GitHub
                  </a>
                </div>
              </div>
            </div>
            <div className="project-card">
              <img src="/project3.png" alt="E-commerce Sales Analysis" />
              <div className="project-info">
                <h3>Global E-commerce Insights</h3>
                <ul className="project-points">
                  <li><strong>Situation:</strong> Business struggled to identify specific drivers of regional profitability and shipping efficiency.</li>
                  <li><strong>Action:</strong> Visualized multi-dimensional datasets using advanced slicers and custom KPIs in Power BI.</li>
                  <li><strong>Result:</strong> Pinpointed high-cost shipping modes, supporting a 10% reduction in logistical overhead.</li>
                </ul>
                <div className="project-links centered">
                  <a href="https://github.com/Samay24/data-analysis_projects" target="_blank" rel="noopener noreferrer" className="github-link">
                    <FaGithub /> GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* FREELANCE SERVICES */}
      <Section id="services">
        <div className="section-content">
          <h2>Freelance Services</h2>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-icon">📊</div>
              <h3>Data Analysis</h3>
              <p>Comprehensive data analysis to uncover trends, patterns, and insights from your business data.</p>
              <div className="service-price"></div>
              <button onClick={() => handleInquiry("Data Analysis")}>Inquire Now</button>
            </div>
            <div className="service-card">
              <div className="service-icon">📈</div>
              <h3>Dashboard Design</h3>
              <p>Interactive dashboards and reports using Excel, Power BI  to visualize your KPIs.</p>
              <div className="service-price"></div>
              <button onClick={() => handleInquiry("Dashboard Design")}>Inquire Now</button>
            </div>
            <div className="service-card">
              <div className="service-icon">💡</div>
              <h3>Data Insights Report</h3>
              <p>Turn raw data into clear, actionable insights with a concise and impactful report.</p>
              <div className="service-price"></div>
              <button onClick={() => handleInquiry("Data Insights Report")}>Inquire Now</button>
            </div>
          </div>
        </div>
      </Section>

      {/* CONTACT */}
      <Section id="contact">
        <div className="section-content">
          <h2>Contact Me</h2>
          <form ref={form} onSubmit={sendEmail} className="contact-form">
            <input type="text" name="user_name" placeholder="Your Name" required />
            <input type="email" name="user_email" placeholder="Your Email" required />
            <textarea name="message" placeholder="Your Message" required />
            <button type="submit">Send Message</button>
          </form>
        </div>
      </Section>

      <footer style={{ textAlign: "center", padding: "40px 20px", opacity: 0.6 }}>
        © 2026 Samay Gupta | Data Analyst
      </footer>
    </div>
  );
}
