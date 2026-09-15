"use client";

export default function Weekdays({
  dayActivityData,
}: {
  dayActivityData: { day: string; count: number }[];
}) {
  const maxDayCount = Math.max(...dayActivityData.map((d) => d.count), 1);

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-7 flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold">요일별 활동</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          회의가 가장 많은 요일
        </p>
      </div>
      <div className="space-y-3.5 my-6">
        {dayActivityData.map((item, idx) => {
          const percentage =
            maxDayCount > 0 ? Math.round((item.count / maxDayCount) * 100) : 0;
          const isHighest = item.count > 0 && item.count === maxDayCount;
          return (
            <div key={idx} className="flex items-center gap-4 text-sm">
              <span
                className={`w-6 font-semibold ${isHighest ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                {item.day}
              </span>
              <div className="flex-1 h-3.5 bg-muted/40 rounded-full overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHighest
                      ? "bg-gradient-to-r from-primary/80 to-primary shadow-sm"
                      : "bg-primary/30"
                  }`}
                  style={{
                    width: `${Math.max(percentage, item.count > 0 ? 8 : 2)}%`,
                  }}
                />
              </div>
              <span
                className={`w-8 text-right text-xs font-bold ${isHighest ? "text-primary" : "text-muted-foreground"}`}
              >
                {item.count}건
              </span>
            </div>
          );
        })}
      </div>
      <div className="pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
        <span>가장 활발한 요일에 진한 그라데이션이 적용됩니다.</span>
        <span className="font-semibold text-primary">실시간 데이터 연동</span>
      </div>
    </div>
  );
}
