import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';
import { ChevronLeft, ChevronRight, ShieldAlert, Cpu, Network, FileJson, CheckCircle2, AlertTriangle, Lightbulb, Maximize, User, Folder, FileText, Terminal, HelpCircle, Brain, TrendingUp, EyeOff, Cloud } from 'lucide-react';
import './App.css'; // Just for standard imports if needed, though most styling is inline/index.css

// --- Slide Components ---

const SlideTitle = () => {
  const canvasRef = React.useRef(null);
  const animFrameRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width * window.devicePixelRatio;
      h = canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    // --- Particles (constellation nodes) ---
    const particleCount = 80;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (w / window.devicePixelRatio),
        y: Math.random() * (h / window.devicePixelRatio),
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.5,
        pulse: Math.random() * Math.PI * 2,
        type: Math.random() > 0.7 ? 'accent' : 'normal', // 30% are accent nodes
      });
    }

    // --- Data stream columns ---
    const streamCount = 6;
    const streams = [];
    const chars = '01▪▫◆◇●○□■△▲'.split('');
    for (let i = 0; i < streamCount; i++) {
      const col = [];
      const x = (w / window.devicePixelRatio) * (0.08 + Math.random() * 0.84);
      const speed = 0.4 + Math.random() * 0.6;
      const len = 8 + Math.floor(Math.random() * 12);
      for (let j = 0; j < len; j++) {
        col.push({
          x,
          y: -j * 18 - Math.random() * 200,
          char: chars[Math.floor(Math.random() * chars.length)],
          speed,
          opacity: 1 - j / len,
        });
      }
      streams.push(col);
    }

    // --- Hexagonal grid (subtle background pattern) ---
    const hexSize = 40;
    const hexPoints = [];
    const realW = w / window.devicePixelRatio;
    const realH = h / window.devicePixelRatio;
    for (let row = -1; row < realH / (hexSize * 1.5) + 1; row++) {
      for (let col = -1; col < realW / (hexSize * Math.sqrt(3)) + 1; col++) {
        const cx = col * hexSize * Math.sqrt(3) + (row % 2) * hexSize * Math.sqrt(3) / 2;
        const cy = row * hexSize * 1.5;
        hexPoints.push({ x: cx, y: cy, phase: Math.random() * Math.PI * 2 });
      }
    }

    // --- Concentric rings (center processing core) ---
    const centerX = realW / 2;
    const centerY = realH / 2;
    const rings = [
      { r: 120, speed: 0.3, dash: [4, 12], alpha: 0.12 },
      { r: 160, speed: -0.2, dash: [2, 8], alpha: 0.08 },
      { r: 200, speed: 0.15, dash: [6, 18], alpha: 0.06 },
      { r: 250, speed: -0.1, dash: [3, 15], alpha: 0.04 },
    ];

    let t = 0;

    const draw = () => {
      const rW = w / window.devicePixelRatio;
      const rH = h / window.devicePixelRatio;
      ctx.clearRect(0, 0, rW, rH);
      t += 0.008;

      // 1. Hex grid (very subtle)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.04)';
      ctx.lineWidth = 0.5;
      hexPoints.forEach(hp => {
        const pulse = Math.sin(t * 0.5 + hp.phase) * 0.02 + 0.04;
        ctx.strokeStyle = `rgba(59, 130, 246, ${pulse})`;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = Math.PI / 3 * k - Math.PI / 6;
          const px = hp.x + hexSize * 0.5 * Math.cos(angle);
          const py = hp.y + hexSize * 0.5 * Math.sin(angle);
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      });

      // 2. Concentric rings
      rings.forEach(ring => {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(t * ring.speed);
        ctx.strokeStyle = `rgba(59, 130, 246, ${ring.alpha})`;
        ctx.lineWidth = 1;
        ctx.setLineDash(ring.dash);
        ctx.beginPath();
        ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
      });

      // 3. Particles + constellation edges
      const connectionDist = 120;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < -10) p.x = rW + 10;
        if (p.x > rW + 10) p.x = -10;
        if (p.y < -10) p.y = rH + 10;
        if (p.y > rH + 10) p.y = -10;
      });

      // Draw edges
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.12;
            ctx.strokeStyle = `rgba(59, 130, 246, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      particles.forEach(p => {
        const glow = Math.sin(p.pulse) * 0.3 + 0.7;
        const isAccent = p.type === 'accent';
        const baseAlpha = isAccent ? 0.6 : 0.3;
        const color = isAccent ? `rgba(99, 102, 241, ${baseAlpha * glow})` : `rgba(59, 130, 246, ${baseAlpha * glow})`;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        if (isAccent) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(99, 102, 241, ${0.05 * glow})`;
          ctx.fill();
        }
      });

      // 4. Data streams
      ctx.font = '10px monospace';
      streams.forEach(col => {
        col.forEach(ch => {
          ch.y += ch.speed;
          if (ch.y > rH + 20) {
            ch.y = -20;
            ch.char = chars[Math.floor(Math.random() * chars.length)];
          }
          const fadeZone = rH * 0.15;
          let alpha = ch.opacity * 0.2;
          if (ch.y < fadeZone) alpha *= ch.y / fadeZone;
          if (ch.y > rH - fadeZone) alpha *= (rH - ch.y) / fadeZone;
          ctx.fillStyle = `rgba(59, 130, 246, ${Math.max(0, alpha)})`;
          ctx.fillText(ch.char, ch.x, ch.y);
        });
      });

      // 5. Scanning line (horizontal sweep)
      const scanY = (Math.sin(t * 0.4) * 0.5 + 0.5) * rH;
      const scanGrad = ctx.createLinearGradient(0, scanY - 1, 0, scanY + 1);
      scanGrad.addColorStop(0, 'rgba(59, 130, 246, 0)');
      scanGrad.addColorStop(0.5, 'rgba(59, 130, 246, 0.06)');
      scanGrad.addColorStop(1, 'rgba(59, 130, 246, 0)');
      ctx.fillStyle = scanGrad;
      ctx.fillRect(0, scanY - 30, rW, 60);

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
      {/* Canvas Background */}
      <canvas
        ref={canvasRef}
        style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0}}
      />

      {/* Center Content — no panel, text directly over canvas */}
      <div style={{zIndex: 1, textAlign: 'center', position: 'relative'}}>

        {/* Thin horizontal line above */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ width: '320px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)', margin: '0 auto 2rem' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.25em', marginBottom: '1.5rem' }}>
            Capstone Project
          </div>

          <h1 style={{fontSize: '4rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.04em', lineHeight: 1.1}}>
            AI CSPM{' '}
            <span style={{background: 'linear-gradient(135deg, #3b82f6, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              Overwatch
            </span>
          </h1>

          <p style={{fontSize: '1.15rem', color: '#64748b', maxWidth: '560px', margin: '0 auto', lineHeight: '1.6', fontWeight: '400'}}>
            Дослідження застосування LLM для автономної переоцінки ризиків безпеки в хмарному середовищі з урахуванням архітектурного контексту
          </p>
        </motion.div>

        {/* Thin horizontal line below */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
          style={{ width: '320px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)', margin: '2rem auto 0' }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#94a3b8', letterSpacing: '0.05em' }}
        >
          Dmytro Vorotyntsev
        </motion.div>

      </div>
    </div>
  );
};

const SlideProblem = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Проблема</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flexGrow: 1, paddingBottom: '1rem', alignItems: 'stretch'}}>
      
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem', color: '#ef4444'}}>
          <AlertTriangle size={28} style={{marginRight: '12px'}}/> Проблема
        </h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem'}}>
          <p style={{fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', margin: 0}}>
            <strong>Кіберзагрози еволюціонують</strong> надзвичайно швидко, а хмарні інфраструктури стають дедалі складнішими. Водночас ринок відчуває <strong>гострий дефіцит</strong> кваліфікованих інженерів з безпеки.
          </p>
          <p style={{fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', margin: 0}}>
            Для автоматизації компанії використовують інструменти керування захищеності хмарни (CSPM), зокрема <strong>AWS Security Hub, Prowler</strong>. Проте вони оцінюють ресурси <em>ізольовано</em>, не розуміючи загальної картини та архітектури.
          </p>
        </div>
        <div style={{padding: '1.25rem', background: 'rgba(239, 68, 68, 0.08)', borderLeft: '4px solid #ef4444', borderRadius: '0', marginTop: 'auto'}}>
          <p style={{margin: 0, color: '#b91c1c', fontWeight: '500', lineHeight: '1.6', fontSize: '1rem'}}>
            Після глибшого ручного аналізу зауваження часто виявляються false positives, оскільки не враховують бізнес-контекст, компенсуючі заходи чи архітектурні рішення.
          </p>
        </div>
      </div>

      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem', color: '#10b981'}}>
          <Lightbulb size={28} style={{marginRight: '12px'}}/> Ідея
        </h3>
        <p style={{fontSize: '1rem', color: '#475569', lineHeight: '1.7'}}>
          Перевірити, чи може ШІ аналізувати результати CSPM-сканувань разом із архітектурними діаграмами для:
        </p>
        <ul style={{marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', listStyle: 'none', padding: 0}}>
          <li style={{display: 'flex', alignItems: 'flex-start'}}>
            <CheckCircle2 color="#10b981" size={20} style={{marginRight: '12px', flexShrink: 0, marginTop: '2px'}} />
            <span style={{fontWeight: '500', color: '#0f172a', lineHeight: '1.5'}}>Автоматичного відсіювання помилкових спрацьовувань</span>
          </li>
          <li style={{display: 'flex', alignItems: 'flex-start'}}>
            <CheckCircle2 color="#10b981" size={20} style={{marginRight: '12px', flexShrink: 0, marginTop: '2px'}} />
            <span style={{fontWeight: '500', color: '#0f172a', lineHeight: '1.5'}}>Обґрунтованого коригування рівня ризику (NIST 800-53 Rev 5)</span>
          </li>
        </ul>
      </div>

    </div>
  </div>
);

const SlideQuestion = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Дослідницьке питання</h2>
    <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <div className="card" style={{position: 'relative', overflow: 'hidden', padding: '4rem 3rem', border: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', textAlign: 'center', maxWidth: '1000px'}}>
        
        {/* Decorative background element */}
        <div style={{position: 'absolute', top: '-20px', left: '-20px', opacity: '0.04'}}>
          <HelpCircle size={200} color="#8b5cf6" />
        </div>
        
        <div style={{position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <h3 style={{color: '#1e293b', fontSize: '1.8rem', lineHeight: '1.6', fontWeight: '500', margin: 0}}>
            Яким чином відрізняється здатність різних архітектур великих мовних моделей (LLM) ефективно виконувати роль <span style={{color: '#8b5cf6', fontWeight: '700'}}>контекстно-залежного хмарного аудитора</span>,
            забезпечуючи високу стабільність аналізу результатів CSPM-інструментів з урахуванням широкого архітектурного контексту для відсіювання хибних спрацьовувань та <span style={{color: '#8b5cf6', fontWeight: '700'}}>обґрунтованого коригування рівня ризику</span>?
          </h3>
        </div>
      </div>
    </div>
  </div>
);

const SlideTasks = ({ slideIndex }) => {
  const tasks = [
    "Автоматизувати розгортання тестової інфраструктури в AWS за допомогою Terraform",
    "Зібрати невідповідності конфігурацій за допомогою Prowler та AWS Security Hub CSPM",
    "Розробити універсальний промпт та пайплайн для LLM аналізу",
    "Зібрати відповіді від LLM різного розміру та архітектури",
    "Провести порівняльний аналіз здатності різних моделей визначати false positives та коригувати ризик"
  ];

  return (
    <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <h2>{slideIndex}. Завдання дослідження</h2>
      <div style={{flexGrow: 1, display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', alignContent: 'center', paddingBottom: '2rem'}}>
        {tasks.map((task, index) => (
          <div key={index} className="card" style={{
            width: 'calc(33.333% - 1rem)', 
            minWidth: '260px', 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '2rem 1.5rem',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              fontSize: '6rem', 
              fontWeight: '900', 
              color: 'rgba(59, 130, 246, 0.04)', 
              position: 'absolute', 
              bottom: '-20px', 
              right: '-10px',
              lineHeight: 1,
              userSelect: 'none'
            }}>
              {index + 1}
            </div>
            <div style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', position: 'relative', zIndex: 1}}>
              <div style={{
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                background: '#eff6ff', 
                color: '#3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginRight: '12px',
                border: '1px solid #bfdbfe'
              }}>
                {index + 1}
              </div>
              <div style={{height: '2px', flexGrow: 1, background: 'linear-gradient(90deg, #bfdbfe 0%, transparent 100%)'}}></div>
            </div>
            <p style={{fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', margin: 0, position: 'relative', zIndex: 1}}>
              {task}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const SlideHypothesis = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Висунуті гіпотези</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', flexGrow: 1, paddingBottom: '1rem', alignItems: 'stretch'}}>
      
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem', color: '#3b82f6'}}>
          <TrendingUp size={28} style={{marginRight: '12px'}}/> 1. Консистентність рішень
        </h3>
        <p style={{fontSize: '1rem', color: '#475569', lineHeight: '1.7'}}>
          Моделі з великим контекстним вікном і високими показниками <strong>Reasoning</strong> зможуть досягти <span style={{color: '#2563eb', fontWeight: '700'}}>Decision Consistency &gt; 80%</span> при аналізі архітектурного контексту.
        </p>
        <div style={{marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.08)', borderLeft: '4px solid #3b82f6', borderRadius: '0'}}>
          <p style={{margin: 0, color: '#1d4ed8', fontWeight: '500', lineHeight: '1.6'}}>
            Це дозволить перейти на автоматичне опрацювання ризикованих коригувань, суттєво зменшуючи навантаження на спеціаліста.
          </p>
        </div>
        <p style={{fontSize: '0.95rem', color: '#64748b', lineHeight: '1.6', marginTop: '1.5rem'}}>
          Натомість менші моделі будуть схильні до галюцинацій та екстремумів (впевненість 0% або 100% при хибних відповідях).
        </p>
      </div>

      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem', color: '#f59e0b'}}>
          <EyeOff size={28} style={{marginRight: '12px'}}/> 2. Аналіз в умовах обмежених даних
        </h3>
        <p style={{fontSize: '1rem', color: '#475569', lineHeight: '1.7'}}>
          Під час аналізу ШІ передаються лише результати сканування (Prowler, Security Hub) та архітектурний контекст (опис, зображення або draw.io XML).
        </p>
        <div style={{marginTop: '1.5rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.08)', borderLeft: '4px solid #f59e0b', borderRadius: '0'}}>
          <p style={{margin: 0, color: '#b45309', fontWeight: '500', lineHeight: '1.6'}}>
            Аналіз проводиться <strong>без доступу до вихідного коду</strong> конфігурацій (Terraform тощо), імітуючи умови обмеженого доступу аудитора.
          </p>
        </div>
      </div>

    </div>
  </div>
);

const SlideConstraints = ({ slideIndex }) => (
  <div className="slide-content">
    <h2>{slideIndex}. Технічні специфікації</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem'}}><Cpu size={24} color="#3b82f6" style={{marginRight: '12px'}}/> Топові моделі</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
          {['anthropic/claude-sonnet-4.6', 'anthropic/claude-haiku-4.5', 'openai/gpt-5-mini', 'openai/gpt-4o-mini', 'google/gemini-3.1-pro-preview', 'google/gemini-3.5-flash'].map(model => (
            <span key={model} style={{padding: '6px 12px', background: 'rgba(59, 130, 246, 0.08)', color: '#2563eb', fontSize: '0.85rem', fontWeight: '500', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
              {model}
            </span>
          ))}
        </div>
      </div>
      
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem'}}><Cpu size={24} color="#10b981" style={{marginRight: '12px'}}/> Open Source</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
          {['meta-llama/llama-4-scout', 'deepseek/deepseek-v4-flash', 'qwen/qwen3.7-plus', 'google/gemma-4-31b-it', 'z-ai/glm-5.1', 'moonshotai/kimi-k2.7-code', 'xiaomi/mimo-v2.5-pro'].map(model => (
            <span key={model} style={{padding: '6px 12px', background: 'rgba(16, 185, 129, 0.08)', color: '#059669', fontSize: '0.85rem', fontWeight: '500', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
              {model}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{gridColumn: '1 / -1'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem'}}><ShieldAlert size={24} color="#f59e0b" style={{marginRight: '12px'}}/>Технічні параметри</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '2rem'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold'}}>Хмара</span>
            <span style={{fontWeight: '600'}}>AWS</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold'}}>Конфігурація</span>
            <span style={{fontWeight: '600'}}>Terraform</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold'}}>Фреймворк безпеки</span>
            <span style={{fontWeight: '600'}}>NIST 800-53 Rev. 5 (НД ТЗІ 3.6-006-24)</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold'}}>CSPM</span>
            <span style={{fontWeight: '600'}}>Prowler, AWS Security Hub</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold'}}>LLM API</span>
            <span style={{fontWeight: '600'}}>OpenRouter</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold'}}>Температура</span>
            <span style={{fontWeight: '600'}}>0.1</span>
          </div>
          <div style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
            <span style={{fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold'}}>Ітерації</span>
            <span style={{fontWeight: '600'}}>10-62</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const SlideArchitecture = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Архітектура тестової інфраструктури</h2>
    <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '0', padding: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
      <img src="./aws-multi-tier-architecture.drawio.png" alt="Architecture Diagram" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
    </div>
  </div>
);

const SlideDeploy = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Підготовка: Управління інфраструктурою</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexGrow: 1, paddingBottom: '1rem'}}>
      
      {/* Panel 1: AWS Profile */}
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#3b82f6'}}>
          <User size={20} style={{marginRight: '8px'}}/> AWS: Профіль Розгортання
        </h3>
        <p style={{fontSize: '0.9rem', color: '#475569', lineHeight: '1.5'}}>
          Для підготовки середовища використовується AWS-профіль із високими привілеями (наприклад, <strong>AdministratorAccess</strong>). Пайплайн автоматично використовує <code>boto3</code> та AWS CLI для розгортання інфраструктури.
        </p>
      </div>

      {/* Panel 2: ECC AWS Rulepack */}
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#10b981'}}>
          <Folder size={20} style={{marginRight: '8px'}}/> Джерело конфігурацій
        </h3>
        <p style={{fontSize: '0.9rem', color: '#475569', lineHeight: '1.5'}}>
          База вразливих конфігурацій — проєкт <strong>epam/ecc-aws-rulepack</strong>. Містить <code>red</code> (вразливі) та <code>green</code> (безпечні) Terraform модулі. Пайплайн гнучкий і підтримує будь-який валідний код.
        </p>
      </div>

      {/* Panel 3: Scenarios File */}
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#f59e0b'}}>
          <FileText size={20} style={{marginRight: '8px'}}/> Сценарій: aws_multi_tier
        </h3>
        <p style={{fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', marginBottom: '1rem'}}>
          Оркестрація запуску керується файлом <code>scenarios.yaml</code>. Для нашої діаграми ми зібрали відповідні вразливі конфігурації:
        </p>
        <pre style={{fontSize: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0', border: '1px solid #e2e8f0', color: '#0f172a', margin: 0, overflowX: 'auto'}}>
          name: aws_multi_tier_application<br/>
          tasks:<br/>
          &nbsp;&nbsp;- .../ecc-aws-066-eks_cluster_protected_endpoint_access/red<br/>
          &nbsp;&nbsp;- .../ecc-aws-111-alb_is_protected_by_waf_regional/red<br/>
          &nbsp;&nbsp;[... загалом ~35+ модулів]
        </pre>
      </div>

      {/* Panel 4: CLI Commands */}
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#8b5cf6'}}>
          <Terminal size={20} style={{marginRight: '8px'}}/> Команди Пайплайну
        </h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div>
            <span style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase'}}>Запуск конфігурації (Deploy)</span>
            <pre style={{fontSize: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0', border: '1px solid #e2e8f0', color: '#0f172a', marginTop: '0.5rem', margin: 0, overflowX: 'auto'}}>
              python pipeline/main.py deploy --scenario aws_multi_tier_application
            </pre>
          </div>
          <div>
            <span style={{fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase'}}>Знищення конфігурації (Destroy)</span>
            <pre style={{fontSize: '0.75rem', background: '#f8fafc', padding: '0.75rem', borderRadius: '0', border: '1px solid #e2e8f0', color: '#0f172a', marginTop: '0.5rem', margin: 0, overflowX: 'auto'}}>
              python pipeline/main.py destroy --scenario aws_multi_tier_application
            </pre>
          </div>
        </div>
      </div>

    </div>
  </div>
);

const SlideFindings = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Сканування: Керування захищеністю хмари (CSPM)</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexGrow: 1, paddingBottom: '1rem'}}>
      
      {/* Panel 1: Аудитор */}
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#3b82f6'}}>
          <User size={20} style={{marginRight: '8px'}}/> AWS: Профіль Аудитора
        </h3>
        <p style={{fontSize: '0.9rem', color: '#475569', lineHeight: '1.5'}}>
          Для отримання результатів сканування (findings) використовується окремий профіль із роллю <strong>Security Auditor</strong>. Це гарантує мінімальні необхідні привілеї (read-only) для збору метрик.
        </p>
      </div>

      {/* Panel 2: Prowler */}
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#10b981'}}>
          <Terminal size={20} style={{marginRight: '8px'}}/> Інструмент: Prowler
        </h3>
        <p style={{fontSize: '0.9rem', color: '#475569', lineHeight: '1.5'}}>
          Рішення, яке легко інтегрується в CI/CD пайплайни. Має різноманітні перевірки для AWS (та інших хмар), містить набір готових правил відповідності (включно з NIST). Виконує сканування <strong>під час запуску</strong>.
        </p>
      </div>

      {/* Panel 3: AWS Security Hub */}
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#f59e0b'}}>
          <Cloud size={20} style={{marginRight: '8px'}}/> Інструмент: AWS Security Hub
        </h3>
        <p style={{fontSize: '0.9rem', color: '#475569', lineHeight: '1.5'}}>
          Нативне рішення, що виконується повністю всередині AWS та використовує набір готових AWS Config Rules. Також доступний NIST compliance. Виконує <strong>періодичні перевірки</strong> по внутрішнім тригерам.
        </p>
      </div>

      {/* Panel 4: Збір Результатів */}
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#8b5cf6'}}>
          <Folder size={20} style={{marginRight: '8px'}}/> Обробка результатів
        </h3>
        <p style={{fontSize: '0.9rem', color: '#475569', lineHeight: '1.5'}}>
          Результати (CSPM findings) з обох інструментів агрегуються та зберігаються в локальній директорії проєкту для їхнього подальшого опрацювання LLM-моделями.
        </p>
      </div>

    </div>
  </div>
);

const SlideNormalization = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Нормалізація: Контекст високої щільності для LLM</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexGrow: 1, paddingBottom: '1rem'}}>
      
      {/* Panel 1: Raw Prowler */}
      <div className="card" style={{display: 'flex', flexDirection: 'column', padding: '1.25rem', overflow: 'hidden'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#f43f5e', fontSize: '1.1rem'}}>
          <FileJson size={20} style={{marginRight: '8px'}}/> Сирий об'єкт Prowler (надлишково)
        </h3>
        <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.4'}}>
          Оригінальні результати сканування містять багато метаданих, опису ризиків та кроків виправлення, що марно витрачає токени LLM.
        </p>
        <pre style={{flexGrow: 1, fontSize: '0.7rem', background: '#f8fafc', padding: '1rem', borderRadius: '0', border: '1px solid #e2e8f0', color: '#0f172a', margin: 0, overflowY: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
{`{
  "finding_info": {
    "desc": "**Amazon S3 buckets** are evaluated for...",
    "title": "S3 bucket has server access logging enabled",
    "types": [
      "Software and Configuration Checks/AWS Security...",
      "Software and Configuration Checks/Industry..."
    ],
    "uid": "prowler-aws-s3_bucket_server_access_logging_enabled-<REDACTED>-red"
  },
  "resources": [
    {
      "cloud_partition": "aws",
      "region": "us-east-1",
      "data": { 
        "metadata": {
          "arn": "arn:aws:s3:::012-bucket-5154844-red",
          ...
        }
      }
    }
  ],
  "risk_details": "Without access logs, object reads..."
}`}
        </pre>
      </div>

      {/* Panel 2: Normalized JSON */}
      <div className="card" style={{display: 'flex', flexDirection: 'column', padding: '1.25rem', overflow: 'hidden'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#10b981', fontSize: '1.1rem'}}>
          <CheckCircle2 size={20} style={{marginRight: '8px'}}/> Оптимізований квант інформації
        </h3>
        <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem', lineHeight: '1.4'}}>
          Уніфікований та максимально стиснутий формат. Містить лише ту інформацію, яка критична для аналізу контексту моделлю.
        </p>
        <pre style={{flexGrow: 1, fontSize: '0.8rem', background: '#f8fafc', padding: '1rem', borderRadius: '0', border: '1px solid #10b981', color: '#0f172a', margin: 0, overflowY: 'auto', boxShadow: 'inset 0 0 0 1px rgba(16, 185, 129, 0.2)', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
{`{
  "tool": "prowler",
  "finding_id": "s3_account_level_public_access_blocks",
  "resource_id": "arn:aws:s3:us-east-1:<REDACTED>:account",
  "original_severity": "HIGH",
  "description": "Block Public Access is not configured for the account <REDACTED>."
}`}
        </pre>
      </div>

    </div>
  </div>
);

const SlidePrompt = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Системний Prompt: Контекстне ядро</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexGrow: 1, paddingBottom: '1rem'}}>
      
      {/* Column 1: Role & Instructions */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        <div className="card" style={{padding: '1.25rem'}}>
          <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: '#3b82f6', fontSize: '1.1rem'}}>
            <Terminal size={20} style={{marginRight: '8px'}}/> Role & Task
          </h3>
          <p style={{fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0}}>
            <strong>Роль:</strong> Expert Cloud Security Architect and AWS Auditor.<br/>
            <strong>Завдання:</strong> Аналіз CSPM знахідок на фоні архітектурного контексту для визначення справжніх ризиків, хибних спрацювань (False Positives) або пом'якшених загроз.
          </p>
        </div>

        <div className="card" style={{padding: '1.25rem', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
          <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: '#10b981', fontSize: '1.1rem'}}>
            <CheckCircle2 size={20} style={{marginRight: '8px'}}/> Key Instructions
          </h3>
          <ul style={{fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', margin: 0, paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            <li><strong>Rule 1 (Analyze Context):</strong> Ретельно проаналізувати архітектурний контекст для розуміння мережевих потоків та бізнес-логіки ресурсів.</li>
            <li><strong>Rule 2 & 3 (Compensating Controls):</strong> Змінити критичність (Severity) або позначити як FP, якщо архітектура має компенсуючі механізми захисту.</li>
            <li><strong>Rule 4 (Strict JSON):</strong> Відповідати виключно у валідному JSON форматі згідно із заданою схемою (без додаткового тексту чи маркдауну).</li>
            <li><strong>Rule 5 (Token Optimization):</strong> Повертати лише ті знахідки, які <em>потребують коригування</em>. Пропускати незмінні.</li>
            <li><strong>Rule 6 (Avoid Extremes):</strong> Уникати крайнощів (0% або 100% коригувань). Оцінювати кожну знахідку індивідуально, уникаючи сліпого погодження чи відхилення.</li>
          </ul>
        </div>
      </div>

      {/* Column 2: Output Schema */}
      <div className="card" style={{display: 'flex', flexDirection: 'column', padding: '1.25rem'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '0.75rem', color: '#8b5cf6', fontSize: '1.1rem'}}>
          <FileJson size={20} style={{marginRight: '8px'}}/> Expected JSON Output
        </h3>
        <p style={{fontSize: '0.85rem', color: '#475569', marginBottom: '1rem', lineHeight: '1.4'}}>
          Модель зобов'язана відповісти строго за схемою, використовуючи заздалегідь визначені категорії коригувань (Adjustment Categories).
        </p>
        <pre style={{flexGrow: 1, fontSize: '0.7rem', background: '#f8fafc', padding: '1rem', borderRadius: '0', border: '1px solid #e2e8f0', color: '#0f172a', margin: 0, overflowY: 'auto'}}>
{`{
  "findings_analysis": [
    {
      "finding_id": "string",
      "resource_id": "string",
      "original_severity": "string",
      "adjusted_severity": "CRITICAL | HIGH | MEDIUM...",
      "is_false_positive": boolean,
      "adjustment_category": "COMPENSATING_CONTROL | 
                              ISOLATED_ENVIRONMENT | 
                              BUSINESS_REQUIREMENT | 
                              TOOL_INACCURACY | 
                              ACCEPTED_RISK | ...",
      "adjustment_reason": "Детальне обґрунтування..."
    }
  ]
}`}
        </pre>
      </div>

    </div>
  </div>
);

const SlideAnalysisPhases = ({ slideIndex }) => (
  <div className="slide-content">
    <h2>{slideIndex}. Етапи аналізу відповіді LLM</h2>
    <div className="funnel-container" style={{marginTop: '1rem'}}>
      <div className="funnel-stage" style={{width: '90%', background: '#e0f2fe', color: '#1e3a8a'}}>
        <strong>Етап 1: Фільтрація невдалих запусків</strong><br/>
        <span style={{fontSize: '0.9rem'}}>Перевірка на таймаути, помилки API, некоректний JSON, виявлення екстремумів (ZERO/ALL_ADJUSTED)</span>
      </div>
      <div style={{width: 0, height: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '20px solid #e0f2fe'}}></div>
      
      <div className="funnel-stage" style={{width: '75%', background: '#bfdbfe', color: '#1e3a8a'}}>
        <strong>Етап 2: Розрахунок KPI</strong><br/>
        <span style={{fontSize: '0.9rem'}}>Підрахунок токенів, часу виконання (Latency), Adjustment Rate та Decision Consistency</span>
      </div>
      <div style={{width: 0, height: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '20px solid #bfdbfe'}}></div>

      <div className="funnel-stage" style={{width: '60%', background: '#93c5fd', color: '#1e3a8a'}}>
        <strong>Етап 3: Порівняльний аналіз</strong><br/>
        <span style={{fontSize: '0.9rem'}}>Графічне представлення та порівняння параметрів моделей для кожного інструменту</span>
      </div>
      <div style={{width: 0, height: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '20px solid #93c5fd'}}></div>

      <div className="funnel-stage" style={{width: '45%', background: '#60a5fa', color: '#1e40af'}}>
        <strong>Етап 4: Висновки</strong><br/>
        <span style={{fontSize: '0.9rem'}}>Результат із найкращим показником співпадіння для кожного інструменту</span>
      </div>
    </div>
  </div>
);

const SlideResponse = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Переоцінка: LLM корегування ризику</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexGrow: 1, paddingBottom: '1rem'}}>
      
      {/* Code Snippet */}
      <div className="card" style={{display: 'flex', flexDirection: 'column', padding: '1.25rem', overflow: 'hidden'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#10b981', fontSize: '1.1rem'}}>
          <FileJson size={20} style={{marginRight: '8px'}}/> Вихідний JSON (LLM Output)
        </h3>
        <pre style={{flexGrow: 1, fontSize: '0.8rem', background: '#f8fafc', padding: '1rem', borderRadius: '0', border: '1px solid #10b981', color: '#0f172a', margin: 0, overflowY: 'auto', boxShadow: 'inset 0 0 0 1px rgba(16, 185, 129, 0.2)', whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
{`{
  "finding_id": "security-control/S3.17",
  "resource_id": "arn:aws:s3:::042-bucket-8007366-red",
  "original_severity": "MEDIUM",
  "adjusted_severity": "LOW",
  "is_false_positive": false,
  "adjustment_category": "COMPENSATING_CONTROL",
  "adjustment_reason": "The bucket is encrypted at rest with Amazon S3-managed keys (SSE-S3) and is not publicly accessible per the architecture. SSE-S3 satisfies the encryption requirement; KMS would be an additional key-management enhancement rather than a fix for unencrypted data."
}`}
        </pre>
      </div>

      {/* Anatomy of Decision */}
      <div className="card" style={{display: 'flex', flexDirection: 'column', padding: '1.25rem'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem', color: '#3b82f6', fontSize: '1.1rem'}}>
          <Brain size={20} style={{marginRight: '8px'}}/> Анатомія Рішення
        </h3>
        
        <div style={{display: 'flex', flexDirection: 'column', gap: '1.5rem'}}>
          
          {/* Було -> Стало */}
          <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
            <div style={{flex: 1, padding: '1rem', background: '#fef3c7', borderRadius: '0', border: '1px solid #fde68a', textAlign: 'center'}}>
              <div style={{fontSize: '0.85rem', color: '#b45309', marginBottom: '0.25rem'}}>Було (CSPM)</div>
              <div style={{fontWeight: 'bold', color: '#92400e', fontSize: '1.1rem'}}>MEDIUM</div>
            </div>
            
            <div style={{width: 0, height: 0, borderTop: '15px solid transparent', borderBottom: '15px solid transparent', borderLeft: '20px solid #d0f7beff'}}></div>
            
            <div style={{flex: 1, padding: '1rem', background: '#dcfce3', borderRadius: '0', border: '1px solid #bbf7d0', textAlign: 'center'}}>
              <div style={{fontSize: '0.85rem', color: '#166534', marginBottom: '0.25rem'}}>Стало (LLM)</div>
              <div style={{fontWeight: 'bold', color: '#15803d', fontSize: '1.1rem'}}>LOW</div>
            </div>
          </div>

          {/* Причина */}
          <div style={{background: 'rgba(59, 130, 246, 0.08)', borderRadius: '0', padding: '1.25rem', borderLeft: '4px solid #3b82f6'}}>
            <div style={{fontSize: '0.9rem', color: '#1d4ed8', fontWeight: 'bold', marginBottom: '0.5rem'}}>
              Категорія: COMPENSATING_CONTROL
            </div>
            <div style={{fontSize: '0.85rem', color: '#475569', fontWeight: 'bold', marginBottom: '0.25rem'}}>Причина:</div>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: 0, lineHeight: '1.5'}}>
              Модель виявила, що S3 бакет вже захищений базовим шифруванням (SSE-S3) і не є публічним згідно з архітектурою. Тому вимогу використання саме KMS класифіковано як додаткове покращення, а не вразливість.
            </p>
          </div>

        </div>
      </div>

    </div>
  </div>
);

const SlideQualityCheck = ({ slideIndex }) => {
  const [selectedImg, setSelectedImg] = useState(null);
  return (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Етап 1: Фільтрація невдалих запусків</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexGrow: 1, paddingBottom: '1rem', alignItems: 'stretch'}}>
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#3b82f6'}}>
          Відсіювання неякісних запусків
        </h3>
        <p style={{fontSize: '0.95rem', color: '#475569', lineHeight: '1.7', marginBottom: '1rem'}}>
          Модель вважається нестабільною та виключається з подальшого порівняння, якщо показник <strong>OK Status</strong> становить менше <strong>75.0%</strong>. Причини фейлів:
        </p>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
          <div style={{padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #dc2626'}}>
            <strong style={{fontSize: '0.85rem', color: '#991b1b'}}>TIMEOUT</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0'}}>Перевищено ліміт часу.</p>
          </div>
          <div style={{padding: '0.75rem', background: 'rgba(220, 38, 38, 0.05)', borderLeft: '3px solid #b91c1c'}}>
            <strong style={{fontSize: '0.85rem', color: '#991b1b'}}>API_ERROR</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0'}}>Помилка формату JSON або відмова API.</p>
          </div>
          <div style={{padding: '0.75rem', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid #f59e0b'}}>
            <strong style={{fontSize: '0.85rem', color: '#92400e'}}>ZERO_ADJUSTED / ALL_ADJUSTED</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0'}}>Вважаємо галюцинаціями (екстремуми).</p>
          </div>
        </div>
      </div>
      <div style={{background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-in'}} onClick={() => setSelectedImg('./1_filter_out_results_below_threshold.png')}>
        <img src="./1_filter_out_results_below_threshold.png" alt="Оцінка якості" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
      </div>
    </div>

    {/* Fullscreen Modal Overlay */}
    <AnimatePresence>
      {selectedImg && (
        <motion.div 
          initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
          style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'}} 
          onClick={() => setSelectedImg(null)}
        >
          <img src={selectedImg} style={{maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', background: 'white', padding: '1rem', borderRadius: '8px'}} />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)};

const SlideMetrics = ({ slideIndex }) => {
  const [selectedImg, setSelectedImg] = useState(null);
  return (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Етап 2: Розрахунок метрик</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexGrow: 1, paddingBottom: '1rem', alignItems: 'stretch'}}>

      {/* Left: Metrics descriptions */}
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#3b82f6'}}>
          <TrendingUp size={20} style={{marginRight: '8px'}}/> Оцінювані метрики
        </h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '1rem', flexGrow: 1}}>
          <div style={{padding: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid #10b981'}}>
            <strong style={{fontSize: '0.85rem', color: '#065f46'}}>Decision Consistency (%)</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0', lineHeight: '1.5'}}>Стабільність рішень моделі. Показує, наскільки часто модель для однієї і тієї ж знахідки (в різних запусках) повертає ідентичну оцінку.</p>
          </div>
          <div style={{padding: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', borderLeft: '3px solid #3b82f6'}}>
            <strong style={{fontSize: '0.85rem', color: '#1e40af'}}>Adjustment Rate (%)</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0', lineHeight: '1.5'}}>Відсоток знахідок CSPM, для яких LLM змінила критичність або позначила їх як False Positive.</p>
          </div>
          <div style={{padding: '0.75rem', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid #f59e0b'}}>
            <strong style={{fontSize: '0.85rem', color: '#92400e'}}>Ефективність та вартість</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0', lineHeight: '1.5'}}>Залежність між розміром контексту (вхідні токени), згенерованим виводом (вихідні токени) та швидкістю прийняття рішень (Latency).</p>
          </div>
        </div>
      </div>

      {/* Right: 3 actual images stacked */}
      <div style={{display: 'flex', flexDirection: 'column', gap: '0.5rem'}}>
        <div className="card" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '0.5rem', cursor: 'zoom-in'}} onClick={() => setSelectedImg('./2_decision_consistency.png')}>
          <img src="./2_decision_consistency.png" alt="Decision Consistency" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
        </div>
        <div className="card" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '0.5rem', cursor: 'zoom-in'}} onClick={() => setSelectedImg('./3_tokens_latency_adjustment-rate.png')}>
          <img src="./3_tokens_latency_adjustment-rate.png" alt="Tokens vs Latency" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
        </div>
        <div className="card" style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', padding: '0.5rem', cursor: 'zoom-in'}} onClick={() => setSelectedImg('./4_adjustment-rate_fluctuation.png')}>
          <img src="./4_adjustment-rate_fluctuation.png" alt="Adjustment Rate Fluctuation" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
        </div>
      </div>

    </div>

    {/* Fullscreen Modal Overlay */}
    <AnimatePresence>
      {selectedImg && (
        <motion.div 
          initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
          style={{position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out'}} 
          onClick={() => setSelectedImg(null)}
        >
          <img src={selectedImg} style={{maxWidth: '95%', maxHeight: '95%', objectFit: 'contain', background: 'white', padding: '1rem', borderRadius: '8px'}} />
        </motion.div>
      )}
    </AnimatePresence>
  </div>
)};

const SlideDashboardCharts = ({ chartData, slideIndex }) => (
  <div className="slide-content">
    <h2>{slideIndex}. Етап 3: Порівняльний аналіз</h2>
    <div className="chart-container" style={{height: '400px', background: 'white', padding: '1rem', borderRadius: '0'}}>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 11}} angle={-45} textAnchor="end" height={60} />
            <YAxis yAxisId="left" stroke="#64748b" tick={{fill: '#64748b'}} tickFormatter={(val) => `${val}%`} />
            <YAxis yAxisId="right" orientation="right" stroke="#dc2626" tick={{fill: '#dc2626'}} tickFormatter={(val) => `${val}%`} />
            <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '0' }}/>
            <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '20px'}}/>
            
            <Bar yAxisId="left" dataKey="prowler_adj" fill="#ef4444" name="Prowler Adj Rate" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar yAxisId="left" dataKey="sh_adj" fill="#8b5cf6" name="SecHub Adj Rate" radius={[4, 4, 0, 0]} barSize={20} />
            <Line yAxisId="right" type="monotone" dataKey="prowler_cons" stroke="#b91c1c" strokeWidth={3} name="Prowler Consistency" dot={{r: 6}} connectNulls />
            <Line yAxisId="right" type="monotone" dataKey="sh_cons" stroke="#4c1d95" strokeWidth={3} name="SecHub Consistency" dot={{r: 6, shape: 'square'}} connectNulls />
            <ReferenceLine yAxisId="right" y={80} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: '80% Threshold', fill: '#10b981', fontSize: 12, fontWeight: 'bold' }} strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      ) : <p>Loading chart data...</p>}
    </div>
  </div>
);

const catColors = {
  "BUSINESS_REQUIREMENT": {bg: "rgba(139, 92, 246, 0.1)", text: "#7c3aed"},
  "SENSITIVE_DATA_EXPOSURE": {bg: "rgba(239, 68, 68, 0.1)", text: "#dc2626"},
  "THIRD_PARTY_MANAGED": {bg: "rgba(245, 158, 11, 0.1)", text: "#d97706"},
  "COMPENSATING_CONTROL": {bg: "rgba(16, 185, 129, 0.1)", text: "#059669"},
  "ACCEPTED_RISK": {bg: "rgba(59, 130, 246, 0.1)", text: "#2563eb"},
  "TOOL_INACCURACY": {bg: "rgba(20, 184, 166, 0.1)", text: "#0d9488"},
  "DEFAULT": {bg: "rgba(100, 116, 139, 0.1)", text: "#475569"}
};
const getCatColor = (cat) => catColors[cat] || catColors.DEFAULT;

const SlideDashboardTable = ({ tableRows, slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Етап 4: Висновки щодо LLM-моделей</h2>
    <div className="table-container" style={{flexGrow: 1, overflowY: 'auto', background: 'white', borderRadius: '0', border: '1px solid #e2e8f0', minHeight: 0}}>
      <table style={{width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem'}}>
        <thead style={{position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1}}>
          <tr style={{borderBottom: '2px solid rgba(0,0,0,0.05)'}}>
            <th style={{padding: '1rem', color: '#475569'}}>Інструмент</th>
            <th style={{padding: '1rem', color: '#475569'}}>Модель</th>
            <th style={{padding: '1rem', color: '#475569'}}>Консистентність</th>
            <th style={{padding: '1rem', color: '#475569', whiteSpace: 'nowrap', fontSize: '0.8rem'}}>Коригування&nbsp;(%)</th>
            <th style={{padding: '1rem', color: '#475569'}}>Токени</th>
            <th style={{padding: '1rem', color: '#475569', whiteSpace: 'nowrap', fontSize: '0.8rem'}}>Затримка&nbsp;(с)</th>
            <th style={{padding: '1rem', color: '#475569'}}>Категорії</th>
          </tr>
        </thead>
        <tbody>
          {tableRows.map((row, idx) => (
            <tr key={`${row.tool}-${row.model}`} style={{borderBottom: '1px solid rgba(0,0,0,0.05)', background: idx % 2 === 0 ? 'white' : '#f8fafc'}}>
              <td style={{padding: '0.75rem', fontWeight: '600', color: row.tool === 'Prowler' ? '#ef4444' : '#8b5cf6'}}>{row.tool}</td>
              <td style={{padding: '0.75rem', fontWeight: '500'}}>{row.model}</td>
              <td style={{padding: '0.75rem'}}>
                <span style={{background: row.decision_consistency >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: row.decision_consistency >= 80 ? '#059669' : '#d97706', padding: '2px 6px', borderRadius: '0', fontWeight: 'bold'}}>
                  {row.decision_consistency ? `${row.decision_consistency}%` : 'N/A'}
                </span>
              </td>
              <td style={{padding: '0.75rem'}}>{row.adjustment_rate}%</td>
              <td style={{padding: '0.75rem', color: '#64748b'}}>{row.total_tokens?.toLocaleString()}</td>
              <td style={{padding: '0.75rem', color: '#64748b'}}>{row.latency}</td>
              <td style={{padding: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '4px'}}>
                  {row.adjustment_categories && Object.entries(row.adjustment_categories).length > 0 ? 
                      Object.entries(row.adjustment_categories).map(([cat]) => {
                          const colorStyle = getCatColor(cat);
                          return (
                            <span key={cat} style={{fontSize: '0.7rem', padding: '2px 6px', background: colorStyle.bg, color: colorStyle.text, borderRadius: '0'}}>
                                {cat}
                            </span>
                          );
                      })
                  : <span style={{color: '#94a3b8', fontSize: '0.75rem'}}>None</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const SlideInsights = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Ключові висновки</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexGrow: 1, paddingBottom: '1rem', alignItems: 'stretch'}}>

      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#10b981'}}>
          <CheckCircle2 size={20} style={{marginRight: '8px'}}/> Топ Моделі
        </h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
          <div style={{padding: '0.75rem', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '3px solid #f59e0b'}}>
            <strong style={{fontSize: '0.85rem', color: '#92400e'}}>🏆 Безперечний лідер: gemma-4-31b-it</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0'}}>Для обох інструментів (Prowler та Security Hub) перетнула межу консистентності у 80%. Ідеальний варіант для розгортання On-Premise із гарантією захисту даних.</p>
          </div>
          <div style={{padding: '0.75rem', background: 'rgba(59, 130, 246, 0.05)', borderLeft: '3px solid #3b82f6'}}>
            <strong style={{fontSize: '0.85rem', color: '#1e40af'}}>⚡ Найшвидша: gemini-3.5-flash</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0'}}>Показала задовільні результати для обох CSPM. Її головна перевага — це надзвичайно висока швидкість генерації відповідей.</p>
          </div>
          <div style={{padding: '0.75rem', background: 'rgba(139, 92, 246, 0.05)', borderLeft: '3px solid #8b5cf6'}}>
            <strong style={{fontSize: '0.85rem', color: '#5b21b6'}}>💰 Найкраща ціна: gpt-4o-mini</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0'}}>Задовільна якість та консистентність. Ключовою перевагою є дуже низька ціна за токени порівняно з іншими платними моделями (наприклад, Gemini).</p>
          </div>
        </div>
      </div>

      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#f59e0b'}}>
          <TrendingUp size={20} style={{marginRight: '8px'}}/> Загальні тенденції
        </h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
          <div style={{padding: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid #10b981'}}>
            <strong style={{fontSize: '0.85rem', color: '#065f46'}}>🛡️ Security Hub vs Prowler</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0'}}>Рівень стабільності (Decision Consistency) для знахідок Security Hub загалом вищий, ніж для Prowler.</p>
          </div>
          <div style={{padding: '0.75rem', background: 'rgba(239, 68, 68, 0.05)', borderLeft: '3px solid #ef4444'}}>
            <strong style={{fontSize: '0.85rem', color: '#b91c1c'}}>📉 Коригування (Adjustment Rate)</strong>
            <p style={{fontSize: '0.85rem', color: '#475569', margin: '0.25rem 0 0'}}>Водночас, відсоток коригувань (Adjustment Rate) для Security Hub загалом є нижчим порівняно з Prowler.</p>
          </div>
        </div>
      </div>

    </div>
  </div>
);

const SlideValue = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Підсумок: Цінність дослідження</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', flexGrow: 1, paddingBottom: '1rem', alignItems: 'stretch'}}>

      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#3b82f6'}}>
          <Lightbulb size={20} style={{marginRight: '8px'}}/> Зниження ручного навантаження
        </h3>
        <p style={{fontSize: '0.95rem', color: '#475569', lineHeight: '1.7'}}>
          Дослідження наочно демонструє можливості та ефективність застосування LLM для автономної переоцінки ризиків з урахуванням архітектурного контексту.
        </p>
        <div style={{marginTop: '1.5rem', padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', borderLeft: '3px solid #3b82f6'}}>
          <p style={{fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', margin: 0}}>
            Це дасть можливість зменшити навантаження на спеціалістів: звести до мінімуму обсяг ручного аналізу в умовах критичної нестачі кваліфікованих кадрів.
          </p>
        </div>
      </div>

      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1rem', color: '#10b981'}}>
          <TrendingUp size={20} style={{marginRight: '8px'}}/> Мультиплікатор сил
        </h3>
        <p style={{fontSize: '0.95rem', color: '#475569', lineHeight: '1.7'}}>
          Інтеграція автономних LLM-аудиторів у щоденні процеси хмарної кібербезпеки виступає дієвим «мультиплікатором сил» для профільних команд та інженерів.
        </p>
        <div style={{marginTop: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '3px solid #10b981'}}>
          <p style={{fontSize: '0.9rem', color: '#334155', lineHeight: '1.6', margin: 0}}>
            Це забезпечує реальну, а не формальну (паперову) перевагу щодо застосування заходів захисту, дозволяючи фокусуватися виключно на справжніх загрозах.
          </p>
        </div>
      </div>

    </div>
  </div>
);

const SlideAppendix = ({ slideIndex }) => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>{slideIndex}. Додаток: Jupyter Notebook</h2>
    <div style={{flexGrow: 1, border: '1px solid #e2e8f0', overflow: 'hidden', background: '#fff', marginTop: '1rem'}}>
      <iframe src="./results_analysis.html" width="100%" height="100%" style={{border: 'none'}} title="Results Analysis Notebook"></iframe>
    </div>
  </div>
);

const SlideThankYou = () => {
  const canvasRef = React.useRef(null);
  const animFrameRef = React.useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h;

    const resize = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      w = canvas.width = rect.width * window.devicePixelRatio;
      h = canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const particleCount = 60;
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * (w / window.devicePixelRatio),
        y: Math.random() * (h / window.devicePixelRatio),
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
        pulse: Math.random() * Math.PI * 2,
        type: Math.random() > 0.7 ? 'accent' : 'normal',
      });
    }

    const hexSize = 40;
    const hexPoints = [];
    const realW = w / window.devicePixelRatio;
    const realH = h / window.devicePixelRatio;
    for (let row = -1; row < realH / (hexSize * 1.5) + 1; row++) {
      for (let col = -1; col < realW / (hexSize * Math.sqrt(3)) + 1; col++) {
        const cx = col * hexSize * Math.sqrt(3) + (row % 2) * hexSize * Math.sqrt(3) / 2;
        const cy = row * hexSize * 1.5;
        hexPoints.push({ x: cx, y: cy, phase: Math.random() * Math.PI * 2 });
      }
    }

    let t = 0;
    const draw = () => {
      const rW = w / window.devicePixelRatio;
      const rH = h / window.devicePixelRatio;
      ctx.clearRect(0, 0, rW, rH);
      t += 0.008;

      ctx.lineWidth = 0.5;
      hexPoints.forEach(hp => {
        const pulse = Math.sin(t * 0.5 + hp.phase) * 0.02 + 0.04;
        ctx.strokeStyle = `rgba(59, 130, 246, ${pulse})`;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const angle = Math.PI / 3 * k - Math.PI / 6;
          const px = hp.x + hexSize * 0.5 * Math.cos(angle);
          const py = hp.y + hexSize * 0.5 * Math.sin(angle);
          k === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      });

      const connectionDist = 110;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < -10) p.x = rW + 10;
        if (p.x > rW + 10) p.x = -10;
        if (p.y < -10) p.y = rH + 10;
        if (p.y > rH + 10) p.y = -10;
      });
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            ctx.strokeStyle = `rgba(59, 130, 246, ${(1 - dist / connectionDist) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => {
        const glow = Math.sin(p.pulse) * 0.3 + 0.7;
        const isAccent = p.type === 'accent';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * glow, 0, Math.PI * 2);
        ctx.fillStyle = isAccent ? `rgba(99, 102, 241, ${0.5 * glow})` : `rgba(59, 130, 246, ${0.25 * glow})`;
        ctx.fill();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };
    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  return (
    <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'}}>
      <canvas ref={canvasRef} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0}} />

      <div style={{zIndex: 1, textAlign: 'center', position: 'relative'}}>
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          style={{ width: '320px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)', margin: '0 auto 2rem' }}
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h1 style={{fontSize: '3.5rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.75rem', letterSpacing: '-0.04em', lineHeight: 1.1}}>
            Дякую за увагу!
          </h1>
          <p style={{fontSize: '1.15rem', color: '#64748b', maxWidth: '500px', margin: '0 auto', lineHeight: '1.6'}}>
            Оптимізуємо хмарну бепеку разом з LLM
          </p>
        </motion.div>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
          style={{ width: '320px', height: '1px', background: 'linear-gradient(90deg, transparent, rgba(59,130,246,0.4), transparent)', margin: '2rem auto 0' }}
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{ marginTop: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div style={{fontSize: '0.85rem', color: '#94a3b8', letterSpacing: '0.05em'}}>
            Dmytro Vorotyntsev
          </div>
          <a href="https://www.linkedin.com/in/dmytro-vorotyntsev/" target="_blank" rel="noopener noreferrer" style={{textDecoration: 'none'}}>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://www.linkedin.com/in/dmytro-vorotyntsev/')}&bgcolor=ffffff&color=334155&margin=0`}
              alt="LinkedIn QR"
              style={{width: '120px', height: '120px', border: '1px solid #e2e8f0', borderRadius: '0'}}
            />
          </a>
          <div style={{fontSize: '0.75rem', color: '#94a3b8'}}>LinkedIn</div>
        </motion.div>
      </div>
    </div>
  );
};

// --- Main Presentation Component ---

function App() {
  const [globalData, setGlobalData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const slideParam = params.get('slide');
    if (slideParam) {
      const idx = parseInt(slideParam, 10);
      return isNaN(idx) ? 0 : idx;
    }
    return 0;
  });

  useEffect(() => {
    const url = new URL(window.location);
    if (currentSlide === 0) {
      url.searchParams.delete('slide');
    } else {
      url.searchParams.set('slide', currentSlide.toString());
    }
    window.history.replaceState({}, '', url);
  }, [currentSlide]);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const slideParam = params.get('slide');
      const idx = slideParam ? parseInt(slideParam, 10) : 0;
      if (!isNaN(idx) && idx !== currentSlide) {
        setCurrentSlide(idx);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentSlide]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.error(err));
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    fetch('./summary.json?t=' + new Date().getTime())
      .then(res => res.json())
      .then(summaryJson => {
        setGlobalData(summaryJson || {});
        
        // Prepare Chart
        const cData = [];
        const modelNames = new Set();
        const tools = Object.keys(summaryJson || {});
        tools.forEach(tool => {
          if(summaryJson[tool]?.models_summary) {
              summaryJson[tool].models_summary.forEach(m => modelNames.add(m.model));
          }
        });
        Array.from(modelNames).forEach(model => {
          const prowler = summaryJson['prowler']?.models_summary.find(m => m.model === model) || {};
          const sh = summaryJson['securityhub']?.models_summary.find(m => m.model === model) || {};
          const pCons = prowler.decision_consistency || 0;
          const sCons = sh.decision_consistency || 0;
          cData.push({
            name: model,
            prowler_adj: prowler.adjustment_rate || 0,
            sh_adj: sh.adjustment_rate || 0,
            prowler_cons: pCons,
            sh_cons: sCons,
            sort_val: Math.max(pCons, sCons)
          });
        });
        
        cData.sort((a, b) => b.sort_val - a.sort_val);
        setChartData(cData);

        // Prepare Table
        const tRows = [];
        tools.forEach(tool => {
          const models = summaryJson[tool]?.models_summary || [];
          models.forEach(m => {
              tRows.push({ tool: tool, ...m });
          });
        });
        tRows.sort((a, b) => (b.decision_consistency || 0) - (a.decision_consistency || 0));
        setTableRows(tRows);

        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading data:", err);
        setLoading(false); // Let it show empty placeholders if no summary.json
      });
  }, []);

  const allSlides = [
    <SlideTitle key={0} />,
    <SlideProblem key={1} />,
    <SlideQuestion key={2} />,
    <SlideTasks key={3} />,
    <SlideHypothesis key={4} />,
    <SlideConstraints key={5} />,
    <SlideArchitecture key={6} />,
    <SlideDeploy key={7} />,
    <SlideFindings key={8} />,
    <SlideNormalization key={9} />,
    <SlidePrompt key={10} />,
    <SlideResponse key={11} />,
    <SlideAnalysisPhases key={12} />,
    <SlideQualityCheck key={13} />,
    <SlideMetrics key={14} />,
    <SlideDashboardCharts key={15} chartData={chartData} />,
    <SlideDashboardTable key={16} tableRows={tableRows} />,
    <SlideInsights key={17} />,
    <SlideValue key={18} />,
    <SlideAppendix key={19} />,
    <SlideThankYou key={20} />
  ];

  const searchParams = new URLSearchParams(window.location.search);
  const isShortMode = searchParams.get('mode') === 'short';
  const shortModeIndices = [0, 1, 2, 3, 5, 6, 9, 10, 11, 13, 14, 17, 18, 20];

  const slides = isShortMode 
    ? allSlides.filter((_, index) => shortModeIndices.includes(index))
    : allSlides;

  const totalSlides = slides.length;

  const nextSlide = () => setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  const prevSlide = () => setCurrentSlide(prev => Math.max(prev - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#64748b'}}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <ShieldAlert size={48} />
        </motion.div>
      </div>
    );
  }

  const progress = ((currentSlide + 1) / totalSlides) * 100;

  return (
    <div className="dashboard-container" style={{height: '100dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, marginBottom: '1rem'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', opacity: (currentSlide === 0 || currentSlide === totalSlides - 1) ? 0 : 1, transition: 'opacity 0.3s ease'}}>
          <div className="logo-icon">
            <ShieldAlert color="#fff" size={24} />
          </div>
          <h1>AI CSPM Overwatch</h1>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontWeight: 'bold'}}>
          <button onClick={toggleFullScreen} style={{background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center'}} title="Full Screen">
            <Maximize size={20} />
          </button>
        </div>
      </header>

      {/* Slide Content Area */}
      <div style={{flexGrow: 1, position: 'relative', overflow: 'hidden', padding: '1rem 0'}}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            style={{position: 'absolute', inset: 0, overflowY: 'auto', paddingRight: '1rem'}}
          >
            {React.cloneElement(slides[currentSlide], { slideIndex: currentSlide })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation & Progress Area */}
      <div style={{flexShrink: 0, padding: '1rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        {/* Progress Bar */}
        <div 
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const newSlide = Math.floor((clickX / rect.width) * totalSlides);
            setCurrentSlide(Math.max(0, Math.min(newSlide, totalSlides - 1)));
          }}
          style={{width: '100%', height: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '0', overflow: 'hidden', cursor: 'pointer'}}
          title="Натисніть для переходу на відповідний слайд"
        >
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{height: '100%', background: 'var(--accent-gradient)'}}
          />
        </div>

        <div style={{display: 'flex', justifyContent: 'center', gap: '2rem'}}>
          <button 
            onClick={prevSlide} 
            disabled={currentSlide === 0}
            style={{padding: '0.8rem 1.5rem', background: currentSlide === 0 ? '#cbd5e1' : '#3b82f6', color: 'white', border: 'none', borderRadius: '0', cursor: currentSlide === 0 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold'}}
          >
            <ChevronLeft size={20}/> Попередня
          </button>
          <button 
            onClick={nextSlide} 
            disabled={currentSlide === totalSlides - 1}
            style={{padding: '0.8rem 1.5rem', background: currentSlide === totalSlides - 1 ? '#cbd5e1' : '#3b82f6', color: 'white', border: 'none', borderRadius: '0', cursor: currentSlide === totalSlides - 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold'}}
          >
            Наступна <ChevronRight size={20}/>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
