import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const NAV = [
  { to: '/dashboard', label: '대시보드' },
  { to: '/users',     label: '사용자 관리' },
  { to: '/posts',     label: '게시글 관리' },
  { to: '/reports',   label: '신고 관리' },
  { to: '/notices',   label: '공지사항' },
  { to: '/faq',       label: 'FAQ' },
  { to: '/home-setting', label: '홈 설정' },
  { to: '/ads',          label: '광고/배너' },
  { to: '/maintenance',  label: '서비스 점검' },
];

export default function Layout() {
  const { nickname, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      {/* 사이드바 */}
      <aside className="w-[220px] shrink-0 bg-[#1c1c1e] flex flex-col">
        <div className="px-6 py-5 border-b border-white/10">
          <p className="text-white font-bold text-[15px]">모두의 문철</p>
          <p className="text-white/40 text-[11px] mt-0.5">관리자 페이지</p>
        </div>

        <nav className="flex-1 py-4 space-y-0.5 px-3">
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-xl text-[13px] font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/50 hover:text-white hover:bg-white/8'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <p className="text-white/60 text-[12px] mb-2 px-1">{nickname}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded-xl text-[13px] text-white/40 hover:text-white hover:bg-white/8 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
