import { useState, FormEvent } from "react";
import Cookies from "js-cookie";

type LoginProps = {
    onLoginSuccess: () => void;
};

const Login = ({ onLoginSuccess }: LoginProps) => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            alert("All field required.");
        }
        // Validar en backend
        Cookies.set("email", email, {expires: 7});
        Cookies.set("password", password, {expires: 7});
        onLoginSuccess();
    }

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md border rounded mt-10">
            <h2 className="text-2xl font-bold text-[#2a9d8f] mb-4 text-center">Login</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
        </div>
    );
};

export default Login;