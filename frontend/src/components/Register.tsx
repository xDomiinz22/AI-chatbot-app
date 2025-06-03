import { useState, FormEvent } from "react";
import Cookies from "js-cookie";
import zxcvbn from "zxcvbn"
import SHA1 from "crypto-js/sha1"

type RegisterProps = {
    onRegisterSuccess: () => void;
};

const Register = ({ onRegisterSuccess }: RegisterProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordScore, setPasswordScore] = useState(0);
    const passwordStrengthText = ["Very weak", "Weak", "Normal", "Good", "Excellent"];


    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const pwd = e.target.value;
        setPassword(pwd);
        const result = zxcvbn(pwd);
        setPasswordScore(result.score); // Score va de 0 (débil) a 4 (fuerte)
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password) {
            alert("All fields are required.");
            return;
        }

        if (passwordScore < 3) {
            alert("Password is too weak. Please choose a stronger one.")
            return;
        }

        const isLeaked = await checkPwnedPassword(password);
        if (isLeaked) {
            alert("This password has been found in previous data breaches. Please choose a different one.");
            return;
        }

        try {
            const response = await fetch("http://localhost:8000/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                alert(errorData.detail || "Register failed");
                return;
            }

            const data = await response.json();

            Cookies.set("token", data.token, {
                expires: 2,
                secure: true,
                sameSite: "Strict",
                httpOnly: false
            })
            Cookies.set("name", name, { expires: 7 });
            Cookies.set("email", email, { expires: 7 });
            Cookies.set("user_id", String(data.user_id), {expires: 7});

            onRegisterSuccess();

        } catch (error) {
            console.error("Error during register:", error);
            alert("An error occurred during register.");
        }

    };

    const checkPwnedPassword = async (password: string): Promise<boolean> => {
        const hash = SHA1(password).toString().toUpperCase();
        const prefix = hash.substring(0, 5);
        const suffix = hash.substring(5);

        const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
        const text = await response.text();

        return text.includes(suffix);
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white shadow-md border rounded mt-10">
            <h2 className="text-2xl font-bold text-[#2a9d8f] mb-4 text-center">Register</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block mb-1 font-medium text-[#2a9d8f]">Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#2a9d8f] text-gray-500"
                        placeholder="John Doe"
                        required
                    />
                </div>
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
                        onChange={(e) => {
                            handlePasswordChange(e);
                            setPassword(e.target.value);
                        }}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-[#2a9d8f] text-gray-500"
                        placeholder="••••••••"
                        required
                    />
                    <p className="text-sm mt-1 text-gray-600">
                        Strength: <strong>{passwordStrengthText[passwordScore]}</strong>
                    </p>
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#2a9d8f] text-white py-2 rounded hover:bg-[#238075] transition"
                >
                    Register
                </button>
            </form>
        </div>
    );
};

export default Register;
