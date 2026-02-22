function WorkflowStep({ index, label, state }: {
  index: number;
  label: string;
  state: 'done' | 'active' | 'idle';
}) {
  return (
    <div className={`workflow-step ${state}`}>
      <div className="workflow-step-dot">
        {state === 'done' ? (
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : index}
      </div>
      <span className="workflow-step-label">{label}</span>
    </div>
  );
}

interface WorkflowBarProps {
  workflowStep: number;
  deviceWidth: number;
  deviceHeight: number;
}

export function WorkflowBar({ workflowStep, deviceWidth, deviceHeight }: WorkflowBarProps) {
  return (
    <div className="workflow-bar">
      <div className="workflow-steps">
        <WorkflowStep index={1} label="Upload" state={workflowStep > 1 ? 'done' : 'active'} />
        <div className="workflow-step-link" />
        <WorkflowStep index={2} label="Style" state={workflowStep > 2 ? 'done' : workflowStep === 2 ? 'active' : 'idle'} />
        <div className="workflow-step-link" />
        <WorkflowStep index={3} label="Export" state={workflowStep === 3 ? 'active' : 'idle'} />
      </div>
      <div className="workflow-bar-meta">
        <span className="workflow-meta-chip">Target {deviceWidth}×{deviceHeight}</span>
      </div>
    </div>
  );
}
