import React, { createContext, useContext, useState, useCallback } from "react";
import useSound from "use-sound";
import { AlertCircle, Trash2 } from "lucide-react";

export type NotificationType = "success" | "error" | "info" | "delete" | "in";

interface Notification {
    id: string;
    type: NotificationType;
    message: string;
    description?: string;
}

interface ConfirmOptions {
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "info";
}

interface NotificationContextType {
    showNotification: (type: NotificationType, message: string, description?: string) => void;
    confirmAction: (options: ConfirmOptions) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);

    // Sounds
    const [playSuccess] = useSound("/sounds/success.mp3", { volume: 0.5 });
    const [playDelete] = useSound("/sounds/delete.mp3", { volume: 0.4 });
    const [playIn] = useSound("/sounds/in.mp3", { volume: 0.3 });

    const showNotification = useCallback((type: NotificationType, message: string, description?: string) => {
        const id = Math.random().toString(36).substring(2, 9);

        // Play appropriate sound
        if (type === "success") playSuccess();
        else if (type === "delete") playDelete();
        else playIn();

        setNotifications((prev) => [...prev, { id, type, message, description }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, 4000);
    }, [playSuccess, playDelete, playIn]);

    const confirmAction = useCallback((options: ConfirmOptions) => {
        playIn();
        setConfirmState(options);
    }, [playIn]);

    const handleConfirm = () => {
        if (confirmState) {
            confirmState.onConfirm();
            setConfirmState(null);
        }
    };

    const handleCancel = () => {
        setConfirmState(null);
    };

    return (
        <NotificationContext.Provider value={{ showNotification, confirmAction }}>
            {children}

            {/* Container de Notificaciones */}
            <div className="fixed bottom-8 right-8 z-[1100] flex flex-col gap-3 pointer-events-none">
                {notifications.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                ))}
            </div>

            {/* Modal de Confirmación Minimalista */}
            {confirmState && (
                <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm" onClick={handleCancel} />
                    <div className="relative bg-white w-full max-w-[380px] rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-50 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 pb-6">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${confirmState.variant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-blue-50 text-blue-500'}`}>
                                {confirmState.variant === 'danger' ? <Trash2 size={22} /> : <AlertCircle size={22} />}
                            </div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-2">{confirmState.title}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-relaxed">{confirmState.message}</p>
                        </div>
                        <div className="p-4 bg-slate-50/50 flex gap-3">
                            <button
                                onClick={handleCancel}
                                className="flex-1 px-6 py-4 bg-white hover:bg-slate-100 text-slate-400 text-[9px] font-black uppercase tracking-widest rounded-2xl border border-slate-100 transition-all active:scale-95"
                            >
                                {confirmState.cancelText || "Cancelar"}
                            </button>
                            <button
                                onClick={handleConfirm}
                                className={`flex-1 px-6 py-4 text-white text-[9px] font-black uppercase tracking-widest rounded-2xl shadow-lg transition-all active:scale-95 ${confirmState.variant === 'danger' ? 'bg-rose-500 shadow-rose-100 hover:bg-rose-600' : 'bg-slate-900 shadow-slate-100 hover:bg-slate-800'}`}
                            >
                                {confirmState.confirmText || "Confirmar"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

const NotificationItem: React.FC<{ notification: Notification }> = ({ notification }) => {
    return (
        <div className="animate-in slide-in-from-right-10 fade-in duration-500 pointer-events-auto">
            <div className={`
        min-w-[300px] max-w-[400px] p-4 bg-white border rounded-[1.5rem] shadow-2xl shadow-slate-200/50 
        flex items-start gap-4 transition-all hover:scale-[1.02]
        ${notification.type === 'delete' ? 'border-rose-100' : 'border-slate-50'}
      `}>
                <div className={`
          w-10 h-10 rounded-2xl flex items-center justify-center shrink-0
          ${notification.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
                        notification.type === 'delete' ? 'bg-rose-50 text-rose-500' :
                            'bg-slate-50 text-slate-400'}
        `}>
                    {notification.type === 'success' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                    {notification.type === 'delete' && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    )}
                    {(notification.type === 'info' || notification.type === 'in' || notification.type === 'error') && (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                </div>

                <div className="flex-1 pt-0.5">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900 leading-tight">
                        {notification.message}
                    </h4>
                    {notification.description && (
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-1">
                            {notification.description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error("useNotification must be used within a NotificationProvider");
    return context;
};
