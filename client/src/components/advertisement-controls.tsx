import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Settings, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface AdSettings {
  top: boolean;
  left: boolean;
  right: boolean;
  bottom: boolean;
  header: boolean;
}

interface AdvertisementControlsProps {
  adSettings: AdSettings;
  onSettingsChange: (settings: AdSettings) => void;
}

export function AdvertisementControls({ adSettings, onSettingsChange }: AdvertisementControlsProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Add null safety check
  if (!adSettings) {
    return null;
  }

  const handleToggle = (position: keyof AdSettings) => {
    onSettingsChange({
      ...adSettings,
      [position]: !adSettings[position]
    });
  };

  const toggleAll = () => {
    const allEnabled = Object.values(adSettings).every(Boolean);
    const newSettings: AdSettings = {
      top: !allEnabled,
      left: !allEnabled,
      right: !allEnabled,
      bottom: !allEnabled,
      header: !allEnabled
    };
    onSettingsChange(newSettings);
  };

  const enabledCount = Object.values(adSettings).filter(Boolean).length;

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            Banner Advertisement Manager
            <span className="text-sm font-normal text-gray-600">
              ({enabledCount}/5 active)
            </span>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-blue-600 hover:text-blue-800"
            data-testid="button-toggle-ad-controls"
          >
            {isCollapsed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Control banner advertisement visibility on this page
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAll}
              className="text-xs"
              data-testid="button-toggle-all-ads"
            >
              {Object.values(adSettings).every(Boolean) ? 'Hide All' : 'Show All'}
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ad-header"
                checked={adSettings.header}
                onCheckedChange={() => handleToggle('header')}
                data-testid="checkbox-ad-header"
              />
              <Label htmlFor="ad-header" className="text-sm font-medium">
                Header Banner
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ad-top"
                checked={adSettings.top}
                onCheckedChange={() => handleToggle('top')}
                data-testid="checkbox-ad-top"
              />
              <Label htmlFor="ad-top" className="text-sm font-medium">
                Top Banner
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ad-left"
                checked={adSettings.left}
                onCheckedChange={() => handleToggle('left')}
                data-testid="checkbox-ad-left"
              />
              <Label htmlFor="ad-left" className="text-sm font-medium">
                Left Sidebar
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ad-right"
                checked={adSettings.right}
                onCheckedChange={() => handleToggle('right')}
                data-testid="checkbox-ad-right"
              />
              <Label htmlFor="ad-right" className="text-sm font-medium">
                Right Sidebar
              </Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="ad-bottom"
                checked={adSettings.bottom}
                onCheckedChange={() => handleToggle('bottom')}
                data-testid="checkbox-ad-bottom"
              />
              <Label htmlFor="ad-bottom" className="text-sm font-medium">
                Bottom Banner
              </Label>
            </div>
          </div>
          
          {enabledCount > 0 && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <p className="text-sm text-green-800">
                <span className="font-medium">{enabledCount}</span> banner advertisement{enabledCount !== 1 ? 's' : ''} currently active
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export default AdvertisementControls;