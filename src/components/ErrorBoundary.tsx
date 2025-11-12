import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Oops! Something went wrong</h2>
              <p className="text-muted-foreground">
                We're sorry for the inconvenience. Please try refreshing the page.
              </p>
            </div>
            {this.state.error && (
              <details className="text-xs text-left bg-muted p-4 rounded-lg">
                <summary className="cursor-pointer font-semibold mb-2">Error Details</summary>
                <code className="text-destructive">{this.state.error.message}</code>
              </details>
            )}
            <div className="flex gap-2">
              <Button onClick={this.handleReload} className="flex-1">
                Refresh Page
              </Button>
              <Button variant="outline" onClick={() => window.history.back()} className="flex-1">
                Go Back
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;