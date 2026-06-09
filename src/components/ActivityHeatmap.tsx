import { useMemo, useState } from "react";

interface ActivityDay {
  date: string;
  transfer_count: number;
}

interface ActivityHeatmapProps {
  days: ActivityDay[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_COUNT = 52;

// GitHub uses Mon-Sun columns (week starts Monday)
const WEEKDAY_LABELS = ["Mon", "Wed", "Fri"];
const WEEKDAY_LABEL_ROWS = [1, 3, 5]; // 0-indexed rows (Mon=0, Wed=2, Fri=4)

function toLocalDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// returns 0(Mon)…6(Sun) — same as GitHub
function isoWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

function levelFor(count: number, max: number): number {
  if (count <= 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio < 0.25) return 1;
  if (ratio < 0.5)  return 2;
  if (ratio < 0.75) return 3;
  return 4;
}

const LEVEL_COLORS = [
  "var(--hm-0)",   // empty
  "var(--hm-1)",
  "var(--hm-2)",
  "var(--hm-3)",
  "var(--hm-4)",
];

export default function ActivityHeatmap({ days }: ActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);

  const { weeks, monthLabels, max } = useMemo(() => {
    const counts = new Map(days.map((d) => [d.date, d.transfer_count]));
    const maxCount = Math.max(0, ...days.map((d) => d.transfer_count));

    // End = today, start = 52 weeks back aligned to Monday
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Walk back to the Monday of "52 weeks ago" so we always show exactly 52 full columns
    const endDay = new Date(today);
    const daysBack = WEEK_COUNT * 7 - 1;
    const rawStart = new Date(today.getTime() - daysBack * DAY_MS);
    const offset = isoWeekday(rawStart); // how many days past Monday
    const startDay = new Date(rawStart.getTime() - offset * DAY_MS);

    const totalDays = Math.round((endDay.getTime() - startDay.getTime()) / DAY_MS) + 1;
    const weeksArr: { date: Date; key: string; count: number; inRange: boolean }[][] = [];
    let currentWeek: typeof weeksArr[0] = [];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDay.getTime() + i * DAY_MS);
      const key = toLocalDateKey(d);
      const inRange = d <= today;
      currentWeek.push({ date: d, key, count: counts.get(key) ?? 0, inRange });
      if (currentWeek.length === 7) {
        weeksArr.push(currentWeek);
        currentWeek = [];
      }
    }
    if (currentWeek.length > 0) weeksArr.push(currentWeek);

    // Month labels: find first week each month appears
    const seen = new Set<string>();
    const labels: { weekIdx: number; label: string }[] = [];
    weeksArr.forEach((week, wi) => {
      const d = week[0].date;
      const monthKey = `${d.getFullYear()}-${d.getMonth()}`;
      if (!seen.has(monthKey)) {
        seen.add(monthKey);
        labels.push({ weekIdx: wi, label: d.toLocaleDateString("en-US", { month: "short" }) });
      }
    });

    return { weeks: weeksArr, monthLabels: labels, max: maxCount };
  }, [days]);

  const CELL = 13;
  const GAP  = 3;
  const STEP = CELL + GAP;
  const LEFT_GUTTER = 32;  // space for weekday labels
  const TOP_GUTTER  = 20;  // space for month labels

  const svgW = LEFT_GUTTER + weeks.length * STEP - GAP + 2;
  const svgH = TOP_GUTTER + 7 * STEP - GAP + 2;

  return (
    <div style={{
      border: "1px solid var(--line)",
      borderRadius: 12,
      padding: "16px 20px 14px",
      backgroundColor: "var(--bg)",
      marginBottom: 20,
    }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>Transfer Activity</span>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, color: "var(--muted-2)" }}>Less</span>
          {[0,1,2,3,4].map(l => (
            <span key={l} style={{
              width: 10, height: 10, borderRadius: 2, display: "inline-block",
              background: LEVEL_COLORS[l],
              border: l === 0 ? "1px solid var(--line)" : "none",
            }} />
          ))}
          <span style={{ fontSize: 11, color: "var(--muted-2)" }}>More</span>
        </div>
      </div>

      {/* SVG grid */}
      <div style={{ overflowX: "auto", position: "relative" }}>
        <svg
          width={svgW}
          height={svgH}
          style={{ display: "block", userSelect: "none" }}
        >
          {/* Month labels */}
          {monthLabels.map(({ weekIdx, label }) => (
            <text
              key={`${weekIdx}-${label}`}
              x={LEFT_GUTTER + weekIdx * STEP}
              y={12}
              fill="var(--muted-2)"
              fontSize={10}
              fontFamily="Inter, sans-serif"
            >
              {label}
            </text>
          ))}

          {/* Weekday labels */}
          {WEEKDAY_LABELS.map((label, i) => (
            <text
              key={label}
              x={0}
              y={TOP_GUTTER + WEEKDAY_LABEL_ROWS[i] * STEP + CELL - 2}
              fill="var(--muted-2)"
              fontSize={9}
              fontFamily="Inter, sans-serif"
            >
              {label}
            </text>
          ))}

          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((day, di) => {
              const level = !day.inRange ? -1 : levelFor(day.count, max);
              const bg = level < 0 ? "transparent" : LEVEL_COLORS[level];
              const hasBorder = level === 0;
              const cx = LEFT_GUTTER + wi * STEP;
              const cy = TOP_GUTTER + di * STEP;
              return (
                <g key={day.key}>
                  <rect
                    x={cx}
                    y={cy}
                    width={CELL}
                    height={CELL}
                    rx={2.5}
                    ry={2.5}
                    fill={bg}
                    stroke={hasBorder ? "var(--line)" : "none"}
                    strokeWidth={hasBorder ? 0.75 : 0}
                    style={{ cursor: day.inRange ? "pointer" : "default" }}
                    onMouseEnter={(e) => {
                      if (!day.inRange) return;
                      const rect = (e.target as SVGRectElement).getBoundingClientRect();
                      const parent = (e.target as SVGRectElement).closest("div")!.getBoundingClientRect();
                      setTooltip({
                        text: `${day.count} transfer${day.count !== 1 ? "s" : ""} · ${day.date}`,
                        x: rect.left - parent.left + CELL / 2,
                        y: rect.top - parent.top - 8,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                </g>
              );
            })
          )}
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div style={{
            position: "absolute",
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
            background: "var(--panel)",
            border: "1px solid var(--line-2)",
            borderRadius: 6,
            padding: "4px 9px",
            fontSize: 11,
            color: "var(--fg)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10,
            boxShadow: "0 4px 12px rgba(0,0,0,.3)",
          }}>
            {tooltip.text}
          </div>
        )}
      </div>
    </div>
  );
}
