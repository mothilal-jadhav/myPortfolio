const projects = [
    {
        title: 'Currency Converter',
        tag: 'React',
        desc: 'A currency conversion application.',
        link: '#',
    },
    {
        title: 'Tic Tac Toe',
        tag: 'React',
        desc: 'A two-player Tic Tac Toe game.',
        link: '#',
    },
];

export default function Home(){
    return (
    <>
      <nav id="navbar">
        <a href="#welcome-section" className="nav-logo">M.</a>
        <ul className="nav-links">
          <li><a href="#welcome-section">Home</a></li>
          <li><a href="#project-section">Work</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
 
      <main>
        <section id="welcome-section">
          <p className="eyebrow">Hello, I'm</p>
          <h1>Mothilal</h1>
          <p className="tagline">
            I build <span>responsible AI</span> and clean, human-first web experiences.
          </p>
          <a href="#project-section" className="btn">See my work ↓</a>
        </section>
 
        <section id="project-section">
          <h2 className="section-title">Selected Work</h2>
          <div className="project-grid">
            {projects.map((p) => (
              <a
                key={p.title}
                href={p.link}
                target="_blank"
                rel="noopener noreferrer"
                className="project-tile"
              >
                <span className="project-tag">{p.tag}</span>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <span className="project-cta">View project →</span>
              </a>
            ))}
          </div>
        </section>
 
        <section id="contact">
          <h2 className="section-title">Let's talk</h2>
          <p>Have an idea or a role in mind? I'd love to hear about it.</p>
          <div className="contact-links">
            <a
              id="profile-link"
              href="https://github.com/your-username"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/your-username"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a href="mailto:mothilal@ethika.co.in">Email</a>
          </div>
        </section>
      </main>
 
      <footer>
        <p>© {new Date().getFullYear()} Mothilal · Built with React</p>
      </footer>
    </>
  );
}