import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { BudgetSummary } from '../types';
import { Badge } from '../components/common/Badge';
import {
  IndianRupee,
  TrendingUp,
  PieChart as PieIcon,
  AlertCircle,
  FileText,
  Calendar,
  Building,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
  Legend,
} from 'recharts';

const INITIAL_BUDGET: BudgetSummary = {
  projectId: 1,
  totalApprovedBudget: 85000000,
  actualExpenditure: 42500000,
  committedCost: 18200000,
  projectedCostAtCompletion: 87200000,
  varianceAmount: 2200000,
  utilizationPercentage: 50.0,
  costByCategory: [
    { category: 'Structural Concrete', allocated: 25000000, actual: 23500000, variance: 1500000 },
    { category: 'TMT Steel & Rebar', allocated: 20000000, actual: 18900000, variance: 1100000 },
    { category: 'Heavy Machinery & Cranes', allocated: 15000000, actual: 14200000, variance: 800000 },
    { category: 'MEP Electrical & Piping', allocated: 12000000, actual: 6400000, variance: 5600000 },
    { category: 'Finishes & Architectural', allocated: 13000000, actual: 2500000, variance: 10500000 },
  ],
  monthlyBurnRate: [
    { month: 'Jan', planned: 4500000, actual: 4200000 },
    { month: 'Feb', planned: 5500000, actual: 5800000 },
    { month: 'Mar', planned: 7000000, actual: 6900000 },
    { month: 'Apr', planned: 8000000, actual: 8100000 },
    { month: 'May', planned: 8500000, actual: 8400000 },
    { month: 'Jun', planned: 9000000, actual: 9100000 },
  ],
};

export const BudgetPage: React.FC = () => {
  const { currentProject } = useProject();
  const [budget, setBudget] = useState<BudgetSummary>(INITIAL_BUDGET);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const res = await api.getBudgetSummary(currentProject?.id || 1);
        if (res) setBudget(res);
      } catch (err) {
        console.warn('Fallback loading budget data:', err);
      }
    };
    fetchBudget();
  }, [currentProject?.id]);

  const approvedBudget = budget.totalApprovedBudget ?? budget.totalBudget ?? 85000000;
  const varianceAmt = budget.varianceAmount ?? 0;
  const committedAmt = budget.committedCost ?? budget.committedBudget ?? 0;
  const projectedCost = budget.projectedCostAtCompletion ?? budget.actualExpenditure;
  const monthlyRates = budget.monthlyBurnRate || [];
  const costCategories = budget.costByCategory || [];

  const remainingBudget = approvedBudget - budget.actualExpenditure;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <IndianRupee className="w-6 h-6 text-emerald-500" />
            Financial Capital & Cost Intelligence
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Cash-flow burn rate, Earned Value Analysis (EAC), procurement commitments, and contract variance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="purple" size="md">
            Approved: ₹{(approvedBudget / 10000000).toFixed(2)} Cr
          </Badge>
          <Badge variant={varianceAmt > 0 ? 'warning' : 'success'} size="md">
            Projected Variance: +₹{(varianceAmt / 100000).toFixed(1)} L
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Total Approved Budget</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            ₹{(approvedBudget / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Base capital allocation</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Actual Expenditure</div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
            ₹{(budget.actualExpenditure / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {budget.utilizationPercentage.toFixed(1)}% drawn down
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Committed PO Contracts</div>
          <div className="text-2xl font-black text-blue-400 font-mono mt-1">
            ₹{(committedAmt / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Contractual obligations</div>
        </div>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/90">
          <div className="text-xs text-slate-400 uppercase font-semibold">Forecast at Completion (EAC)</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            ₹{(projectedCost / 10000000).toFixed(2)} Cr
          </div>
          <div className="text-[11px] text-amber-300 mt-1">
            +{(varianceAmt / 100000).toFixed(1)} L overrun forecast
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Burn Rate Trend */}
        <div className="panel-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="font-bold text-sm text-white">Monthly Cash Burn Rate (₹ Lakhs)</h3>
              <p className="text-[11px] text-slate-400">Planned Disbursement vs Actual Site Expenditure</p>
            </div>
          </div>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={monthlyRates.map((m) => ({
                  month: m.month,
                  Planned: Math.round(m.planned / 100000),
                  Actual: Math.round(m.actual / 100000),
                }))}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Area type="monotone" dataKey="Planned" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                <Area type="monotone" dataKey="Actual" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost by Commodity / Category */}
        <div className="panel-card p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 className="font-bold text-sm text-white">Category Allocation (₹ Lakhs)</h3>
              <p className="text-[11px] text-slate-400">Approved Budget vs Incurred Spend</p>
            </div>
          </div>
          <div className="h-64 pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={costCategories.map((c) => ({
                  category: c.category.split(' ')[0],
                  Allocated: Math.round(c.allocated / 100000),
                  Actual: Math.round(c.actual / 100000),
                }))}
                margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="Allocated" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="panel-card overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950/40">
          <h3 className="font-bold text-sm text-white">Trade & Material Cost Allocation Ledger</h3>
          <span className="font-mono text-xs text-slate-400">All figures in INR (₹)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3.5">Cost Category</th>
                <th className="p-3.5">Allocated Budget</th>
                <th className="p-3.5">Actual Incurred</th>
                <th className="p-3.5">Remaining Balance</th>
                <th className="p-3.5">Burn Rate</th>
                <th className="p-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {costCategories.map((c) => {
                const pct = Math.round((c.actual / (c.allocated || 1)) * 100);
                return (
                  <tr key={c.category} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-sans font-semibold text-white">{c.category}</td>
                    <td className="p-3.5 text-slate-300">₹{(c.allocated / 100000).toFixed(2)} L</td>
                    <td className="p-3.5 text-emerald-400 font-bold">₹{(c.actual / 100000).toFixed(2)} L</td>
                    <td className="p-3.5 text-slate-300">₹{(c.variance / 100000).toFixed(2)} L</td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${pct > 90 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        <span className="text-[11px] text-slate-400">{pct}%</span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right font-sans">
                      <Badge variant={pct > 90 ? 'warning' : 'success'}>
                        {pct > 90 ? 'HIGH BURN' : 'CONTROLLED'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
