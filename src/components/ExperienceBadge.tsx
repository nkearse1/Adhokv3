import React from 'react';
import { Star, Trophy, Medal, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  level: 'entry' | 'mid' | 'expert' | 'elite';
  className?: string;
}

export default function ExperienceBadge({ level, className }: Props) {
  const config = {
    entry: {
      icon: Star,
      label: 'Entry-Level',
      baseClasses: 'bg-blue-50 text-blue-700 border border-blue-200',
    },
    mid: {
      icon: Medal,
      label: 'Professional',
      baseClasses: 'bg-purple-50 text-purple-700 border border-purple-200',
    },
    expert: {
      icon: Trophy,
      label: 'Expert',
      baseClasses: 'bg-orange-50 text-orange-700 border border-orange-200',
    },
    elite: {
      icon: Award,
      label: 'Elite Expert',
      baseClasses: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
    },
  };

  const { icon: Icon, label, baseClasses } = config[level];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
        baseClasses,
        className
      )}
      aria-label={`Experience level: ${label}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </span>
  );
}