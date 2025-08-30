import { useState } from "react";
import { Link } from "wouter";
import type { Store } from "@shared/schema";
import { FAlLLBACK_IMAGE } from "@/lib/constant";

interface StoreCardProps {
  store: Store;
}

export default function StoreCard({ store }: StoreCardProps) {

  return (
    <Link href={`/stores/${store.slug}`}>
      <div
        className="bg-white rounded-lg overflow-clip shadow-sm hover:shadow-md transition-shadow border text-center cursor-pointer group flex flex-col justify-center"
        data-testid={`card-store-${store.slug}`}
      >
        <img
          src={store.logoUrl || FAlLLBACK_IMAGE}
          alt={`${store.name} logo`}
          className="mb-3 flex-shrink-0 object-cover h-36"
          data-testid={`img-store-logo-${store.slug}`}
          onError={(e) => {
            const target = e.currentTarget;
            target.onerror = null; // prevent infinite loop
            target.src = FAlLLBACK_IMAGE;
          }}
        />

        <div className="p-2">
          <h3
            className="font-semibold text-net-dark group-hover:text-net-green transition-colors text-sm mb-2 flex-shrink-0"
            data-testid={`text-store-name-${store.slug}`}
          >
            {store.name}
          </h3>
          {store.description && (
            <p
              className="text-sm text-gray-600 line-clamp-2 overflow-hidden leading-relaxed"
              data-testid={`text-store-description-${store.slug}`}
            >
              {store.description}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
