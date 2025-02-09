import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Copy, RefreshCw, Mail } from "lucide-react";
import EmailViewer from "@/components/email-viewer";
import type { TempEmail, Message } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const [currentEmail, setCurrentEmail] = useState<TempEmail | null>(null);

  const createEmail = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/email");
      return res.json();
    },
    onSuccess: (email: TempEmail) => {
      setCurrentEmail(email);
      toast({
        title: "Email Created",
        description: email.address
      });
    }
  });

  const { data: messages, isLoading: messagesLoading, refetch } = useQuery<Message[]>({
    queryKey: currentEmail ? [`/api/email/${currentEmail.id}/messages`] : [],
    enabled: !!currentEmail,
    refetchInterval: 5000 // Poll every 5 seconds
  });

  const copyEmail = () => {
    if (currentEmail) {
      navigator.clipboard.writeText(currentEmail.address);
      toast({
        title: "Copied",
        description: "Email address copied to clipboard"
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-6 w-6" />
              Temporary Email Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Button
                onClick={() => createEmail.mutate()}
                disabled={createEmail.isPending}
                className="flex-1"
              >
                {createEmail.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Generate New Email
              </Button>
              
              {currentEmail && (
                <>
                  <Button
                    variant="secondary"
                    onClick={copyEmail}
                    className="flex-1"
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Address
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="flex-1"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh
                  </Button>
                </>
              )}
            </div>

            {currentEmail && (
              <div className="mt-4 p-4 bg-muted rounded-md">
                <p className="font-mono text-sm break-all">{currentEmail.address}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {currentEmail && (
          <EmailViewer 
            messages={messages || []} 
            isLoading={messagesLoading} 
          />
        )}
      </div>
    </div>
  );
}
