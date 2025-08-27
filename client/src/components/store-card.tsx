import { Link } from "wouter";
import type { Store } from "@shared/schema";

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={`/stores/${store.slug}`}>
      <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border p-6 text-center cursor-pointer group h-48 flex flex-col justify-center" data-testid={`card-store-${store.slug}`}>
        <img 
          src={store.logoUrl || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100'} 
          alt={`${store.name} logo`} 
          className="w-20 h-12 mx-auto mb-3 object-contain flex-shrink-0"
          data-testid={`img-store-logo-${store.slug}`}
        />
        <h3 className="font-semibold text-net-dark group-hover:text-net-green transition-colors text-sm mb-2 flex-shrink-0" data-testid={`text-store-name-${store.slug}`}>
          {store.name}
        </h3>
        {store.description && (
          <p className="text-sm text-gray-600 line-clamp-2 overflow-hidden leading-relaxed" data-testid={`text-store-description-${store.slug}`}>
            {store.description}
          </p>
        )}
      </div>
    </Link>
  );
}
