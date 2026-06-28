import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminPostApi } from '@/lib/adminApi';
import PageHeader from '@/components/PageHeader';

const SITE_URL = 'https://everyonesmunchul.site';

const CATEGORY_LABELS: Record<string, string> = {
  LOVE: '연애/결혼', WORK: '직장/회사', GAME: '게임',
  FAMILY: '가족', FRIEND: '친구/인간관계', DAILY: '일상', ETC: '기타',
};

export default function PostsPage() {
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [page, setPage] = useState(0);

  const { data: postsPage, isLoading } = useQuery({
    queryKey: ['admin-posts', keyword, page],
    queryFn: () => adminPostApi.getPosts({ keyword: keyword || undefined, page, size: 20 }).then(r => r.data),
  });

  const posts = postsPage?.content ?? [];
  const totalPages = postsPage?.totalPages ?? 0;
  const totalElements = postsPage?.totalElements ?? 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setKeyword(inputValue.trim());
  };

  const handleKeywordClear = () => {
    setInputValue('');
    setKeyword('');
    setPage(0);
  };

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="게시글 관리"
        description={!isLoading ? `총 ${totalElements.toLocaleString()}건` : undefined}
      />

      <div className="flex-1 overflow-auto">
        {/* 검색 */}
        <div className="px-8 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <input
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder="제목으로 검색..."
                className="w-full pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1c1c1e]"
              />
              {inputValue && (
                <button
                  type="button"
                  onClick={handleKeywordClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-[16px] leading-none"
                >
                  ×
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#1c1c1e] text-white rounded-xl text-[13px] font-medium hover:opacity-80"
            >
              검색
            </button>
          </form>
          {keyword && (
            <p className="mt-2 text-[12px] text-gray-400">
              "<span className="text-[#1c1c1e] font-medium">{keyword}</span>" 검색 결과 {totalElements.toLocaleString()}건
            </p>
          )}
        </div>

        {/* 목록 */}
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-gray-400">불러오는 중...</div>
        ) : (
          <>
            <table className="w-full text-[13px]">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-[65px]">
                <tr>
                  {['ID', '제목', '분야', '작성자', '투표', '작성일', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map(post => (
                  <tr key={post.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400 tabular-nums">{post.id}</td>
                    <td className="px-5 py-4 max-w-[360px]">
                      <a
                        href={`${SITE_URL}/posts/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[#1c1c1e] hover:text-[#5658d6] hover:underline transition-colors truncate block"
                        title={post.title}
                      >
                        {post.title}
                      </a>
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                      {CATEGORY_LABELS[post.category] ?? post.category}
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                      {post.isAnonymous ? '익명' : post.authorNickname}
                    </td>
                    <td className="px-5 py-4 text-gray-500 tabular-nums whitespace-nowrap">
                      {post.totalVoteCount.toLocaleString()}명
                    </td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                      {new Date(post.createdAt + 'Z').toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-5 py-4">
                      <a
                        href={`${SITE_URL}/posts/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-[12px] text-gray-500 hover:border-[#1c1c1e] hover:text-[#1c1c1e] transition-colors whitespace-nowrap"
                      >
                        조회 →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {posts.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <p className="text-[13px] text-gray-400">
                  {keyword ? `"${keyword}"에 해당하는 게시글이 없습니다` : '게시글이 없습니다'}
                </p>
              </div>
            )}

            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1 py-6">
                <button
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-1.5 text-[13px] text-gray-500 border border-gray-200 rounded-lg hover:border-gray-400 disabled:opacity-30"
                >
                  이전
                </button>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + Math.max(0, page - 4)).filter(i => i < totalPages).map(i => (
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
      </div>
    </div>
  );
}
