import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticeApi } from '@/lib/adminApi';
import type { Notice } from '@/lib/adminApi';
import PageHeader from '@/components/PageHeader';

type Mode = 'list' | 'create' | 'edit';

export default function NoticesPage() {
  const qc = useQueryClient();
  const [mode, setMode] = useState<Mode>('list');
  const [editing, setEditing] = useState<Notice | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ['admin-notices'],
    queryFn: () => noticeApi.getAll().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => noticeApi.create({ title, content }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-notices'] }); goList(); },
  });

  const updateMutation = useMutation({
    mutationFn: () => noticeApi.update(editing!.id, { title, content }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-notices'] }); goList(); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => noticeApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-notices'] }),
  });

  const goList = () => { setMode('list'); setEditing(null); setTitle(''); setContent(''); };

  const goCreate = () => { setTitle(''); setContent(''); setMode('create'); };

  const goEdit = (notice: Notice) => {
    setEditing(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setMode('edit');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'create') createMutation.mutate();
    else updateMutation.mutate();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (mode === 'create' || mode === 'edit') {
    return (
      <div className="flex flex-col h-screen">
        <PageHeader
          title={mode === 'create' ? '공지사항 작성' : '공지사항 수정'}
          action={
            <button onClick={goList} className="px-4 py-2 text-[13px] text-gray-400 hover:text-gray-600">
              취소
            </button>
          }
        />
        <div className="flex-1 overflow-auto p-8">
          <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
            <div>
              <label className="block text-[12px] text-gray-400 mb-1.5">제목</label>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                maxLength={200}
                required
                placeholder="공지 제목을 입력하세요"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1c1c1e]"
              />
            </div>
            <div>
              <label className="block text-[12px] text-gray-400 mb-1.5">내용</label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                required
                rows={12}
                placeholder="공지 내용을 입력하세요"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#1c1c1e] resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="submit"
                disabled={isSaving || !title.trim() || !content.trim()}
                className="px-6 py-2.5 bg-[#1c1c1e] text-white rounded-xl text-[13px] font-semibold hover:opacity-80 disabled:opacity-40"
              >
                {isSaving ? '저장 중...' : mode === 'create' ? '등록' : '수정'}
              </button>
            </div>
            {(createMutation.isError || updateMutation.isError) && (
              <p className="text-[12px] text-red-500">저장 중 오류가 발생했습니다.</p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="공지사항 관리"
        description={notices.length ? `총 ${notices.length}건` : undefined}
        action={
          <button
            onClick={goCreate}
            className="px-4 py-2 bg-[#1c1c1e] text-white rounded-lg text-[13px] font-medium hover:opacity-80"
          >
            + 공지 작성
          </button>
        }
      />

      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-40 text-[13px] text-gray-400">불러오는 중...</div>
        ) : (
          <>
            <table className="w-full text-[13px]">
              <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                <tr>
                  {['ID', '제목', '등록일', '수정일', ''].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {notices.map(notice => (
                  <tr key={notice.id} className="bg-white hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400">{notice.id}</td>
                    <td className="px-5 py-4 font-medium text-[#1c1c1e] max-w-[420px] truncate">
                      {notice.title}
                    </td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                      {new Date(notice.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                      {new Date(notice.updatedAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => goEdit(notice)}
                          className="px-3 py-1 rounded-lg border border-gray-200 text-[12px] text-gray-500 hover:border-[#1c1c1e] hover:text-[#1c1c1e] transition-colors"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('공지사항을 삭제하시겠습니까?')) {
                              deleteMutation.mutate(notice.id);
                            }
                          }}
                          disabled={deleteMutation.isPending}
                          className="px-3 py-1 rounded-lg border border-red-200 text-[12px] text-red-400 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {notices.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 gap-2">
                <p className="text-[13px] text-gray-400">등록된 공지사항이 없습니다.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
