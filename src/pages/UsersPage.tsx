import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminUserApi } from '@/lib/adminApi';
import type { AdminUser, UserRole } from '@/lib/adminApi';
import PageHeader from '@/components/PageHeader';

const ROLE_LABEL: Record<UserRole, string> = {
  USER: '일반', ADMIN: '관리자', EXPERT: '전문가',
};
const GRADE_LABEL: Record<string, string> = {
  BRONZE: '브론즈', SILVER: '실버', GOLD: '골드',
  PLATINUM: '플래티넘', DIAMOND: '다이아몬드', MASTER: '마스터',
};
const PROVIDER_LABEL: Record<string, string> = {
  GOOGLE: '구글', KAKAO: '카카오', NAVER: '네이버',
};

export default function UsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [bannedFilter, setBannedFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [page, setPage] = useState(0);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  const banned = bannedFilter === 'all' ? undefined : bannedFilter === 'banned';

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, banned, page],
    queryFn: () => adminUserApi.getUsers({ search: search || undefined, banned, page, size: 20 })
      .then(r => r.data),
  });

  const banMutation = useMutation({
    mutationFn: (id: number) => adminUserApi.ban(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(res.data);
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (id: number) => adminUserApi.unban(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(res.data);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: number; role: UserRole }) =>
      adminUserApi.changeRole(id, role),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setSelectedUser(res.data);
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(0);
  };

  const isMutating = banMutation.isPending || unbanMutation.isPending || roleMutation.isPending;

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="사용자 관리"
        description={data ? `전체 ${data.totalElements.toLocaleString()}명` : undefined}
      />

      {/* 필터 바 */}
      <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center gap-4 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="닉네임 또는 이메일 검색"
            className="w-64 px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1c1c1e]"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#1c1c1e] text-white rounded-lg text-[13px] font-medium hover:opacity-80"
          >
            검색
          </button>
        </form>

        <div className="flex gap-1 ml-auto">
          {(['all', 'active', 'banned'] as const).map(f => (
            <button
              key={f}
              onClick={() => { setBannedFilter(f); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${
                bannedFilter === f
                  ? 'bg-[#1c1c1e] text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? '전체' : f === 'active' ? '정상' : '정지됨'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 테이블 */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-[13px] text-gray-400">불러오는 중...</div>
          ) : (
            <>
              <table className="w-full text-[13px]">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                  <tr>
                    {['ID', '닉네임', '이메일', '가입 방법', '등급', '권한', '상태', '가입일', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.content.map(user => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${
                        selectedUser?.id === user.id ? 'bg-blue-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-5 py-3.5 text-gray-400">{user.id}</td>
                      <td className="px-5 py-3.5 font-medium text-[#1c1c1e]">{user.nickname}</td>
                      <td className="px-5 py-3.5 text-gray-500">{user.email}</td>
                      <td className="px-5 py-3.5 text-gray-400">
                        {user.provider ? PROVIDER_LABEL[user.provider] : '이메일'}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{GRADE_LABEL[user.grade]}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700'
                            : user.role === 'EXPERT'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {ROLE_LABEL[user.role]}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          user.banned ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.banned ? '정지' : '정상'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-5 py-3.5 text-gray-300 text-[11px]">상세 →</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data?.content.length === 0 && (
                <div className="flex items-center justify-center h-40 text-[13px] text-gray-400">
                  검색 결과가 없습니다.
                </div>
              )}

              {/* 페이지네이션 */}
              {data && data.totalPages > 1 && (
                <div className="flex justify-center gap-1 py-5 border-t border-gray-100">
                  {Array.from({ length: data.totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-8 h-8 rounded-lg text-[13px] font-medium transition-colors ${
                        i === page ? 'bg-[#1c1c1e] text-white' : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* 상세 패널 */}
        {selectedUser && (
          <div className="w-72 shrink-0 border-l border-gray-100 bg-white overflow-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <p className="font-semibold text-[14px] text-[#1c1c1e]">사용자 상세</p>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-300 hover:text-gray-500 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[16px] font-bold text-gray-500">
                  {selectedUser.nickname[0]}
                </div>
                <div>
                  <p className="font-semibold text-[14px] text-[#1c1c1e]">{selectedUser.nickname}</p>
                  <p className="text-[12px] text-gray-400">{selectedUser.email}</p>
                </div>
              </div>

              <hr className="border-gray-100" />

              <dl className="space-y-2.5 text-[13px]">
                {([
                  ['ID', String(selectedUser.id)],
                  ['가입 방법', selectedUser.provider ? PROVIDER_LABEL[selectedUser.provider] : '이메일'],
                  ['등급', GRADE_LABEL[selectedUser.grade]],
                  ['경험치', `${selectedUser.exp.toLocaleString()} XP`],
                  ['가입일', new Date(selectedUser.createdAt).toLocaleDateString('ko-KR')],
                  ...(selectedUser.bannedAt
                    ? [['정지일', new Date(selectedUser.bannedAt).toLocaleDateString('ko-KR')] as [string, string]]
                    : []),
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-gray-400">{label}</dt>
                    <dd className="font-medium text-[#1c1c1e]">{value}</dd>
                  </div>
                ))}
              </dl>

              <hr className="border-gray-100" />

              {/* 권한 변경 */}
              <div>
                <p className="text-[11px] text-gray-400 mb-2">권한 변경</p>
                <div className="flex gap-1.5">
                  {(['USER', 'EXPERT', 'ADMIN'] as UserRole[]).map(role => (
                    <button
                      key={role}
                      disabled={selectedUser.role === role || isMutating}
                      onClick={() => roleMutation.mutate({ id: selectedUser.id, role })}
                      className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-colors disabled:opacity-40 ${
                        selectedUser.role === role
                          ? 'bg-[#1c1c1e] text-white'
                          : 'border border-gray-200 text-gray-500 hover:border-[#1c1c1e] hover:text-[#1c1c1e]'
                      }`}
                    >
                      {ROLE_LABEL[role]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 정지 / 해제 */}
              <div>
                {selectedUser.banned ? (
                  <button
                    disabled={isMutating}
                    onClick={() => unbanMutation.mutate(selectedUser.id)}
                    className="w-full py-2.5 rounded-xl border border-green-300 text-green-600 text-[13px] font-semibold hover:bg-green-50 transition-colors disabled:opacity-40"
                  >
                    {unbanMutation.isPending ? '처리 중...' : '정지 해제'}
                  </button>
                ) : (
                  <button
                    disabled={isMutating}
                    onClick={() => banMutation.mutate(selectedUser.id)}
                    className="w-full py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-40"
                  >
                    {banMutation.isPending ? '처리 중...' : '영구 정지'}
                  </button>
                )}
              </div>

              {(banMutation.isError || unbanMutation.isError || roleMutation.isError) && (
                <p className="text-[12px] text-red-500 text-center">처리 중 오류가 발생했습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
