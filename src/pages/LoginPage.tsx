import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import api from '@/lib/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      if (data.role !== 'ADMIN') {
        setError('관리자 계정이 아닙니다.');
        return;
      }
      login(data.accessToken, data.userId, data.nickname);
      navigate('/dashboard', { replace: true });
    } catch {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-[22px] font-bold text-[#1c1c1e]">모두의 문철</p>
          <p className="text-[13px] text-gray-400 mt-1">관리자 로그인</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-4"
        >
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1c1c1e]"
              placeholder="admin@munchul.com"
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-gray-500 mb-1.5">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1c1c1e]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-500 text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#1c1c1e] text-white rounded-xl text-[14px] font-semibold hover:opacity-80 transition-opacity disabled:opacity-40 mt-2"
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
      </div>
    </div>
  );
}
