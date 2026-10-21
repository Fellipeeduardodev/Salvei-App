import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, RefreshCw, Compass } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Salvei UI ErrorBoundary capturou um erro não tratado:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="min-h-screen w-full bg-[#F8F8F6] text-[#171717] flex flex-col items-center justify-center p-4 font-sans select-none"
        >
          <div className="w-full max-w-md bg-white border border-[#E7E7E5] rounded-sm p-6 sm:p-8 shadow-xl flex flex-col items-center text-center gap-4 animate-in fade-in duration-200">
            <div className="w-12 h-12 rounded-full bg-[#EF4444]/10 text-[#EF4444] flex items-center justify-center">
              <AlertTriangle size={24} strokeWidth={2} />
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="font-mono text-[10px] font-bold text-[#4355DB] uppercase tracking-wider">
                SALVEI • ESTABILIDADE DO SISTEMA
              </span>
              <h1 className="font-sans font-bold text-lg text-[#171717]">
                Ocorreu uma falha inesperada na visualização
              </h1>
              <p className="font-sans text-xs text-[#737373] leading-relaxed">
                A aplicação encontrou um problema ao renderizar este componente. Seus dados no banco continuam seguros e preservados.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="w-full p-2.5 bg-[#F8F8F6] border border-[#E7E7E5] rounded text-left overflow-x-auto">
                <span className="font-mono text-[11px] text-[#737373] break-words">
                  {this.state.error.message}
                </span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 w-full justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={this.handleReset}
                iconLeft={<RotateCcw size={14} />}
                className="cursor-pointer"
              >
                Tentar novamente
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={this.handleReload}
                iconLeft={<RefreshCw size={14} />}
                className="cursor-pointer"
              >
                Recarregar página
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
