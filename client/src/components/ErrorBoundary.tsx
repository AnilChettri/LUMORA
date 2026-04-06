import React, { Component, ErrorInfo, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallbackMessage?: string;
    onReset?: () => void;
    showHomeButton?: boolean;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        this.setState({
            error,
            errorInfo,
        });

        // TODO: Send to error tracking service (e.g., Sentry)
        // logErrorToService(error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });

        if (this.props.onReset) {
            this.props.onReset();
        }
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="w-full max-w-md"
                    >
                        <Card className="p-6 text-center">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.1, type: 'spring' }}
                            >
                                <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-destructive" />
                            </motion.div>

                            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>

                            <p className="text-muted-foreground mb-6">
                                {this.props.fallbackMessage ||
                                    "We're sorry, but something unexpected happened. Please try again."}
                            </p>

                            {process.env.NODE_ENV === 'development' && this.state.error && (
                                <details className="mb-6 text-left">
                                    <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground mb-2">
                                        Error details (dev only)
                                    </summary>
                                    <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto max-h-40">
                                        {this.state.error.toString()}
                                        {this.state.errorInfo?.componentStack}
                                    </pre>
                                </details>
                            )}

                            <div className="flex gap-2 justify-center">
                                <Button
                                    onClick={this.handleReset}
                                    className="gap-2"
                                    data-testid="button-error-retry"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Try Again
                                </Button>

                                {this.props.showHomeButton && (
                                    <Button
                                        onClick={this.handleGoHome}
                                        variant="outline"
                                        className="gap-2"
                                        data-testid="button-error-home"
                                    >
                                        <Home className="w-4 h-4" />
                                        Go Home
                                    </Button>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}
