import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { SERVICE_CATEGORIES, ServiceCategory } from '@/types';
import { getCategoryIcon, getCategoryColor } from '@/components/Icons';

interface CategoryGridProps {
  selectedCategory?: ServiceCategory;
  onSelect?: (category: ServiceCategory) => void;
  asLinks?: boolean;
}

export function CategoryGrid({ selectedCategory, onSelect, asLinks = true }: CategoryGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {SERVICE_CATEGORIES.map((category) => {
        const Icon = getCategoryIcon(category.id);
        const isSelected = selectedCategory === category.id;
        const colorClass = getCategoryColor(category.id);

        const content = (
          <Card 
            className={`cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
              isSelected ? 'ring-2 ring-primary shadow-lg' : ''
            }`}
          >
            <CardContent className="flex flex-col items-center justify-center p-6 gap-3">
              <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${colorClass}`}>
                <Icon className="h-7 w-7" />
              </div>
              <span className="text-sm font-medium text-center">{category.label}</span>
            </CardContent>
          </Card>
        );

        if (asLinks) {
          return (
            <Link key={category.id} to={`/search?category=${category.id}`}>
              {content}
            </Link>
          );
        }

        return (
          <div key={category.id} onClick={() => onSelect?.(category.id)}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
