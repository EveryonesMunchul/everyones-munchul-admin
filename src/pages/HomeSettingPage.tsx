import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { featuredPostApi, adminPostApi } from '@/lib/adminApi';
import type { AdminPostSummary } from '@/lib/adminApi';
import PageHeader from '@/components/PageHeader';

const CATEGORY_LABELS: Record<string, string> = {
  LOVE: '연애/결혼', WORK: '직장/회사', GAME: '게임',
  FAMILY: '가족', FRIEND: '친구/인간관계', DAILY: '일상', ETC: '기타',
};

export default function HomeSettingPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);

  const { data: featured, isLoading: featuredLoading } = useQuery({
    queryKey: ['admin-featured-post'],
    queryFn: () => featuredPostApi.get().then(r => r.data).catch(() => null),
  });

  const { data: postsPage, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts-list', page],
    queryFn: () => adminPostApi.getPosts({ page, size: 10 }).then(r => r.data),
  });

  const setMutation = useMutation({
    mutationFn: (postId: number) => featuredPostApi.set(postId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-featured-post'] }),
  });

  const clearMutation = useMutation({
    mutationFn: () => featuredPostApi.clear(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-featured-post'] }),
  });

  const posts: AdminPostSummary[] = postsPage?.content ?? [];
  const totalPages = postsPage?.totalPages ?? 0;

  return (
    <div className="flex flex-col h-screen">
      <PageHeader title="홈 설정" description="오늘의 사건으로 노출할 게시글을 지정합니다" />

      <div className="flex-1 overflow-auto p-8 space-y-8">

        {/* 현재 오늘의 사건 */}
        <section className="bg-white border border-gray-100 rounded-2xl p-6">
          <h2 className="text-[14px] font-semibold text-[#1c1c1e] mb-4">현재 오늘의 사건</h2>

          {featuredLoading ? (
            <p className="text-[13px] text-gray-400">불러오는 중...</p>
          ) : featured ? (
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] bg-[#5658d6]/10 text-[#5658d6] font-semibold px-2 py-0.5 rounded-full">
                    고정됨
                  </span>
                  <span className="text-[11px] text-gray-400">
                    {CATEGORY_LABELS[featured.category] ?? featured.category}
                  </span>
                </div>
                <p className="text-[15px] font-semibold text-[#1c1c1e]">{featured.title}</p>
                <p className="text-[12px] text-gray-400 mt-1">
                  {featured.isAnonymous ? '익명' : featured.authorNickname} · 투표 {featured.totalVoteCount.toLocaleString()}명
                </p>
              </div>
              <button
                onClick={() => clearMutation.mutate()}
                disabled={clearMutation.isPending}
                className="shrink-0 px-4 py-2 border border-red-200 text-[13px] text-red-500 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-40"
              >
                {clearMutation.isPending ? '해제 중...' : '고정 해제'}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[11px] bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">자동 선택</span>
              <p className="text-[13px] text-gray-400">고정된 게시글 없음 — 가장 인기 있는 게시글이 자동으로 표시됩니다</p>
            </div>
          )}
        </section>

        {/* 게시글 목록 */}
        <section>
          <h2 className="text-[14px] font-semibold text-[#1c1c1e] mb-4">게시글 선택</h2>

          {postsLoading ? (
            <div className="flex items-center justify-center h-40 text-[13px] text-gray-400">불러오는 중...</div>
          ) : (
            <>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <table className="w-full text-[13px]">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['ID', '제목', '분야', '투표', '작성일', ''].map(h => (
                        <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {posts.map(post => {
                      const isCurrent = featured?.id === post.id;
                      return (
                        <tr key={post.id} className={`transition-colors ${isCurrent ? 'bg-[#5658d6]/5' : 'bg-white hover:bg-gray-50'}`}>
                          <td className="px-5 py-4 text-gray-400 tabular-nums">{post.id}</td>
                          <td className="px-5 py-4 font-medium text-[#1c1c1e] max-w-[320px]">
                            <p className="truncate">{post.title}</p>
                          </td>
                          <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                            {CATEGORY_LABELS[post.category] ?? post.category}
                          </td>
                          <td className="px-5 py-4 text-gray-500 tabular-nums whitespace-nowrap">
                            {post.totalVoteCount.toLocaleString()}명
                          </td>
                          <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                            {new Date(post.createdAt + 'Z').toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-5 py-4">
                            {isCurrent ? (
                              <span className="text-[12px] text-[#5658d6] font-semibold">현재 설정됨</span>
                            ) : (
                              <button
                                onClick={() => setMutation.mutate(post.id)}
                                disabled={setMutation.isPending}
                                className="px-3 py-1.5 bg-[#1c1c1e] text-white rounded-lg text-[12px] font-medium hover:opacity-80 transition-opacity disabled:opacity-40 whitespace-nowrap"
                              >
                                {setMutation.isPending && setMutation.variables === post.id ? '설정 중...' : '오늘의 사건 설정'}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {posts.length === 0 && (
                  <div className="flex items-center justify-center h-32">
                    <p className="text-[13px] text-gray-400">게시글이 없습니다</p>
                  </div>
                )}
              </div>

              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1 mt-4">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1.5 text-[13px] text-gray-500 border border-gray-200 rounded-lg hover:border-gray-400 disabled:opacity-30"
                  >
                    이전
                  </button>
                  {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`w-8 h-8 text-[13px] rounded-lg transition-colors ${page === i ? 'bg-[#1c1c1e] text-white' : 'text-gray-500 hover:bg-gray-100'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-1.5 text-[13px] text-gray-500 border border-gray-200 rounded-lg hover:border-gray-400 disabled:opacity-30"
                  >
                    다음
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
