import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from '@/lib/adminApi';
import PageHeader from '@/components/PageHeader';

function toLocalInput(iso: string | null): string {
  if (!iso) return '';
  // ISO → datetime-local input 형식 (YYYY-MM-DDTHH:mm)
  return new Date(iso).toLocaleString('sv-SE', { timeZone: 'Asia/Seoul' }).slice(0, 16);
}

function toIso(local: string): string | null {
  if (!local) return null;
  return new Date(local).toISOString();
}

export default function MaintenancePage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['maintenance'],
    queryFn: () => maintenanceApi.get().then(r => r.data),
  });

  const [active, setActive] = useState(false);
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!data) return;
    setActive(data.active);
    setStartAt(toLocalInput(data.startAt));
    setEndAt(toLocalInput(data.endAt));
    setMessage(data.message ?? '');
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      maintenanceApi.update({
        active,
        startAt: toIso(startAt),
        endAt: toIso(endAt),
        message: message.trim() || null,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['maintenance'] }),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-[13px] text-gray-400">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <PageHeader
        title="서비스 점검"
        description={
          data?.currentlyActive
            ? '⚠️ 현재 점검 중'
            : data?.active
            ? '점검 예약됨'
            : '정상 운영 중'
        }
      />

      <div className="flex-1 overflow-auto p-8">
        <div className="max-w-xl space-y-6">

          {/* 점검 모드 토글 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-[15px] text-[#1c1c1e]">점검 모드</p>
                <p className="text-[12px] text-gray-400 mt-0.5">
                  활성화하면 설정된 시간 동안 서비스 접근이 차단됩니다.
                </p>
              </div>
              <button
                onClick={() => setActive(v => !v)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  active ? 'bg-[#1c1c1e]' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
                    active ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {data?.currentlyActive && (
              <div className="mt-4 px-4 py-3 bg-red-50 rounded-xl">
                <p className="text-[13px] text-red-600 font-medium">현재 서비스 점검 중입니다.</p>
              </div>
            )}
          </div>

          {/* 점검 시간 설정 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-4">
            <p className="font-semibold text-[14px] text-[#1c1c1e]">점검 시간</p>
            <p className="text-[12px] text-gray-400 -mt-2">
              비워두면 즉시 시작 / 종료 없음으로 설정됩니다.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1.5">시작 시간</label>
                <input
                  type="datetime-local"
                  value={startAt}
                  onChange={e => setStartAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1c1c1e]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1.5">종료 시간</label>
                <input
                  type="datetime-local"
                  value={endAt}
                  onChange={e => setEndAt(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1c1c1e]"
                />
              </div>
            </div>
          </div>

          {/* 점검 메시지 */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 space-y-3">
            <p className="font-semibold text-[14px] text-[#1c1c1e]">점검 안내 메시지</p>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              maxLength={500}
              rows={4}
              placeholder="예: 서버 업그레이드 작업으로 인해 잠시 점검을 진행합니다."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-[#1c1c1e] resize-none"
            />
            <p className="text-[11px] text-gray-300 text-right">{message.length} / 500</p>
          </div>

          {/* 저장 버튼 */}
          <div className="flex items-center justify-between">
            <div>
              {mutation.isSuccess && (
                <p className="text-[13px] text-green-600">저장되었습니다.</p>
              )}
              {mutation.isError && (
                <p className="text-[13px] text-red-500">저장 중 오류가 발생했습니다.</p>
              )}
            </div>
            <button
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending}
              className="px-6 py-2.5 bg-[#1c1c1e] text-white rounded-xl text-[13px] font-semibold hover:opacity-80 disabled:opacity-40"
            >
              {mutation.isPending ? '저장 중...' : '설정 저장'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
