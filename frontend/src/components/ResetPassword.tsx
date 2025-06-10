import { useState, useEffect, FormEvent } from "react";
import zxcvbn from "zxcvbn";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [token, setToken] = useState("");

    const [passwordScore, setPasswordScore] = useState(0);
    const passwordStrengthText = ["Very weak", "Weak", "Normal", "Good", "Excellent"];

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pwd = e.target.value;
        setPassword(pwd);
        const result = zxcvbn(pwd);
        setPasswordScore(result.score);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const tokenParam = params.get("token");
        if (!tokenParam) {
            setError("Invalid or missing token.");
        } else {
            setToken(tokenParam);
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage("");
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/reset-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token, new_password: password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.detail || "Password reset failed.");
                return;
            }

            setMessage("Your password has been successfully reset. Redirecting to login...");

            setTimeout(() => {
                console.log("redirecting...")
                window.location.href = "/login";
            }, 2000);
        } catch (err) {
            console.error("Reset error:", err);
            setError("Something went wrong. Please try again later.");
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md border rounded mt-10">
            <h2 className="text-2xl font-bold text-[#2a9d8f] mb-4 text-center">Reset Your Password</h2>

            {error && <div className="text-red-600 text-center mb-2">{error}</div>}
            {message && <div className="text-green-600 text-center mb-2">{message}</div>}

            {!message && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium text-[#2a9d8f]">New Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            className="w-full border text-gray-500 border-gray-300 rounded px-3 py-2 focus:outline-[#2a9d8f]"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium text-[#2a9d8f]">Confirm Password:</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border text-gray-500 border-gray-300 rounded px-3 py-2 focus:outline-[#2a9d8f]"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <p className="text-sm mt-1 text-gray-600">
                        Strength: <strong>{passwordStrengthText[passwordScore]}</strong>
                    </p>

                    <button
                        type="submit"
                        className="w-full bg-[#2a9d8f] text-white py-2 rounded hover:bg-[#238075] transition"
                    >
                        Reset Password
                    </button>
                </form>
            )}
        </div>
    );
};

export default ResetPassword;
