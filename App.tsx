
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  BrainCircuit,
  Menu,
  Bell,
  Search,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { GlassCard } from './components/GlassCard';
import { ViewState, Vendor, Proposal, LineItem } from './types';
import { MOCK_VENDORS, MOCK_PROPOSALS, PROCUREMENT_STATS } from './constants';

// --- Mock Data Generators ---

const generateMockVendorAnalysis = (vendor: Vendor): string => {
  const riskLevel = vendor.riskScore > 70 ? 'HIGH' : vendor.riskScore > 40 ? 'MODERATE' : 'LOW';
  const auditAge = new Date().getFullYear() - new Date(vendor.lastAuditDate).getFullYear();

  let analysis = `**Risk Assessment Summary for ${vendor.name}**\n\n`;
  analysis += `Overall Risk Level: ${riskLevel} (Score: ${vendor.riskScore}/100)\n\n`;

  if (vendor.riskScore > 50) {
    analysis += `⚠️ **Key Concerns:**\n`;
    analysis += `- Risk score of ${vendor.riskScore} exceeds acceptable threshold of 50\n`;
    if (auditAge > 1) {
      analysis += `- Last audit conducted ${auditAge} year(s) ago - audit refresh recommended\n`;
    }
    if (vendor.totalSpend > 1000000) {
      analysis += `- High financial exposure with $${(vendor.totalSpend / 1000000).toFixed(1)}M in total spend\n`;
    }
  } else {
    analysis += `✓ **Positive Indicators:**\n`;
    analysis += `- Risk score of ${vendor.riskScore} is within acceptable range\n`;
    analysis += `- ${vendor.activeContracts} active contracts demonstrate ongoing relationship\n`;
  }

  analysis += `\n**Recommended Actions:**\n`;
  if (vendor.riskScore > 50) {
    analysis += `1. Conduct comprehensive vendor audit within 30 days\n`;
    analysis += `2. Review contract terms and implement additional oversight measures\n`;
    analysis += `3. Consider diversifying vendor portfolio to reduce dependency\n`;
  } else {
    analysis += `1. Maintain current monitoring schedule\n`;
    analysis += `2. Continue quarterly performance reviews\n`;
  }

  return analysis;
};

const generateMockCostReview = (items: LineItem[], vendorName: string): string => {
  const total = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const avgUnitPrice = total / items.reduce((sum, item) => sum + item.quantity, 0);

  let html = `<div style="color: #e5e5e5;">`;
  html += `<p style="margin-bottom: 12px;"><strong style="color: #00d6cb;">Cost Analysis Report</strong></p>`;
  html += `<p style="margin-bottom: 8px; font-size: 14px;">Vendor: <strong>${vendorName}</strong></p>`;
  html += `<p style="margin-bottom: 16px; font-size: 14px;">Total Line Items: ${items.length} | Total Value: <strong style="color: #00d6cb;">$${total.toLocaleString()}</strong></p>`;

  // Identify high-cost items
  const highCostItems = items.filter(item => item.unitPrice > avgUnitPrice * 1.5);

  if (highCostItems.length > 0) {
    html += `<p style="margin-bottom: 8px;"><strong style="color: #f59e0b;">⚠️ Items Requiring Review:</strong></p>`;
    html += `<ul style="margin-left: 20px; margin-bottom: 16px; line-height: 1.6;">`;
    highCostItems.forEach(item => {
      html += `<li style="margin-bottom: 4px;">`;
      html += `<strong>${item.description}</strong> - Unit price of $${item.unitPrice.toLocaleString()} is `;
      html += `${Math.round((item.unitPrice / avgUnitPrice - 1) * 100)}% above average`;
      html += `</li>`;
    });
    html += `</ul>`;
  }

  html += `<p style="margin-bottom: 8px;"><strong style="color: #10b981;">✓ Fair Reasonableness Determination:</strong></p>`;

  if (highCostItems.length === 0) {
    html += `<p style="margin-bottom: 8px; color: #a6a6a6;">All line items fall within expected market ranges. Pricing appears competitive and reasonable based on historical data.</p>`;
  } else if (highCostItems.length <= 2) {
    html += `<p style="margin-bottom: 8px; color: #a6a6a6;">Majority of items are reasonably priced. ${highCostItems.length} item(s) flagged for price negotiation or justification.</p>`;
  } else {
    html += `<p style="margin-bottom: 8px; color: #a6a6a6;">Multiple items exceed typical market rates. Recommend vendor negotiation before approval.</p>`;
  }

  html += `<p style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 13px; color: #666;">`;
  html += `Analysis based on historical pricing data and market benchmarks.`;
  html += `</p>`;
  html += `</div>`;

  return html;
};

// --- Sub-Components defined here for simplicity in this single-file structure request ---

const NavItem = ({
  icon: Icon,
  label,
  active,
  onClick
}: {
  icon: React.ElementType,
  label: string,
  active: boolean,
  onClick: () => void
}) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-3 w-full px-4 py-3 rounded-lg transition-all duration-200
      ${active
        ? 'bg-[var(--color-primary-alpha-15)] text-[var(--color-primary)] border border-[var(--glass-border-accent)] shadow-[var(--glow-subtle)]'
        : 'text-[var(--color-text-secondary)] hover:text-white hover:bg-[var(--glass-bg-light)]'}
    `}
  >
    <Icon size={20} className={active ? "drop-shadow-[0_0_5px_rgba(0,214,203,0.5)]" : ""} />
    <span className="font-medium">{label}</span>
  </button>
);

const StatCard = ({ title, value, trend, icon: Icon, colorClass }: any) => (
  <GlassCard className="relative overflow-hidden group">
    <div className="flex justify-between items-start z-10 relative">
      <div>
        <p className="text-[var(--color-text-secondary)] text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white font-logo tracking-wide">{value}</h3>
        <div className="flex items-center mt-2 gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full bg-[var(--glass-bg-heavy)] ${trend.startsWith('+') ? 'text-[var(--color-success)]' : 'text-[var(--color-error)]'}`}>
            {trend}
          </span>
          <span className="text-xs text-[var(--color-text-tertiary)]">vs last month</span>
        </div>
      </div>
      <div className={`p-3 rounded-xl bg-[var(--glass-bg-heavy)] ${colorClass}`}>
        <Icon size={24} />
      </div>
    </div>
    {/* Decoration */}
    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gradient-to-br from-[var(--color-primary)] to-transparent opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity"></div>
  </GlassCard>
);

// --- Views ---

const DashboardView = () => (
  <div className="space-y-6 animate-fade-in">
    {/* Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard
        title="Total Procurement Spend"
        value="$4.2M"
        trend="+12.5%"
        icon={DollarSign}
        colorClass="text-[var(--color-primary)]"
      />
      <StatCard
        title="Active Vendors"
        value="142"
        trend="+3"
        icon={Users}
        colorClass="text-[var(--color-info)]"
      />
      <StatCard
        title="Pending Proposals"
        value="8"
        trend="-2"
        icon={FileText}
        colorClass="text-[var(--color-warning)]"
      />
      <StatCard
        title="Risky Vendors"
        value="3"
        trend="+1"
        icon={AlertTriangle}
        colorClass="text-[var(--color-error)]"
      />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
      {/* Main Chart */}
      <GlassCard className="lg:col-span-2 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white">Spend vs Savings Analysis</h3>
          <button className="text-sm text-[var(--color-primary)] hover:text-[var(--color-primary-light)]">Download Report</button>
        </div>
        <div className="flex-1 w-full min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={PROCUREMENT_STATS}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--color-text-tertiary)" tick={{ fill: 'var(--color-text-secondary)' }} />
              <YAxis stroke="var(--color-text-tertiary)" tick={{ fill: 'var(--color-text-secondary)' }} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--color-bg-secondary)', borderColor: 'var(--glass-border-accent)', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="spend" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorSpend)" />
              <Area type="monotone" dataKey="savings" stroke="var(--color-accent)" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Action Feed */}
      <GlassCard>
        <h3 className="text-lg font-semibold text-white mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((_, i) => (
            <div key={i} className="flex items-start gap-3 pb-3 border-b border-[var(--glass-border)] last:border-0">
              <div className="mt-1 w-2 h-2 rounded-full bg-[var(--color-primary)] shadow-[0_0_5px_var(--color-primary)]"></div>
              <div>
                <p className="text-sm text-[var(--color-text-primary)]">Proposal #1024 approved by Finance</p>
                <p className="text-xs text-[var(--color-text-tertiary)]">2 hours ago</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  </div>
);

const VendorView = ({ vendors }: { vendors: Vendor[] }) => {
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAnalyze = async (vendor: Vendor) => {
    setLoadingAi(true);
    setAiAnalysis('');
    // Simulate brief processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 800));
    const result = generateMockVendorAnalysis(vendor);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in h-[calc(100vh-140px)]">
      {/* List */}
      <GlassCard className="lg:col-span-2 flex flex-col overflow-hidden">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-logo">Vendor Intelligence</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" size={18} />
            <input
              type="text"
              placeholder="Search vendor database..."
              className="pl-10 pr-4 py-2 rounded-lg bg-[var(--glass-bg-light)] border border-[var(--glass-border)] text-white focus:outline-none focus:border-[var(--color-primary)] transition-colors w-64 placeholder-[var(--color-text-tertiary)]"
            />
          </div>
        </div>

        <div className="overflow-y-auto pr-2 space-y-3 flex-1 custom-scrollbar">
          {vendors.map(vendor => (
            <div
              key={vendor.id}
              onClick={() => { setSelectedVendor(vendor); setAiAnalysis(''); }}
              className={`
                p-4 rounded-xl cursor-pointer transition-all border
                ${selectedVendor?.id === vendor.id
                  ? 'bg-[var(--color-primary-alpha-15)] border-[var(--color-primary)] shadow-[var(--glow-subtle)]'
                  : 'bg-[var(--glass-bg-light)] border-transparent hover:bg-[var(--glass-bg-medium)]'}
              `}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white">{vendor.name}</h4>
                  <p className="text-sm text-[var(--color-text-secondary)]">{vendor.category}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-bold ${vendor.riskScore > 50 ? 'text-[var(--color-error)]' : 'text-[var(--color-success)]'}`}>
                    Risk: {vendor.riskScore}
                  </span>
                  <p className="text-xs text-[var(--color-text-tertiary)]">Spend: ${(vendor.totalSpend / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Detail / AI Panel */}
      <GlassCard className="flex flex-col">
        {selectedVendor ? (
          <>
            <div className="mb-6">
              <h3 className="text-xl font-bold text-[var(--color-primary)] mb-2">{selectedVendor.name}</h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{selectedVendor.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-[var(--glass-bg-light)] p-3 rounded-lg">
                <p className="text-xs text-[var(--color-text-tertiary)]">Contracts</p>
                <p className="text-lg font-mono">{selectedVendor.activeContracts}</p>
              </div>
              <div className="bg-[var(--glass-bg-light)] p-3 rounded-lg">
                <p className="text-xs text-[var(--color-text-tertiary)]">Last Audit</p>
                <p className="text-lg font-mono">{selectedVendor.lastAuditDate}</p>
              </div>
            </div>

            <div className="flex-1 bg-[var(--bg-secondary)] rounded-xl p-4 border border-[var(--glass-border)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary-alpha-15)] to-transparent opacity-10 pointer-events-none"></div>
              <div className="flex items-center gap-2 mb-4">
                <BrainCircuit className="text-[var(--color-primary)]" size={20} />
                <span className="font-bold text-sm tracking-wider uppercase text-[var(--color-text-secondary)]">Risk Analysis</span>
              </div>

              {loadingAi ? (
                <div className="flex flex-col items-center justify-center h-32 space-y-2">
                  <div className="w-6 h-6 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-[var(--color-primary)] animate-pulse">Analyzing risk factors...</span>
                </div>
              ) : aiAnalysis ? (
                <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed h-full overflow-y-auto">
                  {aiAnalysis}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm text-[var(--color-text-tertiary)] mb-4">Generate a comprehensive risk report based on upstream data.</p>
                  <button
                    onClick={() => handleAnalyze(selectedVendor)}
                    className="neon-button px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                  >
                    <BrainCircuit size={16} />
                    Analyze Vendor
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-[var(--color-text-tertiary)]">
            <Users size={48} className="mb-4 opacity-20" />
            <p>Select a vendor to view details</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
};

const ProposalView = ({ proposals }: { proposals: Proposal[] }) => {
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [costReview, setCostReview] = useState<string>('');
  const [loadingReview, setLoadingReview] = useState(false);

  const handleReviewCosts = async (proposal: Proposal) => {
    setLoadingReview(true);
    const vendorName = MOCK_VENDORS.find(v => v.id === proposal.vendorId)?.name || 'Unknown Vendor';
    // Simulate brief processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 1000));
    const review = generateMockCostReview(proposal.items, vendorName);
    setCostReview(review);
    setLoadingReview(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in h-[calc(100vh-140px)]">
      {/* List */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-logo">Proposals</h2>
          <button className="neon-button px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
            <Plus size={14} /> New
          </button>
        </div>
        <div className="overflow-y-auto flex-1 space-y-3 custom-scrollbar pr-2">
          {proposals.map(p => (
            <GlassCard
              key={p.id}
              className={`
                  p-4 cursor-pointer transition-all border
                  ${selectedProposal?.id === p.id ? 'border-[var(--color-primary)] bg-[var(--color-primary-alpha-15)]' : 'border-[var(--glass-border-accent)] hover:bg-[var(--glass-bg-light)]'}
                `}
            >
              <div onClick={() => { setSelectedProposal(p); setCostReview(''); }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-[var(--color-text-tertiary)]">#{p.id.toUpperCase()}</span>
                  <span className={`
                        text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border
                        ${p.status === 'Approved' ? 'text-[var(--color-success)] border-[var(--color-success)]' :
                      p.status === 'Review' ? 'text-[var(--color-warning)] border-[var(--color-warning)]' :
                        'text-[var(--color-text-secondary)] border-[var(--color-text-secondary)]'}
                      `}>
                    {p.status}
                  </span>
                </div>
                <h4 className="font-semibold text-white mb-1">{p.title}</h4>
                <div className="flex justify-between text-sm text-[var(--color-text-secondary)]">
                  <span>{p.items.length} Items</span>
                  <span className="text-[var(--color-primary)] font-mono">${p.amount.toLocaleString()}</span>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Workspace */}
      <div className="lg:col-span-8 flex flex-col h-full">
        {selectedProposal ? (
          <GlassCard className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex justify-between items-end pb-4 border-b border-[var(--glass-border)] mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white font-logo">{selectedProposal.title}</h2>
                <p className="text-[var(--color-text-secondary)] text-sm mt-1">Submitted on {selectedProposal.submissionDate}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-[var(--color-text-tertiary)]">Total Value</p>
                <p className="text-3xl font-mono text-[var(--color-primary)] font-bold">${selectedProposal.amount.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <table className="w-full text-left text-sm text-[var(--color-text-secondary)]">
                <thead className="text-[var(--color-text-tertiary)] border-b border-[var(--glass-border)]">
                  <tr>
                    <th className="pb-2 font-medium">Description</th>
                    <th className="pb-2 font-medium">Cat.</th>
                    <th className="pb-2 font-medium text-right">Qty</th>
                    <th className="pb-2 font-medium text-right">Unit Price</th>
                    <th className="pb-2 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--glass-border)]">
                  {selectedProposal.items.map(item => (
                    <tr key={item.id} className="group hover:bg-[var(--glass-bg-light)] transition-colors">
                      <td className="py-3 font-medium text-white">{item.description}</td>
                      <td className="py-3">{item.category}</td>
                      <td className="py-3 text-right font-mono">{item.quantity}</td>
                      <td className="py-3 text-right font-mono">${item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 text-right font-mono text-[var(--color-text-primary)]">${(item.quantity * item.unitPrice).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* AI Workflow Footer */}
            <div className="mt-4 pt-4 border-t border-[var(--glass-border)] bg-[var(--glass-bg-heavy)] -mx-6 -mb-6 p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-[var(--color-primary)]">
                  <BrainCircuit size={20} />
                  <span className="font-bold text-sm">Automated Cost Analysis</span>
                </div>
                {!loadingReview && !costReview && (
                  <button
                    onClick={() => handleReviewCosts(selectedProposal)}
                    className="neon-button px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Review Cost Analysis
                  </button>
                )}
              </div>

              {(loadingReview || costReview) && (
                <div className="bg-[var(--bg-primary)] rounded-lg p-4 text-sm border border-[var(--glass-border-accent)]">
                  {loadingReview ? (
                    <div className="flex items-center gap-3 text-[var(--color-text-secondary)]">
                      <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
                      Checking historical pricing and market rates...
                    </div>
                  ) : (
                    <div
                      className="prose prose-invert prose-sm max-w-none [&_p]:mb-2 [&_ul]:pl-4 [&_li]:mb-1 text-[var(--color-text-secondary)]"
                      dangerouslySetInnerHTML={{ __html: costReview }}
                    />
                  )}
                </div>
              )}
            </div>
          </GlassCard>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[var(--color-text-tertiary)] border border-dashed border-[var(--glass-border)] rounded-xl">
            Select a proposal to start the workflow
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <div className="min-h-screen flex bg-[var(--color-bg-primary)] text-white font-sans selection:bg-[var(--color-primary-alpha-25)]">

      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col border-r border-[var(--glass-border)] bg-[var(--glass-bg-light)] backdrop-blur-md fixed h-full z-20">
        <div className="p-6">
          <div className="flex items-center gap-2 text-[var(--color-primary)] mb-8">
            <div className="w-8 h-8 rounded bg-[var(--color-primary)] flex items-center justify-center text-black font-bold text-xl shadow-[0_0_15px_var(--color-primary)]">
              R
            </div>
            <h1 className="text-2xl font-bold font-logo tracking-tighter text-white">Procurement<span className="text-[var(--color-primary)]"> Analytics</span></h1>
          </div>

          <nav className="space-y-2">
            <NavItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={view === ViewState.DASHBOARD}
              onClick={() => setView(ViewState.DASHBOARD)}
            />
            <NavItem
              icon={Users}
              label="Vendor Intel"
              active={view === ViewState.VENDORS}
              onClick={() => setView(ViewState.VENDORS)}
            />
            <NavItem
              icon={FileText}
              label="Proposals"
              active={view === ViewState.PROPOSALS}
              onClick={() => setView(ViewState.PROPOSALS)}
            />
          </nav>
        </div>

        <div className="mt-auto p-6">
          <GlassCard className="bg-gradient-to-tr from-[var(--color-primary-alpha-15)] to-transparent border-[var(--color-primary-alpha-25)]">
            <div className="flex items-center gap-2 mb-2 text-[var(--color-primary)]">
              <BrainCircuit size={18} />
              <span className="font-bold text-sm">AI Assistant</span>
            </div>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              Need market research or cost breakdown analysis?
            </p>
            <button className="text-xs font-bold text-white hover:text-[var(--color-primary)] transition-colors">
              Open Chat &rarr;
            </button>
          </GlassCard>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen relative">
        {/* Top Header */}
        <header className="h-20 flex items-center justify-between px-6 sticky top-0 z-10 bg-[var(--color-bg-primary)]/80 backdrop-blur-md border-b border-[var(--glass-border)]">
          <div className="flex items-center gap-4 lg:hidden">
            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="text-[var(--color-text-secondary)]">
              <Menu size={24} />
            </button>
            <span className="font-bold font-logo">Procurement Analytics</span>
          </div>

          <div className="hidden lg:flex items-center text-[var(--color-text-secondary)] text-sm">
            <span className="px-3 py-1 rounded-full bg-[var(--glass-bg-light)] border border-[var(--glass-border)]">
              System Status: <span className="text-[var(--color-success)] font-mono">ONLINE</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-[var(--color-text-secondary)] hover:text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-[var(--color-primary)] rounded-full shadow-[0_0_8px_var(--color-primary)]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[var(--color-primary)] to-blue-600 p-[1px]">
              <div className="w-full h-full rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-xs font-bold">
                JD
              </div>
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="p-6 flex-1 overflow-x-hidden">
          {view === ViewState.DASHBOARD && <DashboardView />}
          {view === ViewState.VENDORS && <VendorView vendors={MOCK_VENDORS} />}
          {view === ViewState.PROPOSALS && <ProposalView proposals={MOCK_PROPOSALS} />}
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="fixed inset-0 z-50 lg:hidden bg-black/80 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
          <div className="w-64 h-full bg-[var(--color-bg-secondary)] p-6 border-r border-[var(--glass-border)]" onClick={e => e.stopPropagation()}>
            <div className="mb-8">
              <h2 className="font-logo font-bold text-xl text-white">Procurement Analytics</h2>
            </div>
            <nav className="space-y-2">
              <NavItem icon={LayoutDashboard} label="Dashboard" active={view === ViewState.DASHBOARD} onClick={() => { setView(ViewState.DASHBOARD); setShowMobileMenu(false); }} />
              <NavItem icon={Users} label="Vendor Intel" active={view === ViewState.VENDORS} onClick={() => { setView(ViewState.VENDORS); setShowMobileMenu(false); }} />
              <NavItem icon={FileText} label="Proposals" active={view === ViewState.PROPOSALS} onClick={() => { setView(ViewState.PROPOSALS); setShowMobileMenu(false); }} />
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
