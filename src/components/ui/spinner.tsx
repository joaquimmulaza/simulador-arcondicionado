import { cn } from '@/lib/utils';

interface SpinnerProps {
  className?: string;
}

export const Spinner = ({ className }: SpinnerProps) => {
  return (
    <div className={cn('flex items-center justify-center', className)}>
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="animate-spin">
        <defs>
          <linearGradient id="spinner-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--s-green)" />
            <stop offset="100%" stopColor="var(--s-blue)" />
          </linearGradient>
        </defs>
        <path d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,19a8,8,0,1,1,8-8A8,8,0,0,1,12,20Z" fill="url(#spinner-gradient)" />
      </svg>
    </div>
  );
};
