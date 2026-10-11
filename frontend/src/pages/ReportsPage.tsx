import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { currentProject } = useProject();
  const [reportType, setReportType] = useState('EXECUTIVE_STATUS');
  const [dateRange, setDateRange] = useState('ALL_TIME');
  const [isExporting, setIsExporting] = useState(false);

  // Secure CSV Export with Formula Injection Sanitization
  const handleExportCsv = () => {
    setIsExporting(true);
    try {
      const headers = ['Report Metric / Work Package', 'Category / Zone', 'Current Metric', 'Threshold / Plan', 'Status'];
      const rows = [
        ['Overall Tower Construction', 'Civil Superstructure', '48.5%', '58.0%', 'SLIPPING (-9.5%)'],
        ['L7 Rebar & Formwork TSK-06', 'Level 7', '65%', '100%', 'OVERDUE (3.5d delay)'],
        ['OPC 53 Grade Portland Cement', 'Bay-North Yard', '320 Bags', '500 Bags Buffer', 'LOW STOCK HAZARD'],
        ['Liebherr 280 EC-H Tower Crane', 'Central Core', '84% Utilization', '70% Target', 'OPERATIONAL'],
        ['Active Site Workforce', 'All Craft Shifts', '42 Workers', '40 Required', 'ADEQUATE'],
        ['Site Composite Risk Index', 'Deterministic Risk Engine', '68.4 / 100', '< 50.0 Target', 'HIGH SEVERITY'],
        ['Total Project Capital Incurred', 'Financial Ledger', 'INR 4.25 Cr', 'INR 8.50 Cr Approved', 'ON BUDGET'],
      ];

      // Formula injection sanitization
      const sanitizeCell = (text: string) => {
        let val = String(text);
        if (/^[=\+\-@\t\r]/.test(val)) {
          val = `'${val}`;
        }
        return `"${val.replace(/"/g, '""')}"`;
      };

      const csvContent =
        'data:text/csv;charset=utf-8,' +
        [
          headers.map(sanitizeCell).join(','),
          ...rows.map((r) => r.map(sanitizeCell).join(',')),
        ].join('\n');

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute(
        'download',
        `NIRMAN_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
            Executive Construction Reports & Data Export
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate verifiable audits, schedule slippage analysis, inventory valuations, and CSV exports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handlePrint} className="btn-secondary">
            <Printer className="w-3.5 h-3.5" />
            Print Report
          </button>
          <button onClick={handleExportCsv} disabled={isExporting} className="btn-primary">
            <Download className="w-3.5 h-3.5" />
            {isExporting ? 'Generating...' : 'Export Sanitized CSV'}
          </button>
        </div>
      </div>

      {/* Filter Selector (Print hidden) */}
      <div className="flex flex-col sm:flex-row gap-3 print:hidden">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="select-field sm:w-64"
        >
          <option value="EXECUTIVE_STATUS">Executive Project Progress Audit</option>
          <option value="CRITICAL_PATH_DELAY">Critical Path Schedule Slippage</option>
          <option value="MATERIAL_STOCK">Material Inventory Valuation & Shortages</option>
          <option value="WORKFORCE_SAFETY">Workforce & OSHA Safety Compliance</option>
          <option value="BUDGET_VARIANCE">Capital Incurred & Variance Ledger</option>
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="select-field sm:w-44"
        >
          <option value="ALL_TIME">Project Lifetime</option>
          <option value="LAST_30">Last 30 Days</option>
          <option value="CURRENT_SPRINT">Current Bi-Weekly Sprint</option>
        </select>
      </div>

      {/* Printable Report Preview Document */}
      <div className="panel-card p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        {/* Report Document Header */}
        <div className="border-b border-slate-800 pb-5 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white font-mono tracking-wider">
                NIRMAN DIGITAL TWIN PLATFORM
              </span>
              <Badge variant="purple" size="sm">
                OFFICIAL AUDIT REPORT
              </Badge>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Project: {currentProject?.name} ({currentProject?.code})
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Client: {currentProject?.client || 'Apex Urban Developers Ltd'} • PM: {currentProject?.projectManager || 'Rajesh Sharma'}
            </div>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            <div>Generated: {new Date().toLocaleDateString('en-GB')}</div>
            <div className="text-[10px] text-slate-500">Ref: AUD-{Date.now().toString().slice(-6)}</div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Completion</span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              {currentProject?.progressPercentage || 48.5}%
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Planned: 58.0% (-9.5% variance)</div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Risk Score</span>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">68.4 / 100</div>
            <div className="text-[10px] text-slate-400 mt-0.5">HIGH SEVERITY (Schedule & Stock)</div>
          </div>
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400">Budget Drawn</span>
            <div className="text-xl font-black text-white font-mono mt-1">₹4.25 Cr</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Total Approved: ₹8.50 Cr</div>
          </div>
        </div>

        {/* Detailed Audit Table */}
        <div className="space-y-3">
          <h3 className="font-bold text-sm text-white border-b border-slate-800 pb-2">
            Audit Ledger: Work Packages, Resources & Hazard Status
          </h3>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold text-[10px] uppercase">
              <tr>
                <th className="p-2.5">Indicator / Scope Package</th>
                <th className="p-2.5">Classification</th>
                <th className="p-2.5">Current Site State</th>
                <th className="p-2.5">Baseline Target</th>
                <th className="p-2.5 text-right">Engineering Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              <tr>
                <td className="p-2.5 font-medium text-white">Tower Structural Framing</td>
                <td className="p-2.5 text-slate-400">Civil Works</td>
                <td className="p-2.5 font-mono text-emerald-400">Level 8 Formwork</td>
                <td className="p-2.5 font-mono text-slate-400">Level 9 Cast</td>
                <td className="p-2.5 text-right">
                  <Badge variant="warning">DELAYED</Badge>
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-white">TSK-06 L7 Rebar Fixing</td>
                <td className="p-2.5 text-slate-400">Critical Path</td>
                <td className="p-2.5 font-mono text-amber-400">65% (Overdue)</td>
                <td className="p-2.5 font-mono text-slate-400">100% Complete</td>
                <td className="p-2.5 text-right">
                  <Badge variant="danger">CPM BOTTLENECK</Badge>
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-white">OPC Portland Cement Stock</td>
                <td className="p-2.5 text-slate-400">Material Yard</td>
                <td className="p-2.5 font-mono text-red-400">320 Bags</td>
                <td className="p-2.5 font-mono text-slate-400">500 Bags Minimum</td>
                <td className="p-2.5 text-right">
                  <Badge variant="danger">LOW STOCK</Badge>
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-white">Liebherr TC-01 Tower Crane</td>
                <td className="p-2.5 text-slate-400">Plant Equipment</td>
                <td className="p-2.5 font-mono text-blue-400">84% Utilization</td>
                <td className="p-2.5 font-mono text-slate-400">Available</td>
                <td className="p-2.5 text-right">
                  <Badge variant="success">OPTIMAL</Badge>
                </td>
              </tr>
              <tr>
                <td className="p-2.5 font-medium text-white">Safety Incident INC-03</td>
                <td className="p-2.5 text-slate-400">OSHA Safety</td>
                <td className="p-2.5 font-mono text-amber-400">Level 6 Toe-boards</td>
                <td className="p-2.5 font-mono text-slate-400">Resolved</td>
                <td className="p-2.5 text-right">
                  <Badge variant="warning">ACTION REQ</Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Certified Sign-off Footer */}
        <div className="pt-8 border-t border-slate-800 grid grid-cols-2 gap-8 text-xs text-slate-400">
          <div>
            <div className="h-10 border-b border-slate-700 w-48 mb-2" />
            <div>Project Director / Chief Engineer</div>
            <div className="text-[10px] text-slate-500">NIRMAN Digital Twin Verified</div>
          </div>
          <div className="text-right">
            <div className="h-10 border-b border-slate-700 w-48 ml-auto mb-2" />
            <div>Lead Safety & Compliance Auditor</div>
            <div className="text-[10px] text-slate-500">Stamp & Electronic Seal</div>
          </div>
        </div>
      </div>
    </div>
  );
};
