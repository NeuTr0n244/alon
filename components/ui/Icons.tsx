import { Twitter, Send, Globe } from 'lucide-react';

interface SocialIconProps {
  href?: string;
  type: 'twitter' | 'telegram' | 'website';
}

export function SocialIcon({ href, type }: SocialIconProps) {
  if (!href) return null;

  const icons = {
    twitter: Twitter,
    telegram: Send,
    website: Globe,
  };

  const Icon = icons[type];

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-text-secondary hover:text-green transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <Icon className="w-4 h-4" />
    </a>
  );
}
