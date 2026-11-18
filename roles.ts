import type { DepthLevel, RoleDefinition, RoleId } from '../types/chat';

export const ANTI_HALLUCINATION_RULE =
  "You must NEVER guess, assume, or fabricate facts. If a question asks about something fictional, non-existent, future events, or if verified information is not available, do NOT try to make up an answer. Clearly and politely reply: 'I do not have verified information about this right now, so I cannot answer it,' and stop immediately.";

export const ROLE_DEFINITIONS: Record<RoleId, RoleDefinition> = {
  general: {
    id: 'general',
    label: 'General (Default)',
    emoji: '🌐',
    shortDesc: 'Neutral, factual assistant with strict anti-hallucination guardrails',
    adaptiveToggleLabel: 'Concise Fact-Check',
    adaptiveToggleDesc: 'Direct verified facts with clear certainty boundaries',
    outputFormats: [
      {
        id: 'concise-fact-check',
        label: 'Concise Fact-Check',
        description: 'Verified facts first, clear distinctions & zero fluff',
        instruction:
          'Format the response as a crisp, objective fact-check: state verified core facts directly, highlight any important caveats, and avoid filler.',
      },
      {
        id: 'structured-overview',
        label: 'Structured Overview',
        description: 'Logical key points with clear takeaways',
        instruction:
          'Organize the answer into clean, scannable key points with bolded terms and a brief summary takeaway.',
      },
    ],
    quickActions: [
      {
        id: 'fact-check-claim',
        label: 'Fact-Check a Claim',
        description: 'Verify accuracy with clear evidence',
        instruction:
          'Critically evaluate the claim or topic using strictly verified knowledge, noting what is established vs. unverified.',
        starterTemplate: 'Fact-check this claim: [enter claim or topic]',
      },
      {
        id: 'pros-cons-general',
        label: 'Pros & Cons Overview',
        description: 'Balanced trade-offs at a glance',
        instruction:
          'Present an objective, balanced Pros and Cons breakdown for the current topic.',
        starterTemplate: 'Give a balanced pros and cons overview of [topic].',
      },
      {
        id: 'compare-options',
        label: 'Compare Two Options',
        description: 'Side-by-side differences & use cases',
        instruction:
          'Compare the options clearly side-by-side covering strengths, weaknesses, and when to choose each.',
        starterTemplate: 'Compare [Option A] vs [Option B] clearly.',
      },
      {
        id: 'summarize-key-facts',
        label: 'Summarize Key Facts',
        description: 'Distill essentials cleanly',
        instruction:
          'Distill the most important verified facts and takeaways about this topic clearly.',
        starterTemplate: 'Summarize the key facts about [topic].',
      },
    ],
  },
  student: {
    id: 'student',
    label: 'Student',
    emoji: '🎓',
    shortDesc: 'Clear tutoring, exam prep, and concept mastery',
    adaptiveToggleLabel: 'Exam Bullet Points',
    adaptiveToggleDesc: 'High-yield bullet points & revision takeaways',
    outputFormats: [
      {
        id: 'exam-bullet-points',
        label: 'Exam Bullet Points',
        description: 'High-yield exam bullets & bolded key terms',
        instruction:
          'Emphasize high-yield exam takeaways, crisp bullet points, and bolded key terms ready for fast revision.',
      },
      {
        id: 'step-by-step-derivation',
        label: 'Step-by-Step Study Guide',
        description: 'Concept -> Formula/Rule -> Solved Example',
        instruction:
          'Walk through the concept sequentially: core idea, key rule/formula, and a clear worked example.',
      },
    ],
    quickActions: [
      {
        id: 'eli10',
        label: "Explain Like I'm 10",
        description: 'Zero jargon, intuitive everyday analogies',
        instruction:
          "Explain the current topic or question as if I am 10 years old, using simple words and an everyday analogy.",
        starterTemplate: "Explain [topic] like I'm 10 years old.",
      },
      {
        id: 'mcqs',
        label: 'Create 5 Practice MCQs',
        description: 'Multiple-choice quiz with answer key',
        instruction:
          'Create 5 multiple-choice practice questions (MCQs) with 4 options each on the current topic, followed by a clear answer key and brief explanations.',
        starterTemplate: 'Create 5 practice MCQs with answers on [topic].',
      },
      {
        id: 'exam-notes',
        label: 'Make Short Exam Notes',
        description: 'Crisp definitions, formulas & key points',
        instruction:
          'Summarize the current topic into concise, high-yield short exam revision notes with key definitions and must-remember facts.',
        starterTemplate: 'Make short exam revision notes for [topic].',
      },
      {
        id: 'real-life',
        label: 'Real-Life Example',
        description: 'Connect theory to practical scenarios',
        instruction:
          'Give 2–3 concrete, relatable real-life examples demonstrating how this concept works in the real world.',
        starterTemplate: 'Give practical real-life examples of [topic].',
      },
    ],
  },
  teacher: {
    id: 'teacher',
    label: 'Teacher',
    emoji: '👩‍🏫',
    shortDesc: 'Lesson design, assessments, and classroom clarity',
    adaptiveToggleLabel: 'Lesson Plan & Rubric',
    adaptiveToggleDesc: 'Learning Objectives, Teaching Steps, Board Examples & Rubric',
    outputFormats: [
      {
        id: 'lesson-plan-rubric',
        label: 'Lesson Plan & Rubric',
        description: 'Objectives, Teaching Steps, Board Examples & Quick Assessment',
        instruction:
          'Structure the reply to cover: 1) Learning Objectives, 2) Teaching Steps, 3) Board Examples, and 4) Quick Assessment Questions / Rubric criteria.',
      },
      {
        id: 'classroom-worksheet',
        label: 'Classroom Handout',
        description: 'Student-ready explanation with practice prompts',
        instruction:
          'Format the response as a clean classroom handout with key concept summary and 2–3 student check-for-understanding questions.',
      },
    ],
    quickActions: [
      {
        id: 'lesson-plan',
        label: 'Create Lesson Plan',
        description: 'Objectives, pacing, activities & wrap-up',
        instruction:
          'Create a structured 45-minute classroom lesson plan for the current topic including learning objectives, warm-up, core explanation, student activity, and exit ticket.',
        starterTemplate: 'Create a 45-minute lesson plan for teaching [topic].',
      },
      {
        id: 'quiz-paper',
        label: 'Generate Quiz Paper',
        description: 'Balanced assessment with marking scheme',
        instruction:
          'Generate a classroom quiz paper on this topic with mixed question types (short answer, conceptual, and application) plus a teacher answer key.',
        starterTemplate: 'Generate a classroom quiz paper with answer key for [topic].',
      },
      {
        id: 'analogies',
        label: 'Simplification Analogies',
        description: 'Memorable metaphors for diverse learners',
        instruction:
          'Provide 3 clear, classroom-ready analogies to help students who struggle with this concept grasp it intuitively.',
        starterTemplate: 'Give 3 classroom-ready simplification analogies for [topic].',
      },
      {
        id: 'rubric',
        label: 'Grading Rubric',
        description: 'Clear criteria across achievement levels',
        instruction:
          'Design an objective, structured 4-level grading rubric (Exemplary, Proficient, Developing, Beginning) for an assignment on this topic.',
        starterTemplate: 'Create a 4-level grading rubric for an assignment on [topic].',
      },
    ],
  },
  businessman: {
    id: 'businessman',
    label: 'Businessman',
    emoji: '💼',
    shortDesc: 'Strategy, ROI, growth plans, and executive comms',
    adaptiveToggleLabel: 'Executive Pitch',
    adaptiveToggleDesc: 'Headline brief, ROI impact & next steps',
    outputFormats: [
      {
        id: 'executive-pitch',
        label: 'Executive Pitch',
        description: 'Strategic rationale, ROI impact & next steps',
        instruction:
          'Frame the response with executive clarity: headline recommendation, strategic market value, cost/ROI impact, and concrete next steps.',
      },
      {
        id: 'decision-memo',
        label: 'Decision Memo',
        description: 'Options, risks & clear go/no-go recommendation',
        instruction:
          'Present the answer as a tight executive decision memo covering context, key options, risk mitigation, and recommended action.',
      },
    ],
    quickActions: [
      {
        id: 'swot',
        label: 'SWOT Analysis',
        description: 'Strengths, weaknesses, opportunities, threats',
        instruction:
          'Conduct a crisp, actionable SWOT analysis (Strengths, Weaknesses, Opportunities, Threats) for the current business topic or idea.',
        starterTemplate: 'Perform a SWOT analysis for [business / product / idea].',
      },
      {
        id: 'marketing-plan',
        label: 'Marketing & Growth Plan',
        description: 'Channels, positioning & customer acquisition',
        instruction:
          'Outline a practical marketing and growth plan covering target audience, positioning, top acquisition channels, and 90-day milestones.',
        starterTemplate: 'Create a 90-day marketing and growth plan for [product / business].',
      },
      {
        id: 'pro-email',
        label: 'Draft Professional Email',
        description: 'Polished, persuasive stakeholder outreach',
        instruction:
          'Draft a clear, persuasive, and polished professional business email based on the current context, with a strong subject line and call to action.',
        starterTemplate: 'Draft a professional business email regarding [purpose / recipient].',
      },
      {
        id: 'cost-roi',
        label: 'Cost vs ROI Breakdown',
        description: 'Investment trade-offs and value drivers',
        instruction:
          'Provide a clear Cost vs ROI breakdown highlighting expected investment categories, value drivers, payback considerations, and risk factors.',
        starterTemplate: 'Provide a Cost vs ROI breakdown for [initiative / investment].',
      },
    ],
  },
  'data-analyst': {
    id: 'data-analyst',
    label: 'Data Analyst',
    emoji: '📊',
    shortDesc: 'Metrics, KPIs, trend analysis, and structured tables',
    adaptiveToggleLabel: 'Data Table & KPIs',
    adaptiveToggleDesc: 'Markdown tables, metrics & analytical summary',
    outputFormats: [
      {
        id: 'data-table-kpis',
        label: 'Data Table & KPIs',
        description: 'Measurable KPIs, formulas & structured comparisons',
        instruction:
          'Highlight measurable KPIs, formulas, and structured analytical comparisons (in Deep Expert mode use Markdown tables; in Simple mode keep metrics inline within the single 50–70 word paragraph).',
      },
      {
        id: 'sql-analytics-brief',
        label: 'Metric Audit & Diagnostics',
        description: 'Root-cause dimensions, segments & guardrail metrics',
        instruction:
          'Structure the answer around diagnostic segments, leading/lagging indicators, and guardrail metrics to monitor.',
      },
    ],
    quickActions: [
      {
        id: 'key-insights',
        label: 'Find Key Insights',
        description: 'Patterns, anomalies & root-cause signals',
        instruction:
          'Analyze the current topic or dataset context and surface the top key insights, patterns, potential anomalies, and actionable recommendations.',
        starterTemplate: 'Analyze and extract the key insights from [dataset / metric / scenario].',
      },
      {
        id: 'metrics-kpis',
        label: 'Suggest Metrics & KPIs',
        description: 'North-star metrics, formulas & guardrails',
        instruction:
          'Recommend the most relevant KPIs and guardrail metrics for this domain, including exact formulas and how to interpret each metric.',
        starterTemplate: 'Suggest the essential metrics and KPIs with formulas for [domain / goal].',
      },
      {
        id: 'explain-trends',
        label: 'Explain Trends Simply',
        description: 'Translate analytical findings for stakeholders',
        instruction:
          'Explain the underlying analytical trends and statistical behavior in plain, stakeholder-friendly language without losing accuracy.',
        starterTemplate: 'Explain the key trends and drivers behind [metric / phenomenon] simply.',
      },
      {
        id: 'summary-table',
        label: 'Create Summary Table',
        description: 'Clean Markdown comparison & metrics grid',
        instruction:
          'Organize the key comparisons, dimensions, and metrics for this topic into a clean, well-structured Markdown summary table.',
        starterTemplate: 'Create a structured Markdown summary table comparing [items / metrics].',
      },
    ],
  },
  custom: {
    id: 'custom',
    label: 'Custom Role',
    emoji: '✨',
    shortDesc: 'Tailored expert persona defined by you',
    adaptiveToggleLabel: 'Structured Action Plan',
    adaptiveToggleDesc: 'Step-by-step checklist & practical execution',
    outputFormats: [
      {
        id: 'structured-action-plan',
        label: 'Structured Action Plan',
        description: 'Concrete sequential steps & practical checklists',
        instruction:
          'Focus on concrete, prioritized actionable steps and practical verification takeaways tailored to your domain persona.',
      },
      {
        id: 'expert-brief',
        label: 'Domain Expert Brief',
        description: 'Best practices, pitfalls & recommendations',
        instruction:
          'Deliver a crisp domain-expert perspective covering best practices, common pitfalls to avoid, and key recommendations.',
      },
    ],
    quickActions: [
      {
        id: 'step-by-step',
        label: 'Step-by-Step Guide',
        description: 'Clear sequential roadmap from start to finish',
        instruction:
          'Provide a clear, practical step-by-step guide tailored to your expert persona for the current topic.',
        starterTemplate: 'Give a step-by-step guide on [topic].',
      },
      {
        id: 'pros-cons',
        label: 'Pros & Cons',
        description: 'Balanced trade-off analysis & verdict',
        instruction:
          'Present a balanced Pros & Cons analysis covering key benefits, limitations, and practical trade-offs.',
        starterTemplate: 'Analyze the pros and cons of [topic / decision].',
      },
      {
        id: 'checklist',
        label: 'Actionable Checklist',
        description: 'Ready-to-use verification & execution list',
        instruction:
          'Create a crisp, actionable checklist of concrete items to execute or verify for this topic.',
        starterTemplate: 'Create an actionable checklist for [task / goal].',
      },
      {
        id: 'deep-dive',
        label: 'Deep Dive Summary',
        description: 'Comprehensive synthesis of core principles',
        instruction:
          'Deliver a structured deep-dive summary covering core principles, nuances, and best practices.',
        starterTemplate: 'Provide a deep dive summary of [topic].',
      },
    ],
  },
};

export const DEPTH_LEVELS: {
  id: DepthLevel;
  label: string;
  description: string;
}[] = [
  {
    id: 'simple',
    label: 'Simple',
    description: '50–70 words · 1 short paragraph + 1 example',
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    description: '150–180 words · 2-line intro + 3–4 bullets',
  },
  {
    id: 'deep-expert',
    label: 'Deep Expert',
    description: '400+ words · Headings, tables & deep analysis',
  },
];

export function getRoleDisplayName(roleId: RoleId, customRoleName?: string): string {
  if (roleId === 'custom') {
    const trimmed = customRoleName?.trim();
    return trimmed ? trimmed : 'Custom Expert';
  }
  return ROLE_DEFINITIONS[roleId]?.label ?? 'General (Default)';
}

export function getRoleEmoji(roleId: RoleId): string {
  return ROLE_DEFINITIONS[roleId]?.emoji ?? '🌐';
}

export function buildSystemInstruction(params: {
  roleId: RoleId;
  customRoleName?: string;
  depthLevel: DepthLevel;
  hinglishMode: boolean;
  adaptiveFormat?: boolean;
  activeFormatLabel?: string;
  activeFormatInstruction?: string;
  antiHallucinationEnabled?: boolean;
}): string {
  const {
    roleId,
    customRoleName,
    depthLevel,
    hinglishMode,
    adaptiveFormat,
    activeFormatLabel,
    activeFormatInstruction,
    antiHallucinationEnabled = true,
  } = params;

  const isAntiHallucination = antiHallucinationEnabled !== false;

  const personaLines: Record<RoleId, string> = {
    general: isAntiHallucination
      ? 'Active Persona: You are a neutral, clear, factual general-purpose assistant. Answer directly, accurately, and objectively without unnecessary roleplay.'
      : 'Active Persona: You are an imaginative, helpful general-purpose assistant. Answer directly, thoughtfully, and creatively, exploring even hypothetical or fictional scenarios freely.',
    student:
      'Active Persona: You are an encouraging, crystal-clear academic tutor and study mentor helping a Student understand concepts deeply and succeed in exams.',
    teacher:
      'Active Persona: You are an experienced, creative educator and curriculum specialist assisting a Teacher with lesson planning, classroom clarity, and assessment design.',
    businessman:
      'Active Persona: You are a sharp, pragmatic executive business strategist and advisor helping a Businessman evaluate ROI, growth, operations, and professional communication.',
    'data-analyst':
      'Active Persona: You are a principal Data Analyst and BI architect focused on quantitative rigor, KPIs, trend interpretation, and structured data presentation.',
    custom: `Active Persona: You are a seasoned expert acting as a ${getRoleDisplayName(
      'custom',
      customRoleName
    )}. Adopt authentic domain expertise, practical judgment, and clarity suited to this role.`,
  };

  const depthLines: Record<DepthLevel, string> = {
    simple:
      'STRICT DEPTH & LENGTH LIMIT (Simple Mode): Your entire response MUST be STRICTLY 50 to 70 words maximum. Write exactly one short, beginner-friendly paragraph containing 1 simple real-life example. Strictly NO headings, NO tables, NO bullet lists, and NO long lists. Never exceed 70 words.',
    intermediate:
      'STRICT DEPTH & LENGTH LIMIT (Intermediate Mode): Your entire response MUST be STRICTLY 150 to 180 words. Start with a brief 2-line introduction followed by 3–4 concise, well-structured bullet points with practical examples. Stay strictly within 150 to 180 words.',
    'deep-expert':
      'STRICT DEPTH & LENGTH LIMIT (Deep Expert Mode): Provide a comprehensive, detailed analysis of 400+ words minimum. Use structured Markdown headings, include comparison or KPI tables where helpful, and deliver rigorous technical or strategic depth covering mechanisms, edge cases, and trade-offs.',
  };

  const formattingDirectives: string[] = [];

  if (hinglishMode) {
    formattingDirectives.push(
      'Language Style (Hinglish Mode ON): Reply in natural, easy-to-read conversational Hinglish — a friendly mix of everyday Hindi (written in Latin/Roman script) and clear English technical/key terms. Keep it natural, crisp, and professional.'
    );
  }

  if (activeFormatInstruction && activeFormatInstruction.trim().length > 0) {
    formattingDirectives.push(
      `Formatting Style (${activeFormatLabel || 'Selected Output Format'} ON): ${activeFormatInstruction.trim()} (Always still strictly obey the active Depth & Length Limit above.)`
    );
  } else if (adaptiveFormat) {
    const defaultFormat = ROLE_DEFINITIONS[roleId]?.outputFormats[0];
    if (defaultFormat) {
      formattingDirectives.push(
        `Formatting Style (${defaultFormat.label} ON): ${defaultFormat.instruction} (Always still strictly obey the active Depth & Length Limit above.)`
      );
    }
  }

  const closingSafetyClause = isAntiHallucination
    ? ' Never fabricate statistics, citations, URLs, or quotes.'
    : ' Do not refuse hypothetical, fictional, or speculative prompts—answer them directly and creatively while obeying the word-count & formatting rules above.';

  const closingRuleByDepth: Record<DepthLevel, string> = {
    simple: `Final Enforcement: Count your words before outputting. Output ONE short paragraph (50–70 words total) with 1 simple real-life example, zero headings, zero tables, and zero lists.${closingSafetyClause}`,
    intermediate: `Final Enforcement: Count your words before outputting. Output a brief 2-line intro plus 3–4 concise bullet points totaling 150–180 words.${closingSafetyClause}`,
    'deep-expert': `Final Enforcement: Write a thorough 400+ word expert analysis using clean GitHub-flavored Markdown (structured headings, comparison tables, bold key terms, and fenced code blocks where relevant).${closingSafetyClause}`,
  };

  const guardrailHeader = isAntiHallucination
    ? ['STRICT ANTI-HALLUCINATION MANDATE (HIGHEST PRIORITY):', ANTI_HALLUCINATION_RULE]
    : [
        'CREATIVE & SPECULATIVE MODE (ANTI-HALLUCINATION OFF):',
        'You are operating in standard creative LLM mode with NO strict refusal constraint. Even if a user asks about hypothetical, speculative, future, fictional, unverified, or made-up topics, do NOT refuse to answer—engage creatively, brainstorm plausible ideas, extrapolate scenarios, or answer imaginatively as a standard LLM would.',
      ];

  return [
    ...guardrailHeader,
    '',
    personaLines[roleId] ?? personaLines.general,
    depthLines[depthLevel],
    ...(formattingDirectives.length > 0 ? ['', ...formattingDirectives] : []),
    '',
    closingRuleByDepth[depthLevel],
  ].join('\n');
}
