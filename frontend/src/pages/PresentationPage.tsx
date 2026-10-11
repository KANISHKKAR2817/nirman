import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge } from '../components/common/Badge';
import {
  Presentation,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Box,
  GitBranch,
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  FileSpreadsheet,
  AlertTriangle,
} from 'lucide-react';

interface Step {
  stepNumber: number;
  title: string;
  stage: string;
  problemNarrative: string;
  solutionNarrative: string;
  actionLabel: string;
  actionLink: string;
  keyHighlight: string;
}

const DEMO_STEPS: Step[] = [
  {
    stepNumber: 1,
    title: 'The Challenge & Command Center',
    stage: 'EXECUTIVE OVERVIEW',
    problemNarrative:
      'Construction managers juggle fragmented Excel sheets, disjointed ERPs, and outdated weekly reports. Schedule delays and cost overruns are discovered weeks too late.',
    solutionNarrative:
      'NIRMAN aggregates structural progress (48.5%), financial draw-downs (₹4.25 Cr), active workforce, and critical path health into a real-time command center.',
    actionLabel: 'Inspect Executive Dashboard',
    actionLink: '/',
    keyHighlight: '10 real-time KPIs + Planned vs Actual S-Curve + Material stock buffers',
  },
  {
    stepNumber: 2,
    title: 'Interactive 3D Digital Twin Inspection',
    stage: 'BIM 3D TWIN',
    problemNarrative:
      'Site engineers cannot visualize spatial bottlenecks from 2D Gantt charts alone. Conflicts between tower cranes, rebar crews, and materials remain hidden.',
    solutionNarrative:
      'NIRMAN models an architectural 14-storey building with procedural geometry, animated Liebherr tower crane, active equipment, and layer overlays (Progress, Risk, Equipment, Yards).',
    actionLabel: 'Launch 3D Digital Twin Control Room',
    actionLink: '/digital-twin',
    keyHighlight: 'WebGL Three.js canvas + Floor slice isolating + Real-time entity drawer',
  },
  {
    stepNumber: 3,
    title: 'Spatial Selection & Database Synchronization',
    stage: 'OBJECT-ORIENTED SYNC',
    problemNarrative:
      'Most hackathon digital twins are non-interactive 3D mockups detached from business databases.',
    solutionNarrative:
      'Clicking Level 7 slab in the 3D twin instantly queries Spring Boot REST endpoints to fetch work packages, assigned contractors, and structural health.',
    actionLabel: 'View Level 7 Work Packages',
    actionLink: '/tasks',
    keyHighlight: 'Bidirectional sync: 3D meshes map directly to JPA entity records',
  },
  {
    stepNumber: 4,
    title: 'Injecting Site Delay & Cement Shortage',
    stage: 'STRESS TEST SIMULATION',
    problemNarrative:
      'Supply chain bottlenecks and weather disruptions halt active pours, triggering cascade delays.',
    solutionNarrative:
      'Demonstrate a 3.5-day schedule slippage on rebar fixing and cement stock dropping to 320 bags (below safety threshold).',
    actionLabel: 'Review Inventory Deficit',
    actionLink: '/materials',
    keyHighlight: 'Automatic threshold breach alerts + Anti-deficit stock validation',
  },
  {
    stepNumber: 5,
    title: 'Deterministic & Explainable Risk Assessment',
    stage: 'RISK PREDICTION ENGINE',
    problemNarrative:
      'Black-box generative AI tools hallucinate fabricated probability figures that licensed civil structural engineers cannot trust.',
    solutionNarrative:
      'NIRMAN employs a transparent, weighted rule-based model: Schedule Risk (40%), Resource Risk (30%), Safety Risk (30%). Composite score: 68.4 / 100 with actionable directives.',
    actionLabel: 'Inspect Risk Attribution Formula',
    actionLink: '/risk-safety',
    keyHighlight: 'Fully explainable: exact contributing data points + mathematical weights',
  },
  {
    stepNumber: 6,
    title: 'CPM What-If Schedule Simulator',
    stage: 'SCHEDULE SIMULATOR',
    problemNarrative:
      'Managers need to test recovery strategies (adding overtime crews or fast-tracking) without risking real project data.',
    solutionNarrative:
      'Experiment with adding +6 crew members, reducing duration by 5 days, and reallocating tower crane TC-01. Calculate CPM critical path impact in an isolated sandbox.',
    actionLabel: 'Run What-If CPM Simulation',
    actionLink: '/simulator',
    keyHighlight: 'DAG Critical Path Method + Zero modifications to baseline until applied',
  },
  {
    stepNumber: 7,
    title: 'Baseline vs Scenario Variance & Decision',
    stage: 'DECISION GOVERNANCE',
    problemNarrative:
      'Trade-offs between speed and overtime cost must be presented clearly to developers and clients.',
    solutionNarrative:
      'Comparing baseline against simulated scenario reveals project completion advances by 7 days, reducing risk score from 68.4 to 42.1 with ₹14.5L overtime cost.',
    actionLabel: 'View Cost Variance & EAC',
    actionLink: '/budget',
    keyHighlight: 'Earned Value Analysis + Burn rate curves + 1-Click Apply to Baseline',
  },
  {
    stepNumber: 8,
    title: 'Immutable Audit Trail & Compliance Export',
    stage: 'AUDIT & REPORTING',
    problemNarrative:
      'Regulatory compliance, dispute arbitration, and ESG audits require tamper-evident history.',
    solutionNarrative:
      'Every progress update, stock consumption, and dependency override is recorded with actor IP and timestamp. Export sanitized CSV or printable audit reports.',
    actionLabel: 'Generate Official Audit Export',
    actionLink: '/reports',
    keyHighlight: 'Formula injection prevention + Immutable ledger + Print-ready layout',
  },
];

export const PresentationPage: React.FC = () => {
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const navigate = useNavigate();

  const step = DEMO_STEPS[currentStepIdx];

  const handleNext = () => {
    if (currentStepIdx < DEMO_STEPS.length - 1) {
      setCurrentStepIdx(currentStepIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Presentation Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-900 to-slate-900 border border-emerald-800/60 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Presentation className="w-6 h-6 text-emerald-400" />
            <h1 className="text-2xl font-black text-white tracking-tight">
              NIRMAN Hackathon Demonstration Script
            </h1>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            A structured, 8-stage interactive presentation designed for evaluators and technical judges, walking through the core problem, interactive 3D twin, explainable risk algorithms, and CPM simulation.
          </p>
        </div>

        <Badge variant="purple" size="md">
          Step {step.stepNumber} of {DEMO_STEPS.length}
        </Badge>
      </div>

      {/* Step Stepper Progress Indicator */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {DEMO_STEPS.map((s, idx) => (
          <button
            key={s.stepNumber}
            onClick={() => setCurrentStepIdx(idx)}
            className={`p-2.5 rounded-xl border text-center transition-all ${
              idx === currentStepIdx
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950 font-bold scale-105'
                : idx < currentStepIdx
                ? 'bg-slate-900 border-emerald-800 text-emerald-400 font-semibold'
                : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <div className="text-[10px] font-mono">0{s.stepNumber}</div>
            <div className="text-[9px] uppercase tracking-wider truncate mt-0.5">{s.stage.split(' ')[0]}</div>
          </button>
        ))}
      </div>

      {/* Main Active Step Showcase Card */}
      <div className="panel-card p-6 md:p-8 space-y-6 relative overflow-hidden">
        {/* Ambient accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-widest">
              STAGE 0{step.stepNumber} • {step.stage}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-white mt-1">{step.title}</h2>
          </div>
          <Badge variant="info" size="md">
            Judge Script
          </Badge>
        </div>

        {/* Problem vs Solution Narrative */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-red-950/20 border border-red-800/40 space-y-2">
            <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
              1. Industry Bottleneck & Problem Statement
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{step.problemNarrative}</p>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
              2. NIRMAN Technological Solution
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{step.solutionNarrative}</p>
          </div>
        </div>

        {/* Key Architectural Highlight */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase">
                Technical Highlights For Judges:
              </span>
              <div className="text-xs font-semibold text-white mt-0.5">{step.keyHighlight}</div>
            </div>
          </div>

          <button
            onClick={() => navigate(step.actionLink)}
            className="btn-primary text-xs shrink-0 flex items-center gap-1.5"
          >
            {step.actionLabel}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Stepper Navigation Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIdx === 0}
            className="btn-secondary text-xs disabled:opacity-40"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous Stage
          </button>

          <span className="text-xs font-mono text-slate-400">
            {currentStepIdx + 1} / {DEMO_STEPS.length}
          </span>

          <button
            onClick={handleNext}
            disabled={currentStepIdx === DEMO_STEPS.length - 1}
            className="btn-primary text-xs disabled:opacity-40"
          >
            Next Stage <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
