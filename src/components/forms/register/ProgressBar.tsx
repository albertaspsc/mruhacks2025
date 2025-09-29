export interface ProgressBarProps {
  step: number; // 1-based current step
  totalSteps: number; // total number of steps
}

export default function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const percent = Math.round((step / totalSteps) * 100);

  return (
    <div className="w-full bg-gray-200 h-1 rounded overflow-hidden">
      <div
        className="h-full bg-black transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
