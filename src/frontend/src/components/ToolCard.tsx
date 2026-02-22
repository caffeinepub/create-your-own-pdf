import { Link } from '@tanstack/react-router';
import { ArrowRight } from 'lucide-react';

interface ToolCardProps {
  icon: string;
  title: string;
  description: string;
  path: string;
}

export default function ToolCard({ icon, title, description, path }: ToolCardProps) {
  return (
    <Link to={path}>
      <div className="group h-full p-6 rounded-xl border border-border bg-card hover:bg-accent/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <img src={icon} alt={title} className="w-12 h-12" />
          </div>
          <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
          <div className="flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
