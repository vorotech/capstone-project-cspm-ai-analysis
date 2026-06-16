import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend
} from 'recharts';
import { ShieldAlert, Cpu, CheckCircle2, AlertTriangle, LayoutList, Filter } from 'lucide-react';

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function App() {
  const [globalData, setGlobalData] = useState(null);
  const [nistMapping, setNistMapping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, prowler, securityhub

  useEffect(() => {
    Promise.all([
      fetch('/summary.json').then(res => res.json()),
      fetch('/nist_mapping.json').then(res => res.json()).catch(() => ({}))
    ])
    .then(([summaryJson, nistJson]) => {
      setGlobalData(summaryJson);
      setNistMapping(nistJson);
      setLoading(false);
    })
    .catch(err => {
      console.error("Error loading data:", err);
      setLoading(false);
    });
  }, []);

  const getControlName = (controlCode) => {
    if (!nistMapping) return '';
    if (nistMapping[controlCode]) return nistMapping[controlCode];
    const baseCode = controlCode.split('(')[0];
    if (nistMapping[baseCode]) return nistMapping[baseCode];
    return '';
  };

  if (loading) {
    return (
      <div className="loading">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <ShieldAlert size={48} />
        </motion.div>
      </div>
    );
  }

  if (!globalData || !globalData[filter]) {
    return <div className="loading">No data found. Please run the Jupyter Notebook analysis.</div>;
  }

  const data = globalData[filter];
  const { kpis, model_comparison, category_distribution, top_adjusted_controls } = data;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="dashboard-container">
      <header style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
          <div className="logo-icon">
            <ShieldAlert color="#fff" size={24} />
          </div>
          <h1>AI CSPM Auditor</h1>
        </div>
        
        {/* Tool Filter */}
        <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(0,0,0,0.05)', padding: '0.5rem', borderRadius: '12px'}}>
          <Filter size={16} color="#64748b" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{background: 'transparent', color: '#0f172a', border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'Inter', fontSize: '1rem', fontWeight: '500'}}
          >
            <option value="all" style={{color: '#0f172a'}}>All Tools</option>
            <option value="prowler" style={{color: '#0f172a'}}>Prowler</option>
            <option value="securityhub" style={{color: '#0f172a'}}>AWS Security Hub</option>
          </select>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.div 
          key={filter}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="kpi-grid">
            <motion.div variants={itemVariants} className="card">
              <div className="kpi-title"><CheckCircle2 size={16} color="#10b981"/> Decision Consistency</div>
              <div className="kpi-value">{kpis.decision_consistency ? kpis.decision_consistency.toFixed(1) : 0}%</div>
            </motion.div>
            <motion.div variants={itemVariants} className="card">
              <div className="kpi-title"><ShieldAlert size={16}/> Avg Adjustment Rate</div>
              <div className="kpi-value">{kpis.avg_adjustment_rate ? kpis.avg_adjustment_rate.toFixed(1) : 0}%</div>
            </motion.div>
            <motion.div variants={itemVariants} className="card">
              <div className="kpi-title"><Cpu size={16}/> Evaluated Findings</div>
              <div className="kpi-value">{kpis.total_runs}</div>
            </motion.div>
          </div>

          <div className="charts-grid">
            <motion.div variants={itemVariants} className="card">
              <h2 className="chart-header"><ShieldAlert size={20}/> Adjustment Rate by Model</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={model_comparison} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" vertical={false} />
                    <XAxis dataKey="model" stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{fill: '#64748b'}} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
                    <RechartsTooltip 
                      cursor={{fill: 'rgba(0,0,0,0.02)'}}
                      contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}
                      itemStyle={{ color: '#0f172a' }}
                    />
                    <Bar dataKey="adjustment_rate" radius={[6, 6, 0, 0]}>
                      {model_comparison.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="card">
              <h2 className="chart-header"><AlertTriangle size={20}/> Adjustment Categories</h2>
              <div className="chart-container">
                {category_distribution && category_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={category_distribution}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {category_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px' }}
                        itemStyle={{ color: '#0f172a' }}
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{fontSize: '12px', color: '#64748b'}} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8'}}>
                    No category data yet.
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="card">
            <h2 className="chart-header"><LayoutList size={20}/> Top Adjusted NIST Controls</h2>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>NIST Control</th>
                    <th>Resource Type</th>
                    <th>Adjustments</th>
                    <th>Primary Category</th>
                  </tr>
                </thead>
                <tbody>
                  {top_adjusted_controls && top_adjusted_controls.map((item, idx) => (
                    <motion.tr 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + (idx * 0.1) }}
                    >
                      <td>
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                          <span className="control-badge">{item.control}</span>
                          <span style={{fontSize: '0.8rem', color: '#64748b', marginTop: '0.4rem', fontWeight: '500'}}>{getControlName(item.control)}</span>
                        </div>
                      </td>
                      <td>
                        <span style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          color: '#d97706',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {item.resource_type || 'unknown'}
                        </span>
                      </td>
                      <td>{item.adjustments_count}</td>
                      <td className="reason-text">
                        <span style={{
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#2563eb',
                          padding: '0.2rem 0.6rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          fontWeight: '600'
                        }}>
                          {item.common_category}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                  {(!top_adjusted_controls || top_adjusted_controls.length === 0) && (
                    <tr>
                      <td colSpan="4" style={{textAlign: 'center', color: '#94a3b8', padding: '2rem'}}>
                        No adjustments found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
