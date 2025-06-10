import { useState, FormEvent } from "react";

type PasswordResetProps = {
    onClose?: () => void;
};

const PasswordReset = ({ onClose }: PasswordResetProps) => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await fetch("http://localhost:8000/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.detail || "Failed to send reset email");
                return;
            }

            setMessage("Check your inbox! A password reset link has been sent.");
        } catch (err) {
            console.error("Error sending reset email:", err);
            setError("Something went wrong. Try again later.");
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold text-[#2a9d8f] mb-4 text-center">Password reset</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium text-[#2a9d8f]">Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#2a9d8f] text-gray-500"
                        placeholder="your@email.com"
                        required
                    />
                </div>

                {message && <div className="text-green-600 text-center max-w-[230px]">{message}</div>}
                {error && <div className="text-red-600 text-center">{error}</div>}

                <button
                    type="submit"
                    className="w-full bg-[#2a9d8f] text-white py-2 rounded hover:bg-[#238075] transition"
                >
                    Send reset link
                </button>
            </form>
            <div className="mt-4 text-center">
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-sm text-[#27887d] hover:underline" type="button"
                    >
                        Back to Login
                    </button>
                )}
            </div>
        </div>
    );
};

export default PasswordReset;
