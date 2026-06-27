import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminReportApi } from '@/lib/adminApi';
import type { AdminReportedPost } from '@/lib/adminApi';
import PageHeader from '@/components/PageHeader';

const CATEGORY_LABEL: Record<string, string> = {
  LOVE: '연애', WORK: '직장', FAMILY: '가족',
  FRIEND: '친구', DAILY: '일상', GAME: '게임',
};

export default function ReportsPage() {
  const qc = useQueryClient();
  const [page, setPage] = useState(0);
  const [selectedPost, setSelectedPost] = useState<AdminReportedPost | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports', page],
    queryFn: () => adminReportApi.getReportedPosts({ page, size: 20 }).then(r => r.data),
  });

  const hideMutation = useMutation({
    mutationFn: (id: number) => adminReportApi.hidePost(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      setSelectedPost(res.data);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminReportApi.deletePost(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-reports'] });
      setSelectedPost(null);
    },
  });

  const isMutating = hideMutation.isPending || deleteMutation.isPending;

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="신고 관리"
        description={data ? `신고된 게시글 ${data.totalElements.toLocaleString()}건` : undefined}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-40 text-[13px] text-gray-400">불러오는 중...</div>
          ) : (
            <>
              <table className="w-full text-[13px]">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                  <tr>
                    {['ID', '제목', '작성자', '카테고리', '신고수', '상태', '작성일', ''].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data?.content.map(post => (
                    <tr
                      key={post.id}
                      onClick={() => setSelectedPost(post)}
                      className={`cursor-pointer hover:bg-blue-50/50 transition-colors ${
                        selectedPost?.id === post.id ? 'bg-blue-50' : 'bg-white'
                      }`}
                    >
                      <td className="px-5 py-3.5 text-gray-400">{post.id}</td>
                      <td className="px-5 py-3.5 font-medium text-[#1c1c1e] max-w-[280px] truncate">
                        {post.title}
                      </td>
                      <td className="px-5 py-3.5 text-gray-500">{post.authorNickname}</td>
                      <td className="px-5 py-3.5 text-gray-400">
                        {CATEGORY_LABEL[post.category] ?? post.category}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold ${post.reportCount >= 20 ? 'text-red-500' : post.reportCount >= 10 ? 'text-orange-400' : 'text-gray-500'}`}>
                          {post.reportCount}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          post.isHidden ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                        }`}>
                          {post.isHidden ? '숨김' : '공개'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 whitespace-nowrap">
                        {new Date(post.createdAt).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-5 py-3.5 text-gray-300 text-[11px]">상세 →</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data?.content.length === 0 && (
                <div className="flex items-center justify-center h-40 text-[13px] text-gray-400">
                  신고된 게시글이 없습니다.
                </div>
              )}

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

        {selectedPost && (
          <div className="w-72 shrink-0 border-l border-gray-100 bg-white overflow-auto">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <p className="font-semibold text-[14px] text-[#1c1c1e]">게시글 상세</p>
              <button
                onClick={() => setSelectedPost(null)}
                className="text-gray-300 hover:text-gray-500 text-lg leading-none"
              >
                ×
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <p className="font-semibold text-[14px] text-[#1c1c1e] leading-snug">{selectedPost.title}</p>

              <dl className="space-y-2.5 text-[13px]">
                {([
                  ['ID', String(selectedPost.id)],
                  ['작성자', selectedPost.authorNickname],
                  ['카테고리', CATEGORY_LABEL[selectedPost.category] ?? selectedPost.category],
                  ['신고수', String(selectedPost.reportCount)],
                  ['작성일', new Date(selectedPost.createdAt).toLocaleDateString('ko-KR')],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-gray-400">{label}</dt>
                    <dd className={`font-medium ${label === '신고수' && selectedPost.reportCount >= 20 ? 'text-red-500' : 'text-[#1c1c1e]'}`}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>

              <hr className="border-gray-100" />

              <div className="space-y-2">
                {!selectedPost.isHidden && (
                  <button
                    disabled={isMutating}
                    onClick={() => hideMutation.mutate(selectedPost.id)}
                    className="w-full py-2.5 rounded-xl border border-orange-300 text-orange-500 text-[13px] font-semibold hover:bg-orange-50 transition-colors disabled:opacity-40"
                  >
                    {hideMutation.isPending ? '처리 중...' : '게시글 숨김'}
                  </button>
                )}
                <button
                  disabled={isMutating}
                  onClick={() => {
                    if (confirm('게시글을 삭제하시겠습니까? 복구할 수 없습니다.')) {
                      deleteMutation.mutate(selectedPost.id);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 transition-colors disabled:opacity-40"
                >
                  {deleteMutation.isPending ? '처리 중...' : '게시글 삭제'}
                </button>
              </div>

              {(hideMutation.isError || deleteMutation.isError) && (
                <p className="text-[12px] text-red-500 text-center">처리 중 오류가 발생했습니다.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
