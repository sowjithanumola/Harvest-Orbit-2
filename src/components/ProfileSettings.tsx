
import { useState, useEffect } from "react";
import { useTheme } from "./ThemeContext";

export const ProfileSettings = ({ user }: { user: any }) => {
    const [name, setName] = useState("");
    const [pfp, setPfp] = useState("");
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        // Load from local storage or just use mock
        const stored = localStorage.getItem(`profile_${user.uid}`);
        if (stored) {
            const data = JSON.parse(stored);
            setName(data.name || "");
            setPfp(data.pfp || "");
        }
    }, [user.uid]);

    const saveProfile = async () => {
        localStorage.setItem(`profile_${user.uid}`, JSON.stringify({ name, pfp }));
        alert("Profile updated locally!");
    };

    return (
        <div className={`border p-6 rounded-2xl ${theme === 'dark' ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className="text-xl font-bold mb-4">Profile Settings</h2>
            <div className="flex items-center gap-4 mb-6">
                {pfp && <img src={pfp} alt="Profile" className="w-16 h-16 rounded-full object-cover" />}
                <button onClick={toggleTheme} className="text-sm border border-slate-500 px-3 py-1 rounded-full">
                    {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
            </div>
            <div className="space-y-4">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Display Name" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl" />
                <input value={pfp} onChange={(e) => setPfp(e.target.value)} placeholder="Profile Picture URL" className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl" />
                <button onClick={saveProfile} className="bg-emerald-600 px-6 py-2 rounded-xl font-bold">Save Profile</button>
            </div>
        </div>
    );
};
