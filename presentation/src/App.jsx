import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import { ChevronLeft, ChevronRight, ShieldAlert, Cpu, Network, FileJson, CheckCircle2, AlertTriangle, Lightbulb, Maximize } from 'lucide-react';
import './App.css'; // Just for standard imports if needed, though most styling is inline/index.css

// --- Slide Components ---

const SlideProblem = () => (
  <div className="slide-content">
    <h2>1. Мета дослідження</h2>
    <div className="placeholder-box" style={{textAlign: 'left'}}>
      <p style={{textIndent: '2rem'}}>
        Традиційні інструменти Cloud Security Posture Management (CSPM), такі як AWS Security Hub та Prowler, часто генерують значну кількість невідповідностей,
        які <strong>після глибшого ручного аналізу виявляються false positives</strong>, оскільки вони не враховують бізнес-контекст, компенсуючих заходів чи архітектурних рішень.
      </p>
    </div>
    <div className="placeholder-box" style={{textAlign: 'left'}}>
      <p style={{textIndent: '2rem'}}>
        Метою цього дослідження є перевірка, чи може ШІ аналізувати результати CSPM-сканувань разом із архітектурними діаграмами
        для <strong>автоматичного відсіювання помилкових спрацьовувань та обґрунтованого коригування рівня ризику</strong> згідно зі стандартом NIST 800-53 Rev 5.
      </p>
    </div>
  </div>
);

const SlideQuestion = () => (
  <div className="slide-content">
    <h2>2. Дослідницьке питання</h2>
    <div className="highlight-box" style={{background: 'rgba(139, 92, 246, 0.1)', border: '2px solid #8b5cf6', padding: '2rem', borderRadius: '12px'}}>
      <h3 style={{color: '#6d28d9', fontSize: '1.8rem', lineHeight: '1.4'}}>
        Чи здатні великі мовні моделі (LLM) ефективно виконувати роль контекстно-залежного хмарного аудитора, консістентно аналізуючи результати CSPM-інструментів 
        на основі архітектурних діаграм для відсіювання false positives та обґрунтованого коригування рівня ризику?
      </h3>
    </div>
  </div>
);

const SlideTasks = () => (
  <div className="slide-content">
    <h2>3. Завдання дослідження</h2>
    <ul className="styled-list">
      <li>1: Автоматизувати розгортання тестової інфраструктури в AWS за допомогою Terraform</li>
      <li>2: Зібрати невідповідності конфігурацій за допомогою Prowler та AWS Security Hub CSPM</li>
      <li>3: Розробити універсальний промпт та пайплайн для LLM аналізу</li>
      <li>4: Зібрати відповіді від LLM різного розміру та архітектури</li>
      <li>5: Провести порівняльний аналіз здатності різних моделей консистентно визначати false positives та коригувати рівень ризику</li>
    </ul>
  </div>
);

const SlideHypothesis = () => (
  <div className="slide-content">
    <h2>4. Висунуті гіпотеза</h2>
    <div className="placeholder-box" style={{textAlign: 'left'}}>
      <p style={{textIndent: '2rem'}}>
        Моделі з великим контекстним вікном і високими показниками <strong>Reasoning</strong> зможуть
        досягти <strong>Decision Consistency &gt; 85%</strong> при аналізі архітектурного контексту, 
        тоді як менші моделі схильні до галюцинацій та екстремумів (0% або 100%)
      </p>
    </div>
    <div className="placeholder-box" style={{textAlign: 'left'}}>
      <p style={{textIndent: '2rem'}}>
        Під час аналізу передаються результати Prowler, Security Hub, а також текстовий опис, зображення або drawio XML архітектурна діаграма
        тестової інфраструктури, але без врахування коду конфігурації – тестування в умовах обмеженого доступу до інформації.
      </p>
    </div>
  </div>
);

const SlideConstraints = () => (
  <div className="slide-content">
    <h2>5. Технічні специфікації</h2>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem'}}>
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem'}}><Cpu size={24} color="#3b82f6" style={{marginRight: '12px'}}/> Топові моделі</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
          {['anthropic/claude-sonnet-4.6', 'anthropic/claude-haiku-4.5', 'anthropic/claude-3.5-haiku', 'openai/gpt-5-mini', 'openai/gpt-4o-mini', 'google/gemini-3.1-pro-preview', 'google/gemini-3.5-flash'].map(model => (
            <span key={model} style={{padding: '6px 12px', background: 'rgba(59, 130, 246, 0.08)', color: '#2563eb', fontSize: '0.85rem', fontWeight: '500', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
              {model}
            </span>
          ))}
        </div>
      </div>
      
      <div className="card" style={{display: 'flex', flexDirection: 'column'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem'}}><Cpu size={24} color="#10b981" style={{marginRight: '12px'}}/> Open Source</h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: '10px'}}>
          {['meta-llama/llama-4-scout', 'deepseek/deepseek-v4-flash', 'qwen/qwen3.7-plus', 'google/gemma-4-31b-it', 'microsoft/phi-4', 'mistralai/mistral-small-2603', 'nvidia/nemotron-3-super-120b-a12b', 'z-ai/glm-5.1', 'moonshotai/kimi-k2.6'].map(model => (
            <span key={model} style={{padding: '6px 12px', background: 'rgba(16, 185, 129, 0.08)', color: '#059669', fontSize: '0.85rem', fontWeight: '500', border: '1px solid rgba(16, 185, 129, 0.2)'}}>
              {model}
            </span>
          ))}
        </div>
      </div>

      <div className="card" style={{gridColumn: '1 / -1'}}>
        <h3 style={{display: 'flex', alignItems: 'center', marginBottom: '1.5rem'}}><ShieldAlert size={24} color="#f59e0b" style={{marginRight: '12px'}}/>Технологічний стек</h3>
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
        </div>
      </div>
    </div>
  </div>
);

const SlideArchitecture = () => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>6. Архітектура тестової інфраструктури</h2>
    <div style={{flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white', borderRadius: '12px', padding: '1rem', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
      <img src="/aws-multi-tier-architecture.drawio.png" alt="Architecture Diagram" style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} />
    </div>
  </div>
);

const SlideDeploy = () => (
  <div className="slide-content">
    <h2>7. Як я деплоїв тестові конфігурації</h2>
    <div className="card">
      <p>Використовується подвійний підхід (Scenarios) через <strong>Terraform</strong>:</p>
      <ul>
        <li><span style={{color: '#dc2626', fontWeight: 'bold'}}>RED</span> - Вразлива інфраструктура (повинна генерувати True Positives).</li>
        <li><span style={{color: '#10b981', fontWeight: 'bold'}}>GREEN</span> - Захищена інфраструктура з компенсуючими контролями (повинна генерувати False Positives для стандартних сканерів).</li>
      </ul>
      <pre>python main.py apply --scenario test_s3_red</pre>
    </div>
  </div>
);

const SlideFindings = () => (
  <div className="slide-content">
    <h2>8. Як я збирав findings</h2>
    <div className="card">
      <h3>CSPM Runner</h3>
      <p>Спеціальний клас на Python (`cspm_runner.py`), який:</p>
      <ul>
        <li>Запускає <code>prowler aws</code> через CLI і парсить JSON вивід.</li>
        <li>Використовує <code>boto3</code> (SecurityHub API) для отримання алертів ASFF.</li>
        <li>Зберігає "сирі" (raw) логи у папці <code>data/findings/raw/</code>.</li>
      </ul>
      <pre>python main.py cspm --scenario test_s3_red</pre>
    </div>
  </div>
);

const SlideNormalization = () => (
  <div className="slide-content">
    <h2>9. Як я нормалізовую дані</h2>
    <div style={{display: 'flex', gap: '1rem', flexWrap: 'wrap'}}>
      <div className="card" style={{flex: 1, minWidth: '300px'}}>
        <h3>Сирий алерт (Prowler)</h3>
        <pre style={{fontSize: '0.75rem'}}>
{`{
  "Status": "FAIL",
  "Severity": "Critical",
  "CheckID": "s3_bucket_public_access",
  "ResourceArn": "arn:aws:s3:::my-bucket"
}`}
        </pre>
      </div>
      <div className="card" style={{flex: 1, minWidth: '300px'}}>
        <h3>Нормалізований JSON</h3>
        <pre style={{fontSize: '0.75rem'}}>
{`{
  "finding_id": "s3_bucket_public_access",
  "cspm_tool": "Prowler",
  "resource_id": "arn:aws:s3:::my-bucket",
  "original_severity": "CRITICAL",
  "associated_nist_controls": ["AC-3"]
}`}
        </pre>
      </div>
    </div>
  </div>
);

const SlidePrompt = () => (
  <div className="slide-content">
    <h2>10. Системний Prompt</h2>
    <div className="card" style={{fontSize: '0.85rem', maxHeight: '400px', overflowY: 'auto'}}>
      <p><strong>Роль:</strong> You are an expert Cloud Security Architect and Auditor...</p>
      <p><strong>Завдання:</strong> Determine if a finding is a False Positive, or if the Risk Severity should be adjusted based on the provided Architecture Context.</p>
      <div style={{background: '#fff3cd', color: '#856404', padding: '1rem', borderRadius: '8px', borderLeft: '4px solid #ffeeba'}}>
        <strong>Rule 6: AVOID EXTREMES</strong><br/>
        A realistic architectural analysis rarely results in 100% or 0% of findings being adjusted. Do not blindly accept or blindly reject all findings. Evaluate each finding rigorously on its own merits.
      </div>
    </div>
  </div>
);

const SlideResponse = () => (
  <div className="slide-content">
    <h2>11. Як LLM відповідає (Приклад)</h2>
    <div className="card">
      <pre style={{fontSize: '0.8rem'}}>
{`{
  "evaluated_findings": [
    {
      "finding_id": "s3_bucket_public_access",
      "resource_id": "arn:aws:s3:::my-bucket",
      "is_false_positive": true,
      "adjusted_severity": "INFO",
      "adjustment_category": "ISOLATED_ENVIRONMENT",
      "rationale": "Бакет дійсно є публічним, але згідно з архітектурною діаграмою, він використовується виключно для роздачі статичних публічних ассетів (CloudFront origin). Отже, це очікувана поведінка."
    }
  ]
}`}
      </pre>
    </div>
  </div>
);

const SlideAnalysisPhases = () => (
  <div className="slide-content">
    <h2>12. Етапи аналізу відповіді LLM</h2>
    <div className="funnel-container" style={{marginTop: '1rem'}}>
      <div className="funnel-stage" style={{width: '90%', background: '#e0f2fe', color: '#1e3a8a'}}>
        <strong>Етап 1: Оцінка якості</strong><br/>
        <span style={{fontSize: '0.9rem'}}>Перевірка на таймаути, помилки API, виявлення екстремумів (ZERO/ALL_ADJUSTED)</span>
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

const SlideQualityCheck = () => (
  <div className="slide-content">
    <h2>13. Оцінка якості моделей (Етап 1)</h2>
    <div className="card">
      <h3>Відсіювання неякісних запусків</h3>
      <p>Модель вважається нестабільною та виключається з подальшого порівняння, якщо показник <strong>OK Status</strong> становить менше <strong>80%</strong>. Причини фейлів:</p>
      <ul>
        <li><span style={{color: 'darkred', fontWeight: 'bold'}}>TIMEOUT</span>: Перевищено ліміт часу (120с).</li>
        <li><span style={{color: 'crimson', fontWeight: 'bold'}}>API_ERROR</span>: Помилка формату JSON або відмова API.</li>
        <li><span style={{color: 'orange', fontWeight: 'bold'}}>ZERO_ADJUSTED</span>: Модель нічого не змінила (можливі "лінощі" LLM).</li>
        <li><span style={{color: 'gold', fontWeight: 'bold'}}>ALL_ADJUSTED</span>: Модель позначила абсолютно всі файндинги як False Positive (галюцинація / надмірна довіра).</li>
      </ul>
    </div>
  </div>
);

const SlideCalculations = () => (
  <div className="slide-content" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
    <h2>14. Етап 2. Розрахунки (Jupyter Notebook)</h2>
    <div style={{flexGrow: 1, border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#fff', marginTop: '1rem'}}>
      <iframe src="/results_analysis.html" width="100%" height="100%" style={{border: 'none'}} title="Results Analysis Notebook"></iframe>
    </div>
  </div>
);

const SlideDashboardCharts = ({ chartData }) => (
  <div className="slide-content">
    <h2>15. Оцінка параметрів (Prowler vs Security Hub)</h2>
    <div className="chart-container" style={{height: '400px', background: 'white', padding: '1rem', borderRadius: '12px'}}>
      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
            <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 11}} angle={-45} textAnchor="end" height={60} />
            <YAxis yAxisId="left" stroke="#64748b" tick={{fill: '#64748b'}} tickFormatter={(val) => `${val}%`} />
            <YAxis yAxisId="right" orientation="right" stroke="#dc2626" tick={{fill: '#dc2626'}} tickFormatter={(val) => `${val}%`} />
            <RechartsTooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}/>
            <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '20px'}}/>
            
            <Bar yAxisId="left" dataKey="prowler_adj" fill="#ef4444" name="Prowler Adj Rate" radius={[4, 4, 0, 0]} barSize={20} />
            <Bar yAxisId="left" dataKey="sh_adj" fill="#8b5cf6" name="SecHub Adj Rate" radius={[4, 4, 0, 0]} barSize={20} />
            <Line yAxisId="right" type="monotone" dataKey="prowler_cons" stroke="#b91c1c" strokeWidth={3} name="Prowler Consistency" dot={{r: 6}} connectNulls />
            <Line yAxisId="right" type="monotone" dataKey="sh_cons" stroke="#4c1d95" strokeWidth={3} name="SecHub Consistency" dot={{r: 6, shape: 'square'}} connectNulls />
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

const SlideDashboardTable = ({ tableRows }) => (
  <div className="slide-content">
    <h2>16. Оцінка параметрів (Деталі та Категорії)</h2>
    <div className="table-container" style={{overflowX: 'auto', maxHeight: '400px', background: 'white', borderRadius: '0', border: '1px solid #e2e8f0'}}>
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
                <span style={{background: row.decision_consistency >= 80 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: row.decision_consistency >= 80 ? '#059669' : '#d97706', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold'}}>
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

const SlideConclusions = () => (
  <div className="slide-content">
    <h2>17. Які висновки можна зробити</h2>
    <div className="placeholder-box">
      <p>[Тут будуть фінальні висновки після збору більшої кількості даних. Наприклад: "GPT-4o та Claude 3.5 Sonnet демонструють найвищу стабільність (Consistency &gt; 95%), проте Prowler генерує в середньому більше файндингів, що змушує моделі витрачати більше токенів."]</p>
    </div>
  </div>
);

const SlideFuture = () => (
  <div className="slide-content">
    <h2>18. Цінність дослідження для майбутнього</h2>
    <div className="card">
      <h3 style={{color: '#3b82f6'}}><Lightbulb size={24} style={{verticalAlign: 'middle', marginRight: '8px'}}/> AI Cloud Auditor (Next Steps)</h3>
      <p>Це дослідження доводить життєздатність інтеграції LLM у конвеєр безпеки. Майбутній розвиток ідеї:</p>
      <ul>
        <li><strong>Інтеграція в CI/CD:</strong> Автоматичне відхилення pull-реквестів Terraform, якщо архітектурні зміни ламають компенсуючі контролі.</li>
        <li><strong>Автоматизація SOC (SOAR):</strong> LLM може автоматично закривати тікети Security Hub як `SUPPRESSED`, якщо архітектурний контекст доводить їхню безпечність, заощаджуючи сотні годин роботи аналітиків.</li>
        <li><strong>Генерація рекомендацій:</strong> Надання розробникам конкретних блоків Terraform-коду для виправлення вразливостей, які LLM визнала як True Positive.</li>
      </ul>
    </div>
  </div>
);

const SlideThankYou = () => (
  <div className="slide-content" style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center'}}>
    <h1 style={{fontSize: '4rem', color: 'var(--accent-blue)', marginBottom: '1rem'}}>Дякую за увагу!</h1>
    <p style={{fontSize: '1.5rem', color: '#64748b'}}>Готовий відповісти на ваші запитання.</p>
  </div>
);

// --- Main Presentation Component ---

function App() {
  const [globalData, setGlobalData] = useState({});
  const [chartData, setChartData] = useState([]);
  const [tableRows, setTableRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

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
    fetch('/summary.json')
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
          cData.push({
            name: model,
            prowler_adj: prowler.adjustment_rate || 0,
            sh_adj: sh.adjustment_rate || 0,
            prowler_cons: prowler.decision_consistency,
            sh_cons: sh.decision_consistency
          });
        });
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

  const slides = [
    <SlideProblem key={0} />,
    <SlideQuestion key={1} />,
    <SlideTasks key={2} />,
    <SlideHypothesis key={3} />,
    <SlideConstraints key={4} />,
    <SlideArchitecture key={5} />,
    <SlideDeploy key={6} />,
    <SlideFindings key={7} />,
    <SlideNormalization key={8} />,
    <SlidePrompt key={9} />,
    <SlideResponse key={10} />,
    <SlideAnalysisPhases key={11} />,
    <SlideQualityCheck key={12} />,
    <SlideCalculations key={13} />,
    <SlideDashboardCharts key={14} chartData={chartData} />,
    <SlideDashboardTable key={15} tableRows={tableRows} />,
    <SlideConclusions key={16} />,
    <SlideFuture key={17} />,
    <SlideThankYou key={18} />
  ];

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
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div className="logo-icon">
            <ShieldAlert color="#fff" size={24} />
          </div>
          <h1>AI CSPM Overwatch</h1>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem', color: '#64748b', fontWeight: 'bold'}}>
          Slide {currentSlide + 1} / {totalSlides}
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
            {slides[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation & Progress Area */}
      <div style={{flexShrink: 0, padding: '1rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '1rem'}}>
        {/* Progress Bar */}
        <div style={{width: '100%', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '0', overflow: 'hidden'}}>
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
