import React, { useState } from 'react';
import { useAuth } from '../store/AuthProvider';
import { LogIn, UserPlus, Loader2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(email, password);
            }
        } catch (err: any) {
            if (err.code === 'auth/user-not-found') {
                setError('ユーザーが見つかりません');
            } else if (err.code === 'auth/wrong-password') {
                setError('パスワードが間違っています');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('このメールアドレスは既に使用されています');
            } else if (err.code === 'auth/weak-password') {
                setError('パスワードは6文字以上にしてください');
            } else if (err.code === 'auth/invalid-email') {
                setError('メールアドレスの形式が正しくありません');
            } else {
                setError('エラーが発生しました: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Lab Flow Chart
                    </h1>
                    <p className="text-gray-500">
                        {isLogin ? 'ログインしてください' : '新規アカウントを作成'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            メールアドレス
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="example@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            パスワード
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                            placeholder="6文字以上"
                            required
                            minLength={6}
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : isLogin ? (
                            <>
                                <LogIn className="w-5 h-5" />
                                ログイン
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                アカウント作成
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        {isLogin ? 'アカウントを作成する' : 'ログイン画面に戻る'}
                    </button>
                </div>
            </div>
        </div>
    );
};
