import { Link } from "wouter";
import type { Store } from "@shared/schema";

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {
  return (
    <Link href={`/stores/${store.slug}`}>
      <div className="bg-white rounded-lg overflow-clip shadow-sm hover:shadow-md transition-shadow border text-center cursor-pointer group flex flex-col justify-center" data-testid={`card-store-${store.slug}`}>
        <img 
          src={store.logoUrl || 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=100'} 
          alt={`${store.name} logo`} 
          className="mb-3 flex-shrink-0 object-cover h-36"
          data-testid={`img-store-logo-${store.slug}`}
        />

        <div className="p-2" >

        <h3 className="font-semibold text-net-dark group-hover:text-net-green transition-colors text-sm mb-2 flex-shrink-0" data-testid={`text-store-name-${store.slug}`}>
          {store.name}
        </h3>
        {store.description && (
          <p className="text-sm text-gray-600 line-clamp-2 overflow-hidden leading-relaxed" data-testid={`text-store-description-${store.slug}`}>
            {store.description}
          </p>
        )}
        </div>
      </div>
    </Link>
  );
}
