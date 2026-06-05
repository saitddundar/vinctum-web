import { useMemo } from "react";

interface ActivityDay {
  date: string; // ISO format
  transfer_count: number;
}

interface ActivityHeatmapProps {
  days: ActivityDay[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_COUNT = 16;
const DAY_COUNT = WEEK_COUNT * 7;
const WEEKDAYS = ["M", "", "W", "", "F", "", "S"];

function levelFor(count: number, max: number) {
  if (count <= 0) return 0;
  if (max <= 1) return 1;
  return Math.min(4, Math.max(1, Math.ceil((count / max) * 4)));
}

export default function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const { cells, max, weeks } = useMemo(() => {
    const counts = new Map(days.map((d) => [d.date, d.transfer_count]));
    const today = new Date();
    const start = new Date(today.getTime() - (DAY_COUNT - 1) * DAY_MS);
    const startOffset = (start.getDay() + 6) % 7;
    const alignedStart = new Date(start.getTime() - startOffset * DAY_MS);

    const generatedCells = Array.from({ length: WEEK_COUNT * 7 }, (_, index) => {
      const date = new Date(alignedStart.getTime() + index * DAY_MS);
      const key = date.toISOString().slice(0, 10);
      const inRange = date >= start && date <= today;
      return { date, key, count: inRange ? counts.get(key) ?? 0 : -1 };
    });

    const maxCount = Math.max(1, ...days.map((d) => d.transfer_count));
    const generatedWeeks = Array.from({ length: WEEK_COUNT }, (_, week) =>
      generatedCells.slice(week * 7, week * 7 + 7)
    );

    return { cells: generatedCells, max: maxCount, weeks: generatedWeeks };
  }, [days]);

  return (
    <div style={{
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: "16px 20px",
      backgroundColor: "var(--bg)",
      marginBottom: 20
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Transfer Activity</span>
        <span style={{ fontSize: 12, color: "var(--muted-2)" }}>Last 16 weeks</span>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 14 }}>
          {WEEKDAYS.map((day, i) => (
            <span key={i} style={{ fontSize: 10, color: "var(--muted-2)", height: 12, lineHeight: "12px" }}>{day}</span>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            {weeks.map((week, index) => {
              const first = week[0].date;
              const label = index === 0 || first.getDate() <= 7 ? first.toLocaleDateString("en-US", { month: "short" }) : "";
              return (
                <span key={index} style={{ width: 12, fontSize: 10, color: "var(--muted-2)" }}>{label}</span>
              );
            })}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {week.map((day) => {
                  const level = day.count < 0 ? -1 : levelFor(day.count, max);
                  const bg = level === -1 ? "transparent"
                    : level === 0 ? "oklch(1 0 0 / .03)"
                    : level === 1 ? "rgba(110, 231, 183, 0.22)"
                    : level === 2 ? "rgba(110, 231, 183, 0.42)"
                    : level === 3 ? "rgba(110, 231, 183, 0.68)"
                    : "var(--accent)";
                  return (
                    <div
                      key={day.key}
                      style={{
                        width: 12,
                        height: 12,
                        borderRadius: 3,
                        backgroundColor: bg,
                        border: level === 0 ? "1px solid var(--line)" : "none"
                      }}
                      title={`${day.count >= 0 ? day.count : 0} transfers on ${day.date}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
