import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Building2 } from "lucide-react";

interface Subdomain {
  id: string;
  subdomain: string;
  displayName: string;
  description?: string;
  isActive: boolean;
}

interface SubdomainSelectorProps {
  value: string;
  onValueChange: (subdomainId: string) => void;
  includeAllOption?: boolean;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function SubdomainSelector({ 
  value, 
  onValueChange, 
  includeAllOption = true,
  label = "Subdomain",
  placeholder = "Select a subdomain",
  className = ""
}: SubdomainSelectorProps) {
  const { data: subdomains = [], isLoading } = useQuery<Subdomain[]>({
    queryKey: ['/api/subdomains'],
    queryFn: async () => {
      const response = await fetch('/api/subdomains');
      if (!response.ok) throw new Error('Failed to fetch subdomains');
      return response.json();
    },
  });

  const activeSubdomains = subdomains.filter(subdomain => subdomain.isActive);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="subdomain-select" className="flex items-center gap-2">
        <Building2 className="w-4 h-4" />
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
        <SelectTrigger id="subdomain-select" data-testid="subdomain-selector">
          <SelectValue placeholder={isLoading ? "Loading..." : placeholder} />
        </SelectTrigger>
        <SelectContent>
          {includeAllOption && (
            <SelectItem value="all" data-testid="subdomain-all">
              All Subdomains
            </SelectItem>
          )}
          {activeSubdomains.map((subdomain) => (
            <SelectItem 
              key={subdomain.id} 
              value={subdomain.id}
              data-testid={`subdomain-${subdomain.subdomain}`}
            >
              <div className="flex flex-col">
                <span className="font-medium">{subdomain.displayName}</span>
                <span className="text-xs text-gray-500">{subdomain.subdomain}</span>
                {subdomain.description && (
                  <span className="text-xs text-gray-400">{subdomain.description}</span>
                )}
              </div>
            </SelectItem>
          ))}
          {activeSubdomains.length === 0 && !isLoading && (
            <SelectItem value="_" disabled>
              No subdomains available
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}