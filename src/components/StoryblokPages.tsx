import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CopyIcon, CheckIcon, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { CONTENT_VERSIONS, COUNTRIES, DATA_ROOTS, DEFAULT_CONFIG } from '@/constants';

interface FormConfig {
  prefix: string;
  ignorePath: string;
  country: string;
  contentVersion: string;
  token: string;
}

// Use a non-empty string to represent "no prefix"
const NO_PREFIX_VALUE = "_none";

export default function StoryblokPages() {
  const [pages, setPages] = useState<string[]>([]);
  
  // Form state
  const [formConfig, setFormConfig] = useState<FormConfig>({
    prefix: DEFAULT_CONFIG.prefix,
    ignorePath: DEFAULT_CONFIG.ignorePath,
    country: DEFAULT_CONFIG.country,
    contentVersion: DEFAULT_CONFIG.contentVersion,
    token: ''
  });
  
  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Handle form changes
  const handleConfigChange = (key: keyof FormConfig, value: string) => {
    // Convert NO_PREFIX_VALUE to empty string for the actual config
    if (key === 'prefix' && value === NO_PREFIX_VALUE) {
      setFormConfig(prev => ({ ...prev, [key]: '' }));
    } else {
      setFormConfig(prev => ({ ...prev, [key]: value }));
    }
  };

  // Handle fetching pages
  const handleGetPages = async () => {
    setLoading(true);
    setError('');
    setPages([]);
    
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (formConfig.prefix) {
        params.append('prefix', formConfig.prefix);
      }
      
      if (formConfig.ignorePath) {
        params.append('ignorePath', formConfig.ignorePath);
      }
      
      if (formConfig.country) {
        params.append('country', formConfig.country);
      }
      
      if (formConfig.contentVersion) {
        params.append('contentVersion', formConfig.contentVersion);
      }
      
      const response = await fetch(`/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prefix: formConfig.prefix,
          ignorePath: formConfig.ignorePath,
          country: formConfig.country,
          contentVersion: formConfig.contentVersion,
          token: formConfig.token
        })
        
      });
      const data = await response.json();
      
      if (data.success) {
        setPages(data.data);
      } else {
        setError(data.error || 'Failed to fetch pages');
      }
    } catch (err) {
      setError('Failed to fetch pages');
    } finally {
      setLoading(false);
    }
  };

  // Handle copying to clipboard
  const handleCopy = () => {
    if (pages.length === 0) return;
    
    navigator.clipboard.writeText(pages.join('\n'))
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setError('Failed to copy to clipboard');
      });
  };

  return (
    <div className="w-[800px] max-w-full mx-auto p-4">
      <Card className="w-full shadow-sm border-gray-100">
        <CardHeader className="pb-3 text-center border-b border-gray-50">
          <CardTitle className="text-xl font-medium">Get Storyblok Pages</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Configuration Form */}
          <div className="space-y-2">
            {/* Select Inputs Row */}
            <div className="grid grid-cols-4 gap-4">
              {/* Data Root / Prefix */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Project</label>
                
                  <Select
                    value={formConfig.prefix}
                    onValueChange={(value) => handleConfigChange('prefix', value)}
                  >
                    <SelectTrigger className="h-9 bg-white border-gray-200 focus:ring-1 focus:ring-gray-200 text-sm">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem key={NO_PREFIX_VALUE} value={NO_PREFIX_VALUE}>
                        No prefix
                      </SelectItem>
                      {Object.keys(DATA_ROOTS).map((root) => (
                        <SelectItem key={root} value={root}>
                          {root}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              
              {/* Ignore Path */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Type</label>
                <Input
                  placeholder="e.g. configuration"
                  value={formConfig.ignorePath}
                  onChange={(e) => handleConfigChange('ignorePath', e.target.value)}
                  className="h-9 bg-white border-gray-200 focus:ring-1 focus:ring-gray-200 text-sm"
                />
              </div>
              
              {/* Country */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Country</label>
                
                  <Select
                    value={formConfig.country}
                    onValueChange={(value) => handleConfigChange('country', value)}
                  >
                    <SelectTrigger className="h-9 bg-white border-gray-200 focus:ring-1 focus:ring-gray-200 text-sm">
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.value} value={country.value}>
                          {country.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              
              {/* Content Version */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Status</label>
                
                  <Select
                    value={formConfig.contentVersion}
                    onValueChange={(value) => handleConfigChange('contentVersion', value)}
                  >
                    <SelectTrigger className="h-9 bg-white border-gray-200 focus:ring-1 focus:ring-gray-200 text-sm">
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_VERSIONS.map((version) => (
                        <SelectItem key={version.value} value={version.value}>
                          {version.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
            </div>

            {/* Token Input */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Storyblok Preview Token</label>
              <Input
                type="password"
                placeholder="Enter your Storyblok preview token"
                value={formConfig.token}
                onChange={(e) => handleConfigChange('token', e.target.value)}
                className="h-9 bg-white border-gray-200 focus:ring-1 focus:ring-gray-200 text-sm"
              />
              <p className="text-xs text-gray-400">
                Your token is used only for this request and is not stored anywhere.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              
         
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pages.length === 0}
                  onClick={handleCopy}
                  className="cursor-pointer h-9 px-3 border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-colors text-sm"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="h-3 w-3 mr-1.5 text-green-500" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-3 w-3 mr-1.5" />
                      <span>Copy All</span>
                    </>
                  )}
                </Button>
                <Button
                onClick={handleGetPages}
                disabled={loading}
                className="h-9 px-3 bg-gray-900 hover:bg-gray-800 text-white text-sm whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Get Pages"
                )}
              </Button>
              
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-2 bg-red-50 text-red-600 rounded-md text-xs border border-red-100">
              {error}
            </div>
          )}

          {/* Results */}
          {pages.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-500 font-medium">
                {pages.length} pages found
              </div>

              <ScrollArea className="h-80 overflow-y-auto rounded-md border border-gray-100 bg-gray-50">
                <div className="p-4 font-mono text-xs space-y-1 overflow-x-auto">
                  {pages.map((page, index) => (
                    <div key={index} className="text-gray-700">
                      {page}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 