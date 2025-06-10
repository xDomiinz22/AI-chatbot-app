import { useState, FormEvent, useEffect } from "react";
import Cookies from "js-cookie";
import ForgotPassword from "./ForgotPassword";

type LoginProps = {
    onLoginSuccess: () => void;
};

const Login = ({ onLoginSuccess }: LoginProps) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("verified") === "true") {
            setIsMounted(true);
            setTimeout(() => setIsVisible(true), 10);

            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(() => setIsMounted(false), 1000);
            }, 5000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, []);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            alert("All field required.");
        }
        try {
            const response = await fetch("http://localhost:8000/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.detail || "Login failed");
                return;
            }

            const data = await response.json();

            if (!data.is_verified) {
                alert("Verification email sent. Please verify you email before logging in.");
                return;
            }

            Cookies.set("token", data.token, {
                expires: 2,
                secure: true,
                sameSite: "Strict",
                httpOnly: false
            })
            Cookies.set("email", data.email, { expires: 7 });

            onLoginSuccess();

        } catch (error) {
            console.error("Error during login:", error);
            alert("An error occurred during login.");
        }
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md border rounded mt-10">
            {!showForgotPassword ? (
                <>
                    <h2 className="text-2xl font-bold text-[#2a9d8f] mb-4 text-center">Login</h2>
                    <div
                        className={`mb-4 h-2 max-w-full transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
                        aria-live="polite"
                    >
                        {isMounted && (
                            <div className="text-[#33bbab] rounded text-center h-full flex items-center justify-center">
                                Your account has been verified!
                            </div>
                        )}
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Inputs de email y password */}
                        <div>
                            <label className="block mb-1 font-medium text-[#2a9d8f]">Email:</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#2a9d8f] text-gray-500"
                                placeholder="example@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block mb-1 font-medium text-[#2a9d8f]">Password:</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#2a9d8f] text-gray-500"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#2a9d8f] text-white py-2 rounded hover:bg-[#238075] transition"
                        >
                            Send
                        </button>
                    </form>

                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-sm text-[#27887d] hover:underline"
                        >
                            Forgot your password?
                        </button>
                    </div>
                </>
            ) : (
                <ForgotPassword onClose={() => setShowForgotPassword(false)} />
            )}
        </div>
    );
};

export default Login;