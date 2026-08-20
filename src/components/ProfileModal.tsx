
import { useState } from "react";
import { Settings, X, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "./ThemeContext";

export const ProfileModal = ({ user, isGuest, onClose, onExitGuest }: { user: any | null, isGuest: boolean, onClose: () => void, onExitGuest: () => void }) => {
    const { theme, toggleTheme } = useTheme();

    const handleLogout = () => {
        onExitGuest();
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4 z-[100] transition-all">
            <div className="theme-card p-8 rounded-3xl w-full max-w-sm relative shadow-2xl animate-in zoom-in-95 duration-200">
                <button onClick={onClose} className="absolute top-6 right-6 theme-text-secondary hover:text-harvest-green transition-colors">
                    <X size={24} />
                </button>
                <h2 className="text-xl font-bold mb-8">Settings</h2>
                <div className="space-y-8">
                    <div className="flex items-center gap-5">
                       <div className="w-16 h-16 rounded-2xl bg-harvest-green flex items-center justify-center font-black text-2xl text-white shadow-lg shadow-harvest-green/20">
                           {isGuest ? "G" : user?.email?.[0].toUpperCase()}
                       </div>
                       <div>
                           <p className="font-bold text-lg">{isGuest ? "Guest Access" : "Account"}</p>
                           <p className="text-sm theme-text-secondary">
                               {isGuest ? "Limited local session" : user?.email}
                           </p>
                       </div>
                    </div>
                    
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest theme-text-secondary">Preferences</label>
                        <button 
                            onClick={toggleTheme} 
                            className="w-full flex items-center justify-between p-4 theme-input rounded-2xl font-bold group hover:border-harvest-green transition-all"
                        >
                            <span className="flex items-center gap-3">
                                {theme === 'dark' ? <Moon size={20} className="text-accent-blue" /> : <Sun size={20} className="text-amber-500" />}
                                Appearance
                            </span>
                            <span className="text-xs theme-text-secondary uppercase tracking-widest">{theme} mode</span>
                        </button>
                    </div>

                    <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-500/20 transition-all">
                        <LogOut className="w-5 h-5" /> {isGuest ? "Exit Guest Mode" : "Logout"}
                    </button>
                </div>
            </div>
        </div>
    );
};
