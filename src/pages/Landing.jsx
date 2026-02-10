import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

function typeWriter(el, text, speed, onDone) {
  if (!el) return;
  el.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else if (onDone) onDone();
  }
  type();
}

function useHeroTyping() {
  const [started, setStarted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStarted(true), 2500);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (!started) return;
    const titleEl = document.getElementById('catch_hero_title');
    const subtitleEl = document.getElementById('catch_hero_subtitle');
    const pillarsEl = document.getElementById('catch_hero_pillars_text');
    const titleCursor = document.querySelector('.catch_hero_name .catch_typing_cursor');
    const subCursor = document.querySelector('.catch_cursor_sub');
    if (!titleEl) return;

    const words = ['Confidence', 'Visualization', 'Experience'];
    let wordIndex = 0;
    const typeSpeed = 80;
    const eraseSpeed = 50;
    const pauseAfterType = 1800;
    const pauseAfterErase = 400;

    function pillarsCycle() {
      if (!pillarsEl) return;
      function typeWord(cb) {
        const word = words[wordIndex];
        let i = 0;
        function add() {
          if (i <= word.length) {
            pillarsEl.textContent = word.slice(0, i);
            i++;
            setTimeout(add, typeSpeed);
          } else setTimeout(cb, pauseAfterType);
        }
        add();
      }
      function eraseWord(cb) {
        const current = pillarsEl.textContent;
        let len = current.length;
        function remove() {
          if (len > 0) {
            pillarsEl.textContent = current.slice(0, len - 1);
            len--;
            setTimeout(remove, eraseSpeed);
          } else {
            wordIndex = (wordIndex + 1) % words.length;
            setTimeout(cb, pauseAfterErase);
          }
        }
        remove();
      }
      function loop() {
        typeWord(() => eraseWord(() => loop()));
      }
      loop();
    }

    typeWriter(titleEl, 'CATCH MENU', 120, () => {
      if (titleCursor) titleCursor.style.visibility = 'hidden';
      setTimeout(() => {
        typeWriter(subtitleEl, 'A Modern Visual Menu Experience', 70, () => {
          if (subCursor) subCursor.style.visibility = 'hidden';
          setTimeout(pillarsCycle, 400);
        });
      }, 300);
    });
  }, [started]);
}

export default function Landing() {
  useHeroTyping();

  useEffect(() => {
    const scripts = ['/js/jquery.js', '/js/plugins.js', '/js/init.js'];
    let i = 0;
    function loadNext() {
      if (i >= scripts.length) return;
      const src = scripts[i++];
      const el = document.createElement('script');
      el.src = src;
      el.onload = loadNext;
      document.body.appendChild(el);
    }
    loadNext();
  }, []);

  useEffect(() => {
    const heroImg = document.querySelector('.grax_tm_hero .bg .image');
    if (heroImg) {
      const path = heroImg.getAttribute('data-img-url');
      if (path) heroImg.style.backgroundImage = `url(${path})`;
    }
  }, []);

  return (
    <div id="catch_landing" className="grax_tm_all_wrap" data-magic-cursor="" data-color="crimson">
      <div className="grax_tm_modalbox_news" style={{ display: 'none' }}>
        <div className="box_inner">
          <div className="close">
            <a href="#"><img className="svg" src="/img/svg/cancel.svg" alt="" /></a>
          </div>
          <div className="description_wrap scrollable"></div>
        </div>
      </div>

      <div className="grax_tm_topbar opened">
        <div className="container">
          <div className="topbar_inner">
            <div className="logo">
              <a className="dark" href="#home">CATCH MENU</a>
              <a className="light" href="#home">CATCH MENU</a>
            </div>
            <div className="menu">
              <ul className="anchor_nav">
                <li className="current"><a href="#home">Home</a></li>
                <li><a href="#how">How It Works</a></li>
                <li><a href="#benefits">Benefits</a></li>
                <li><a href="#include">What We Include</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grax_tm_mobile_menu">
        <div className="topbar_inner">
          <div className="container bigger">
            <div className="topbar_in">
              <div className="logo"><a href="#home">CATCH MENU</a></div>
              <div className="my_trigger">
                <div className="hamburger hamburger--collapse-r">
                  <div className="hamburger-box">
                    <div className="hamburger-inner"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="dropdown">
          <div className="container">
            <div className="dropdown_inner">
              <ul className="anchor_nav">
                <li><a href="#home">Home</a></li>
                <li><a href="#how">How It Works</a></li>
                <li><a href="#benefits">Benefits</a></li>
                <li><a href="#include">What We Include</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="grax_tm_hero" id="home">
        <div className="bg">
          <div className="image" data-img-url="/img/bg_image.png"></div>
          <div className="overlay"></div>
        </div>
        <div className="content">
          <div className="container">
            <div className="details catch_hero_details">
              <h1 className="name catch_hero_name">
                <span id="catch_hero_title"></span>
                <span className="catch_typing_cursor">|</span>
              </h1>
              <span className="job catch_hero_job">
                <span id="catch_hero_subtitle"></span>
                <span className="catch_typing_cursor catch_cursor_sub">|</span>
              </span>
              <p className="catch_hero_pillars">
                <span id="catch_hero_pillars_text"></span>
                <span className="catch_typing_cursor catch_cursor_pillars">|</span>
              </p>
            </div>
            <div className="grax_tm_down" data-skin="light">
              <div className="line_wrapper">
                <div className="line"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grax_tm_section catch_pitch_section">
        <div className="container">
          <div className="catch_pitch_inner wow fadeInUp" data-wow-duration="0.8s">
            <p className="catch_pitch_lead">
              Your customers can <strong>see their dish before they order</strong>—photos and, for signature items, in <span className="catch_pitch_highlight">real life size</span> right on the table. No more guessing. No more doubts. They see the real thing. <em>How good is that?</em>
            </p>
          </div>
        </div>
      </div>

      <div className="grax_tm_section catch_how_section" id="how">
        <div className="container">
          <span className="catch_section_tag wow fadeInLeft" data-wow-duration="0.8s">User Journey</span>
          <div className="grax_tm_title_holder wow fadeInLeft" data-wow-duration="0.8s" data-wow-delay="0.1s">
            <h3>How <span>Catch Menu</span> Works</h3>
          </div>
          <p className="subtitle wow fadeInLeft" data-wow-duration="0.8s" data-wow-delay="0.15s">A seamless experience from table to decision. No app download required.</p>

          <div className="catch_steps_wrap">
            {[
              { num: '01', icon: '▦', title: 'Scan QR', desc: 'Customer scans code at the table' },
              { num: '02', icon: '◉', title: 'Menu Opens', desc: 'Instant access in phone browser' },
              { num: '03', icon: '⋔', title: 'Browse', desc: 'View prices & descriptions' },
              { num: '04', icon: '◫', title: 'Tap AR', desc: 'Select "View in AR" option', highlight: true },
              { num: '05', icon: '◎', title: 'Camera', desc: 'Phone camera activates', highlight: true },
              { num: '06', icon: '◐', title: 'Visualize', desc: 'See dish in real life size on the table', highlight: true },
            ].map((step) => (
              <div key={step.num} className={`catch_step ${step.highlight ? 'step_highlight' : ''} wow fadeInUp`} data-wow-duration="0.6s">
                <div className="step_num">Step {step.num}</div>
                <div className="step_icon">{step.icon}</div>
                <div className="step_title">{step.title}</div>
                <div className="step_desc">{step.desc}</div>
              </div>
            ))}
          </div>

          <div className="catch_outcome_bar wow fadeInUp" data-wow-duration="0.8s">
            <div className="outcome_icon"></div>
            <div className="outcome_text">
              <h4>The Outcome</h4>
              <p>Faster decision making and reduced order hesitation.</p>
            </div>
            <div className="outcome_quote">"Is this enough for one person?" — Answered instantly. See it in <strong>real life size</strong> before you order.</div>
          </div>
        </div>
      </div>

      <div className="grax_tm_section catch_benefits_section" id="benefits">
        <div className="container">
          <span className="catch_section_tag wow fadeInLeft" data-wow-duration="0.8s">Value Proposition</span>
          <div className="grax_tm_title_holder wow fadeInLeft" data-wow-duration="0.8s" data-wow-delay="0.1s">
            <h3>Business <span>Benefits</span> for Restaurants</h3>
          </div>
          <p className="intro_text wow fadeInLeft" data-wow-duration="0.8s" data-wow-delay="0.15s">Catch Menu directly improves the dining experience and drives revenue through better visualization.</p>

          <div className="catch_benefits_grid">
            {[
              { h: 'Increased Confidence', p: 'Customers who can see the food are more likely to order without hesitation or fear of disappointment.' },
              { h: 'Clear Portion Sizes', p: 'Visuals eliminate the guesswork. Guests know exactly if a dish is enough for one or meant to share.' },
              { h: 'Drive Premium Orders', p: 'Guests are more open to trying higher-value signature items when they can see the quality upfront.' },
              { h: 'Reduced Hesitation', p: 'Faster decision-making at the table means quicker turn times and a smoother flow for service.' },
              { h: 'Fewer Staff Questions', p: 'Reduces the need for servers to explain dish sizes or ingredients, freeing them to focus on hospitality.' },
              { h: 'Modern Experience', p: 'Positions your restaurant as innovative and forward-thinking, especially effective for first-time guests.' },
            ].map((b, i) => (
              <div key={i} className="catch_benefit_card wow fadeInUp" data-wow-duration="0.6s" data-wow-delay={`${0.1 + i * 0.05}s`}>
                <div className="card_icon"><img className="svg" src="/img/svg/checked.svg" alt="" /></div>
                <h4>{b.h}</h4>
                <p>{b.p}</p>
              </div>
            ))}
          </div>

          <div className="catch_bottom_line wow fadeInUp" data-wow-duration="0.8s">
            <svg className="bl_icon" viewBox="0 0 24 24" fill="currentColor"><path d="M13 3v10h8V3h-8zM3 21h8v-8H3v8zm0-10h8V3H3v8zm10 0h8V9h-8v2z"/></svg>
            <span className="bl_text">Visualization removes friction, leading to higher average order values.</span>
          </div>
        </div>
      </div>

      <div className="grax_tm_section catch_include_section" id="include">
        <div className="container">
          <div className="catch_include_single">
            <span className="catch_section_tag wow fadeInUp" data-wow-duration="0.8s">Service</span>
            <h3 className="big_title wow fadeInUp" data-wow-duration="0.8s" data-wow-delay="0.1s">What Catch Menu Includes</h3>
            <p className="body_text wow fadeInUp" data-wow-duration="0.8s" data-wow-delay="0.15s">We come to you, capture your dishes, and deliver a complete digital menu that we host. Here's what you get:</p>
            <ul className="catch_include_list">
              <li className="wow fadeInUp" data-wow-duration="0.6s" data-wow-delay="0.2s">
                <span className="bar_icon"></span>
                <div className="item_text">
                  <strong>We come and photograph your dishes</strong>
                  <span>Our team visits your restaurant to take professional photos of your dishes so they look premium and true to life.</span>
                </div>
              </li>
              <li className="wow fadeInUp" data-wow-duration="0.6s" data-wow-delay="0.25s">
                <span className="bar_icon"></span>
                <div className="item_text">
                  <strong>We come and capture AR of your dishes</strong>
                  <span>We visit you to create AR (augmented reality) versions of your signature dishes so guests can view them in real size on their table.</span>
                </div>
              </li>
              <li className="wow fadeInUp" data-wow-duration="0.6s" data-wow-delay="0.3s">
                <span className="bar_icon"></span>
                <div className="item_text">
                  <strong>A menu designed for you</strong>
                  <span>We build your menu from scratch—layout, design, and structure—aligned with your brand.</span>
                </div>
              </li>
              <li className="wow fadeInUp" data-wow-duration="0.6s" data-wow-delay="0.35s">
                <span className="bar_icon"></span>
                <div className="item_text">
                  <strong>An e-menu we host for you</strong>
                  <span>Your digital menu lives on our servers. We host it, keep it updated, and give you QR codes so customers can open it instantly—no app required.</span>
                </div>
              </li>
            </ul>
            <h3 className="big_title catch_deliver_title wow fadeInUp" data-wow-duration="0.8s" data-wow-delay="0.1s">How We Deliver</h3>
            <p className="body_text wow fadeInUp" data-wow-duration="0.8s" data-wow-delay="0.15s">We come to your restaurant to shoot your dishes and capture AR. You get a <strong style={{ color: '#630000' }}>clean, modern e-menu</strong> that we design and host—no technical work required from your team.</p>
            <div className="catch_ar_advantage wow fadeInUp" data-wow-duration="0.8s" data-wow-delay="0.2s">
              <svg className="ar_icon" width="48" height="48" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
              <h4>THE AR ADVANTAGE</h4>
              <p>For selected signature dishes, customers tap "View in AR" to see the dish in <strong>real life size</strong> on their table—no more guessing, no more doubts.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grax_tm_section catch_hosting_section" id="hosting">
        <div className="container">
          <div className="catch_pricing_block catch_pricing_hosting">
            <span className="catch_section_tag wow fadeInUp" data-wow-duration="0.8s">Implementation</span>
            <h3 className="wow fadeInUp" data-wow-duration="0.8s" data-wow-delay="0.1s">Hosting & Support</h3>
            <p className="pricing_intro wow fadeInUp" data-wow-duration="0.8s" data-wow-delay="0.15s">We host your e-menu on our servers and handle all technical updates so your team can focus on service.</p>
            <div className="catch_pricing_features_wrap">
              <div className="catch_pricing_feature wow fadeInUp" data-wow-duration="0.6s" data-wow-delay="0.2s">
                <div className="pf_icon">☷</div>
                <div className="pf_text">
                  <strong>Managed Hosting</strong>
                  <span>We host the digital menu on our secure servers ensuring instant load times.</span>
                </div>
              </div>
              <div className="catch_pricing_feature wow fadeInUp" data-wow-duration="0.6s" data-wow-delay="0.25s">
                <div className="pf_icon">▣</div>
                <div className="pf_text">
                  <strong>No App Required</strong>
                  <span>Zero friction. Customers access everything via browser. No downloads.</span>
                </div>
              </div>
              <div className="catch_pricing_feature wow fadeInUp" data-wow-duration="0.6s" data-wow-delay="0.3s">
                <div className="pf_icon">⇡</div>
                <div className="pf_text">
                  <strong>Scalable AR</strong>
                  <span>Start with signature dishes in AR and expand your visual menu over time.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grax_tm_section catch_pricing_section" id="pricing">
        <div className="container">
          <div className="catch_pricing_block catch_pricing_cta_block">
            <h3 className="wow fadeInUp" data-wow-duration="0.8s">Simple Pricing</h3>
            <div className="catch_price_phase wow fadeInUp" data-wow-duration="0.6s" data-wow-delay="0.1s">
              <div className="phase_label">Setup Phase</div>
              <div className="phase_text">One-time fee for <span className="highlight">Menu Design & AR Setup</span></div>
            </div>
            <div className="catch_price_phase wow fadeInUp" data-wow-duration="0.6s" data-wow-delay="0.15s">
              <div className="phase_label">Ongoing</div>
              <div className="phase_text">Small monthly cost for <span className="highlight">Hosting & Maintenance</span></div>
            </div>
            <a href="#contact" className="catch_cta_button wow fadeInUp" data-wow-duration="0.8s" data-wow-delay="0.2s">
              <span>
                Ready to see it live?
                <span className="cta_sub">Book a demo to see Catch Menu on a real table</span>
              </span>
              <span>→</span>
            </a>
          </div>
        </div>
      </div>

      <div className="grax_tm_contact" id="contact">
        <div className="container">
          <div className="grax_tm_title_holder">
            <h3>Get in <span>Touch</span></h3>
          </div>
          <div className="contact_inner">
            <div className="left wow fadeInLeft" data-wow-duration="1s">
              <div className="text">
                <p>Ready to upgrade your restaurant's menu experience? Get in touch for a demo or a custom quote. We're here to help you stand out.</p>
              </div>
              <div className="info_list">
                <ul>
                  <li>
                    <div className="list_inner">
                      <img className="svg" src="/img/svg/email.svg" alt="" />
                      <p><span className="first">Email:</span><span className="second"><a href="mailto:hello@catchmenu.com">hello@catchmenu.com</a></span></p>
                    </div>
                  </li>
                  <li>
                    <div className="list_inner">
                      <img className="svg" src="/img/svg/phone.svg" alt="" />
                      <p><span className="first">Phone:</span><span className="second"><a href="tel:+1234567890">+1 (234) 567-890</a></span></p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
            <div className="right wow fadeInLeft" data-wow-duration="1s" data-wow-delay=".2s">
              <div className="fields">
                <form action="/" method="post" className="contact_form" id="contact_form">
                  <div className="returnmessage" data-success="Your message has been received. We'll be in touch soon."></div>
                  <div className="empty_notice"><span>Please fill required fields</span></div>
                  <div className="first">
                    <ul>
                      <li><input id="name" type="text" placeholder="Your name" /></li>
                      <li><input id="email" type="text" placeholder="Email" /></li>
                    </ul>
                  </div>
                  <div className="last">
                    <textarea id="message" placeholder="Tell us about your restaurant or request a demo"></textarea>
                  </div>
                  <div className="grax_tm_button">
                    <a id="send_message" href="#">Send Message</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grax_tm_section">
        <div className="grax_tm_copyright">
          <div className="my_wave">
            <svg width="100%" height="100%" version="1.1" xmlns="http://www.w3.org/2000/svg">
              <path id="wave_img" data-color="#fff" d="M 0 185.609 C 317.17 118.136 634.33 151.87 951.5 185.609 1268.67 116.402 1585.83 47.195 1903 131.925 L 1903 507 L 0 507 Z" fill="#fff"></path>
            </svg>
          </div>
          <div className="container">
            <div className="copyright_inner">
              <div className="logo wow fadeInLeft" data-wow-duration="1s">
                <span style={{ fontWeight: 700, fontSize: '18px', letterSpacing: '1px' }}>CATCH MENU</span>
              </div>
              <div className="social wow fadeInLeft" data-wow-duration="1s" data-wow-delay=".2s">
                <ul>
                  <li><a href="#"><img className="svg" src="/img/svg/social/facebook.svg" alt="" /></a></li>
                  <li><a href="#"><img className="svg" src="/img/svg/social/twitter.svg" alt="" /></a></li>
                  <li><a href="#"><img className="svg" src="/img/svg/social/instagram-2.svg" alt="" /></a></li>
                  <li><a href="#"><img className="svg" src="/img/svg/social/tik-tok.svg" alt="" /></a></li>
                </ul>
              </div>
              <div className="copy wow fadeInLeft" data-wow-duration="1s" data-wow-delay=".4s">
                <p>&copy; Catch Menu. All rights reserved.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mouse-cursor cursor-outer"></div>
      <div className="mouse-cursor cursor-inner"></div>
      <div className="progressbar">
        <a href="#"><span className="text">To Top</span></a>
        <span className="line"></span>
      </div>
    </div>
  );
}
