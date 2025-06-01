import React, { forwardRef } from "react";

type ProviderName = "OpenAI" | "HuggingFace" | "Google";

type Providers = {
    [key in ProviderName]: string[];
};

type SettingsPanelProps = {
    provider: ProviderName;
    model: string;
    providers: Providers;
    onProviderChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onModelChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    onClose: () => void;
    show: boolean;
};

// Usamos forwardRef para poder referenciar el DOM del panel
const SettingsPanel = forwardRef<HTMLDivElement, SettingsPanelProps>(
    ({ provider, model, providers, onProviderChange, onModelChange, onClose, show }, ref) => {
        return (
            <div
                ref={ref}
                className={`absolute right-0 bottom-full mb-2 z-20 w-64 p-4 bg-white/80 backdrop-blur-md border border-gray-300 
  rounded-md shadow-lg transition-all duration-300 ease-in-out transform
  ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}`}



            >
                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Provider:</label>
                    <select
                        value={provider}
                        onChange={onProviderChange}
                        className="w-full border rounded px-2 py-1"
                    >
                        {Object.keys(providers).map((prov) => (
                            <option key={prov} value={prov}>
                                {prov}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-3">
                    <label className="block text-sm font-medium mb-1">Model:</label>
                    <select
                        value={model}
                        onChange={onModelChange}
                        className="w-full border rounded px-2 py-1"
                    >
                        {providers[provider].map((mod) => (
                            <option key={mod} value={mod}>
                                {mod}
                            </option>
                        ))}
                    </select>
                </div>

                <button
                    onClick={onClose}
                    className="bg-[#2a9d8f] p-2 border rounded border-[#2a9d8f] 
          text-bold focus:bg-[#238075] focus:outline-0 font-sans transition duration-300
          text-white placeholder-[#999] hover:bg-[#238075] hover:outline-0"
                >
                    Close
                </button>
            </div>
        );
    }
);

export default React.memo(SettingsPanel) as typeof SettingsPanel;
