import React from "react";
import ReactDOM from "react-dom/client";
import {
  Activity,
  BarChart3,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  ClipboardList,
  Home,
  Sparkles,
  UserRound,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

type TabId = "home" | "survey" | "stats" | "ai" | "methods" | "mine";
type EffortResult = "O" | "X";
type StudyStyleId = "efficient" | "consistent" | "lastMinute" | "lowFocus" | "perfectionist";

type Survey = {
  id: string;
  grade: number;
  studyHours: number;
  focus: number;
  effortResult: EffortResult;
  satisfaction: number;
  createdAt: string;
};

type DbSurvey = {
  id: string;
  grade: number;
  study_hours: number;
  focus: number;
  effort_result: EffortResult;
  satisfaction: number;
  created_at: string;
};

type StudyStyle = {
  id: StudyStyleId;
  icon: string;
  title: string;
  english: string;
  rule: string;
  features: string[];
  strengths: string[];
  cautions: string[];
  methods: string[];
  routine: string[];
};

const tabs: Array<{ id: TabId; label: string; icon: React.ElementType }> = [
  { id: "home", label: "홈", icon: Home },
  { id: "survey", label: "설문", icon: ClipboardList },
  { id: "stats", label: "통계", icon: BarChart3 },
  { id: "ai", label: "AI 추천", icon: BrainCircuit },
  { id: "methods", label: "공부법", icon: BookOpen },
  { id: "mine", label: "내 분석", icon: UserRound },
];

const styles: StudyStyle[] = [
  {
    id: "efficient",
    icon: "⚡",
    title: "고효율형",
    english: "High Efficiency",
    rule: "집중도 75% 이상, 만족도 7점 이상, 노력 대비 성적 O, 순공시간 4시간 이하",
    features: ["공부시간은 평균 수준이지만 집중도가 매우 높음", "노력 대비 성적이 잘 나오는 편", "성적 만족도도 높은 편"],
    strengths: ["짧은 시간에도 높은 성과", "계획 실천력이 좋음", "공부 효율이 뛰어남"],
    cautions: ["쉬운 과목만 공부하지 않기", "공부량이 너무 적어지지 않도록 유지"],
    methods: ["어려운 과목에 시간을 더 투자하기", "오답노트 위주 복습", "심화 문제 풀이", "주 1회 전체 복습"],
    routine: ["60분 공부", "10분 휴식", "하루 2~4시간"],
  },
  {
    id: "consistent",
    icon: "📅",
    title: "꾸준형",
    english: "Consistent",
    rule: "순공시간 3시간 이상, 집중도 60% 이상, 만족도 6점 이상",
    features: ["매일 일정하게 공부함", "집중도와 공부시간이 평균 이상", "성적이 안정적임"],
    strengths: ["성적 변동이 적음", "장기적으로 성장 가능"],
    cautions: ["공부가 반복적으로 느껴질 수 있음", "새로운 공부법도 시도해보기"],
    methods: ["매일 같은 시간 공부하기", "주간 목표 설정", "복습 비중 늘리기", "시험 전에는 문제풀이 중심"],
    routine: ["50분 공부", "10분 휴식", "하루 3~5시간"],
  },
  {
    id: "lastMinute",
    icon: "🔥",
    title: "벼락치기형",
    english: "Last-Minute",
    rule: "순공시간 2시간 미만이지만 집중도 65% 이상",
    features: ["평소 공부시간이 적음", "시험 직전에 몰아서 공부", "집중도는 높은 편"],
    strengths: ["단기간 집중력이 뛰어남", "위기 상황 대응 능력이 좋음"],
    cautions: ["장기 기억에 불리함", "시험 범위가 많아지면 효율 급감"],
    methods: ["하루 30분이라도 꾸준히 복습", "시험 2주 전부터 계획 세우기", "암기 과목은 반복 주기 만들기", "공부를 작은 단위로 나누기"],
    routine: ["평소 1~2시간 꾸준히", "시험 직전에는 복습 중심"],
  },
  {
    id: "lowFocus",
    icon: "😵",
    title: "저집중형",
    english: "Low Focus",
    rule: "집중도 50% 미만, 또는 순공시간 3.5시간 이상인데 집중도 55% 미만",
    features: ["공부시간은 길지만 집중도가 낮음", "성적 만족도가 낮은 편", "공부 대비 효율이 떨어짐"],
    strengths: ["공부하려는 의지는 있음", "시간을 확보할 수 있음"],
    cautions: ["휴대폰, SNS 등 방해 요소 관리 필요", "오래 앉아 있는 것보다 집중도가 중요"],
    methods: ["포모도로 기법(25분 공부, 5분 휴식)", "공부 전 휴대폰 치우기", "하루 목표를 작게 설정하기", "집중이 잘 되는 장소 찾기"],
    routine: ["25분 공부", "5분 휴식", "4세트 후 20분 휴식"],
  },
  {
    id: "perfectionist",
    icon: "🎯",
    title: "완벽주의형",
    english: "Perfectionist",
    rule: "순공시간 4.5시간 이상인데 만족도 6점 이하, 또는 집중도 75% 이상인데 만족도 5점 이하",
    features: ["공부시간이 길고 노력도 많음", "성적이 좋아도 만족하지 못함", "작은 실수에도 스트레스를 받음"],
    strengths: ["책임감이 강함", "꼼꼼하게 공부함"],
    cautions: ["한 문제에 너무 오래 매달리지 않기", "결과보다 과정을 인정하기"],
    methods: ["'80% 이해하면 다음으로' 원칙 적용", "시간 제한을 두고 문제 풀기", "틀린 문제뿐 아니라 맞힌 문제도 복습", "성취한 내용을 기록하며 자신감을 쌓기"],
    routine: ["45~60분 공부", "10분 휴식", "하루를 마친 뒤 '오늘 잘한 점 3가지' 기록"],
  },
];

const sampleSurveys: Survey[] = [
  { id: "s1", grade: 7, studyHours: 2.2, focus: 62, effortResult: "O", satisfaction: 7, createdAt: "2026-06-01T10:00:00Z" },
  { id: "s2", grade: 8, studyHours: 3.1, focus: 72, effortResult: "O", satisfaction: 8, createdAt: "2026-06-02T10:00:00Z" },
  { id: "s3", grade: 9, studyHours: 4.0, focus: 38, effortResult: "X", satisfaction: 5, createdAt: "2026-06-03T10:00:00Z" },
  { id: "s4", grade: 10, studyHours: 1.4, focus: 81, effortResult: "O", satisfaction: 7, createdAt: "2026-06-04T10:00:00Z" },
  { id: "s5", grade: 11, studyHours: 5.2, focus: 65, effortResult: "X", satisfaction: 6, createdAt: "2026-06-05T10:00:00Z" },
  { id: "s6", grade: 12, studyHours: 4.6, focus: 77, effortResult: "O", satisfaction: 8, createdAt: "2026-06-06T10:00:00Z" },
  { id: "s7", grade: 13, studyHours: 6.0, focus: 58, effortResult: "X", satisfaction: 6, createdAt: "2026-06-07T10:00:00Z" },
  { id: "s8", grade: 10, studyHours: 3.4, focus: 88, effortResult: "O", satisfaction: 9, createdAt: "2026-06-08T10:00:00Z" },
  { id: "s9", grade: 8, studyHours: 2.8, focus: 45, effortResult: "X", satisfaction: 5, createdAt: "2026-06-09T10:00:00Z" },
  { id: "s10", grade: 12, studyHours: 5.8, focus: 91, effortResult: "O", satisfaction: 9, createdAt: "2026-06-10T10:00:00Z" },
  { id: "s11", grade: 11, studyHours: 2.0, focus: 76, effortResult: "O", satisfaction: 7, createdAt: "2026-06-11T10:00:00Z" },
  { id: "s12", grade: 9, studyHours: 3.8, focus: 49, effortResult: "X", satisfaction: 4, createdAt: "2026-06-12T10:00:00Z" },
];

type RuntimeConfig = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  geminiApiKey?: string;
  geminiModel?: string;
};

const runtimeConfig =
  (window as typeof window & { __STUDY_AI_CONFIG__?: RuntimeConfig }).__STUDY_AI_CONFIG__ ?? {};
const supabaseUrl = runtimeConfig.supabaseUrl ?? (import.meta.env.VITE_SUPABASE_URL as string | undefined);
const supabaseKey = runtimeConfig.supabaseAnonKey ?? (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);
const geminiApiKey = runtimeConfig.geminiApiKey ?? (import.meta.env.VITE_GEMINI_API_KEY as string | undefined);
const geminiModel = runtimeConfig.geminiModel ?? (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? "gemini-2.0-flash";
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

const localKey = "study-ai-surveys";
const myKey = "study-ai-my-latest";

function findStyle(id: StudyStyleId) {
  return styles.find((item) => item.id === id)!;
}

function toSurvey(row: DbSurvey): Survey {
  return {
    id: row.id,
    grade: row.grade,
    studyHours: row.study_hours,
    focus: row.focus,
    effortResult: row.effort_result,
    satisfaction: row.satisfaction,
    createdAt: row.created_at,
  };
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function rounded(value: number, digit = 1) {
  return Number(value.toFixed(digit));
}

function loadLocalSurveys() {
  try {
    const stored = localStorage.getItem(localKey);
    return stored ? (JSON.parse(stored) as Survey[]) : [];
  } catch {
    return [];
  }
}

function saveLocalSurvey(survey: Survey) {
  const next = [survey, ...loadLocalSurveys()].slice(0, 100);
  localStorage.setItem(localKey, JSON.stringify(next));
  localStorage.setItem(myKey, JSON.stringify(survey));
}

function classifyStyle(survey: Survey): StudyStyle {
  if (survey.focus < 50 || (survey.studyHours >= 3.5 && survey.focus < 55)) return findStyle("lowFocus");
  if (survey.studyHours >= 4.5 && survey.satisfaction <= 6) return findStyle("perfectionist");
  if (survey.focus >= 75 && survey.satisfaction <= 5) return findStyle("perfectionist");
  if (survey.studyHours < 2 && survey.focus >= 65) return findStyle("lastMinute");
  if (survey.focus >= 75 && survey.satisfaction >= 7 && survey.effortResult === "O" && survey.studyHours <= 4) return findStyle("efficient");
  if (survey.studyHours >= 3 && survey.focus >= 60 && survey.satisfaction >= 6) return findStyle("consistent");
  if (survey.focus >= 70 && survey.effortResult === "O") return findStyle("efficient");
  return findStyle("consistent");
}

function makeStats(data: Survey[]) {
  const avgHours = rounded(average(data.map((item) => item.studyHours)));
  const avgFocus = rounded(average(data.map((item) => item.focus)));
  const avgSatisfaction = rounded(average(data.map((item) => item.satisfaction)));
  const positive = data.filter((item) => item.effortResult === "O").length;
  const effortRatio = data.length ? Math.round((positive / data.length) * 100) : 0;
  return { avgHours, avgFocus, avgSatisfaction, effortRatio };
}

function groupByGrade(data: Survey[]) {
  return Array.from({ length: 7 }, (_, index) => {
    const grade = index + 7;
    const gradeData = data.filter((item) => item.grade === grade);
    return {
      grade: `${grade}학년`,
      hours: rounded(average(gradeData.map((item) => item.studyHours))),
      focus: rounded(average(gradeData.map((item) => item.focus))),
      satisfaction: rounded(average(gradeData.map((item) => item.satisfaction))),
      count: gradeData.length,
    };
  });
}

function makeDistribution(data: Survey[], key: "studyHours" | "focus" | "satisfaction") {
  const ranges =
    key === "studyHours"
      ? [
          [0, 1, "0~1h"],
          [1, 2, "1~2h"],
          [2, 3, "2~3h"],
          [3, 4, "3~4h"],
          [4, 5, "4~5h"],
          [5, 99, "5h+"],
        ]
      : key === "focus"
        ? [
            [0, 20, "0~20%"],
            [20, 40, "20~40%"],
            [40, 60, "40~60%"],
            [60, 80, "60~80%"],
            [80, 101, "80%+"],
          ]
        : [
            [1, 3, "1~2"],
            [3, 5, "3~4"],
            [5, 7, "5~6"],
            [7, 9, "7~8"],
            [9, 11, "9~10"],
          ];

  return ranges.map(([min, max, label]) => ({
    label,
    count: data.filter((item) => item[key] >= Number(min) && item[key] < Number(max)).length,
  }));
}

function percentile(value: number, values: number[]) {
  if (!values.length) return 0;
  const below = values.filter((item) => item <= value).length;
  return Math.min(99, Math.max(1, Math.round((below / values.length) * 100)));
}

function findSimilarStudents(my: Survey, data: Survey[]) {
  return data
    .filter((item) => item.id !== my.id)
    .map((item) => ({
      ...item,
      distance:
        Math.abs(item.grade - my.grade) * 1.2 +
        Math.abs(item.studyHours - my.studyHours) +
        Math.abs(item.focus - my.focus) / 20 +
        Math.abs(item.satisfaction - my.satisfaction) / 2,
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 4);
}

function buildInsight(data: Survey[]) {
  const highFocus = data.filter((item) => item.focus >= 70);
  const lowFocus = data.filter((item) => item.focus < 70);
  const highSat = average(highFocus.map((item) => item.satisfaction));
  const lowSat = average(lowFocus.map((item) => item.satisfaction));
  const gradeHours = groupByGrade(data).sort((a, b) => b.hours - a.hours)[0];
  return [
    `집중도가 70% 이상인 학생은 평균 성적 만족도가 ${rounded(highSat)}점으로, 그 외 학생 평균 ${rounded(lowSat)}점보다 높습니다.`,
    `${gradeHours?.grade ?? "상위 학년"}의 평균 순공시간이 ${gradeHours?.hours ?? 0}시간으로 가장 높게 나타났습니다.`,
    "공부시간보다 집중도와 만족도의 연결이 더 강하게 보입니다. 오래 앉아 있기보다 몰입 구간을 늘리는 전략이 효과적입니다.",
  ];
}

function localAiText(survey: Survey, style: StudyStyle, allStats: ReturnType<typeof makeStats>) {
  return `분석 결과, 하루 순공시간은 ${survey.studyHours}시간이고 집중도는 ${survey.focus}%입니다. 전체 평균 ${allStats.avgHours}시간, ${allStats.avgFocus}%와 비교하면 현재 유형은 ${style.title}에 가깝습니다. ${style.rule} 기준에 따라 분류했으며, 지금은 ${style.id === "lowFocus" ? "공부시간을 더 늘리기보다 방해 요소를 줄이고 짧은 몰입 세트를 만드는 것" : style.id === "perfectionist" ? "완벽하게 끝내려는 압박을 줄이고 제한 시간 안에서 다음 단원으로 넘어가는 것" : "현재 강점을 유지하면서 약한 과목을 계획적으로 보완하는 것"}이 가장 효과적입니다.`;
}

function localAiComment(survey: Survey, style: StudyStyle) {
  const comments: Record<StudyStyleId, string> = {
    efficient:
      `AI 코멘트: 지금은 효율이 좋은 편이라 공부시간을 무작정 늘리기보다 어려운 과목에 시간을 재배치하는 것이 좋습니다. 하루 ${Math.max(2, Math.round(survey.studyHours))}시간 안에서 오답노트 30분, 심화 문제 40분, 약한 단원 복습 30분처럼 목적을 나눠 공부해보세요. 쉬운 과목으로 성취감만 얻는 패턴은 줄이고, 주 1회는 전체 과목을 짧게 점검하는 루틴을 추천합니다.`,
    consistent:
      `AI 코멘트: ${style.title}은 가장 안정적으로 성장하기 좋은 유형입니다. 지금처럼 꾸준히 하되 매일 같은 방식으로만 공부하면 효율이 정체될 수 있으니, 평일에는 개념 복습과 문제 풀이를 나누고 주말에는 틀린 문제만 다시 보는 시간을 따로 두세요. 하루 목표를 "몇 시간"이 아니라 "수학 오답 10개, 영어 지문 3개"처럼 결과 단위로 정하면 더 좋아집니다.`,
    lastMinute:
      "AI 코멘트: 벼락치기 집중력은 장점이지만 시험 범위가 넓어질수록 위험해집니다. 평소에는 하루 30분만이라도 그날 배운 내용을 다시 보는 고정 복습 시간을 만들고, 시험 2주 전부터는 과목별 체크리스트를 작게 쪼개세요. 몰아서 공부하는 날에도 새 내용을 많이 넣기보다 이미 본 내용을 빠르게 반복하는 쪽이 점수에 더 유리합니다.",
    lowFocus:
      "AI 코멘트: 지금은 공부시간을 더 늘리는 것보다 집중 환경을 바꾸는 게 먼저입니다. 25분 공부, 5분 휴식으로 시작하고 휴대폰은 책상 밖에 두세요. 하루 목표는 크게 잡지 말고 '문제 5개 풀기', '개념 2쪽 정리'처럼 작게 끝낼 수 있는 단위로 쪼개면 집중도가 올라갑니다.",
    perfectionist:
      "AI 코멘트: 완벽하게 이해하려는 태도는 강점이지만 한 문제에 너무 오래 머물면 전체 공부 흐름이 막힐 수 있습니다. 문제마다 제한 시간을 정하고 80% 이해했다면 다음 단계로 넘어가는 연습을 해보세요. 하루 끝에는 틀린 것만 보지 말고 오늘 해결한 것 3가지를 적어 만족도를 회복하는 루틴을 추천합니다.",
  };
  return comments[style.id];
}

async function requestGeminiText(survey: Survey, style: StudyStyle, allStats: ReturnType<typeof makeStats>) {
  if (!geminiApiKey) return null;

  const prompt = [
    "너는 중고등학생을 위한 학습 코치야.",
    "아래 설문 결과를 바탕으로 한국어로 짧고 실천 가능한 AI 추천을 작성해.",
    "첫 문단은 왜 이 공부 스타일인지 설명하고, 두 번째 문단은 'AI 코멘트:'로 시작해서 어떻게 공부하면 좋을지 구체적으로 말해.",
    "전체는 6~8문장으로 작성하고, 학생을 비난하지 말고 친절하게 말해.",
    `분류된 스타일: ${style.title} (${style.english})`,
    `분류 기준: ${style.rule}`,
    `학년: ${survey.grade}`,
    `하루 순공시간: ${survey.studyHours}시간`,
    `평균 집중도: ${survey.focus}%`,
    `노력 대비 성적: ${survey.effortResult}`,
    `성적 만족도: ${survey.satisfaction}/10`,
    `전체 평균 순공시간: ${allStats.avgHours}시간`,
    `전체 평균 집중도: ${allStats.avgFocus}%`,
    `전체 평균 만족도: ${allStats.avgSatisfaction}/10`,
  ].join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 360 },
        }),
      },
    );
    if (!response.ok) return null;
    const result = await response.json();
    return result?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? "").join("").trim() || null;
  } catch {
    return null;
  }
}

function App() {
  const [activeTab, setActiveTab] = React.useState<TabId>("home");
  const [selectedGrade, setSelectedGrade] = React.useState<number | "all">("all");
  const [selectedStyleId, setSelectedStyleId] = React.useState<StudyStyleId>("efficient");
  const [surveys, setSurveys] = React.useState<Survey[]>(sampleSurveys);
  const [mySurvey, setMySurvey] = React.useState<Survey | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [notice, setNotice] = React.useState("");
  const [form, setForm] = React.useState({
    grade: 10,
    studyHours: 4,
    focus: 60,
    effortResult: "O" as EffortResult,
    satisfaction: 6,
  });

  React.useEffect(() => {
    async function loadSurveys() {
      const localMine = localStorage.getItem(myKey);
      if (localMine) setMySurvey(JSON.parse(localMine));

      if (!supabase) {
        const local = loadLocalSurveys();
        setSurveys([...local, ...sampleSurveys]);
        setNotice("Supabase 키가 없어서 샘플 데이터와 이 브라우저의 저장 데이터로 실행 중입니다.");
        return;
      }

      const { data, error } = await supabase
        .from("study_surveys")
        .select("id, grade, study_hours, focus, effort_result, satisfaction, created_at")
        .order("created_at", { ascending: false });

      if (error || !data) {
        setSurveys([...loadLocalSurveys(), ...sampleSurveys]);
        setNotice("Supabase 데이터를 불러오지 못해 샘플 데이터로 표시 중입니다. 테이블 이름과 정책을 확인해주세요.");
        return;
      }

      setSurveys(data.map((row) => toSurvey(row as DbSurvey)));
      setNotice("Supabase와 연결되어 실시간 설문 데이터를 사용 중입니다.");
    }

    loadSurveys();
  }, []);

  const filtered = selectedGrade === "all" ? surveys : surveys.filter((item) => item.grade === selectedGrade);
  const stats = makeStats(filtered);
  const allStats = makeStats(surveys);
  const gradeChart = groupByGrade(filtered.length ? filtered : surveys);
  const insight = buildInsight(filtered.length ? filtered : surveys);
  const selectedStyle = findStyle(selectedStyleId);
  const similar = mySurvey ? findSimilarStudents(mySurvey, surveys) : [];

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    const survey: Survey = {
      id: crypto.randomUUID(),
      grade: form.grade,
      studyHours: Number(form.studyHours),
      focus: Number(form.focus),
      effortResult: form.effortResult,
      satisfaction: Number(form.satisfaction),
      createdAt: new Date().toISOString(),
    };

    let savedToSupabase = false;
    if (supabase) {
      const { error } = await supabase.from("study_surveys").insert({
        id: survey.id,
        grade: survey.grade,
        study_hours: survey.studyHours,
        focus: survey.focus,
        effort_result: survey.effortResult,
        satisfaction: survey.satisfaction,
        created_at: survey.createdAt,
      });
      savedToSupabase = !error;
    }

    saveLocalSurvey(survey);
    setSurveys((items) => [survey, ...items]);
    setMySurvey(survey);
    setIsSaving(false);
    setNotice(savedToSupabase ? "설문이 Supabase에 저장되었습니다." : "설문이 이 브라우저에 저장되었습니다. Supabase 키를 넣으면 DB에도 저장됩니다.");
    setActiveTab("ai");
  }

  return (
    <main className={`app-shell tab-${activeTab}`}>
      <div className="grain" />
      <header className="brand">
        <div>
          <strong>study.ai</strong>
          <span>학습 패턴 분석 · Supabase survey lab</span>
        </div>
      </header>

      <nav className="top-nav" aria-label="주요 메뉴">
        <button className="nav-orb" aria-label="AI 상태">
          <Sparkles size={17} />
        </button>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => setActiveTab(tab.id)}>
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <section className="robot-stage" aria-hidden="true">
        <span className="mega-word">study.ai</span>
        <img src="/assets/study-robot-transparent.png" alt="" className="robot" />
      </section>

      <section className="content">
        <p className="system-note">{notice}</p>
        {activeTab === "home" && <HomeView startSurvey={() => setActiveTab("survey")} />}
        {activeTab === "survey" && <SurveyView form={form} setForm={setForm} onSubmit={handleSubmit} isSaving={isSaving} />}
        {activeTab === "stats" && (
          <StatsView
            data={filtered}
            stats={stats}
            selectedGrade={selectedGrade}
            setSelectedGrade={setSelectedGrade}
            gradeChart={gradeChart}
            insight={insight}
          />
        )}
        {activeTab === "ai" && (
          <AiView mySurvey={mySurvey} allStats={allStats} data={surveys} setActiveTab={setActiveTab} />
        )}
        {activeTab === "methods" && (
          <MethodsView selectedStyleId={selectedStyleId} setSelectedStyleId={setSelectedStyleId} selectedStyle={selectedStyle} />
        )}
        {activeTab === "mine" && (
          <MineView mySurvey={mySurvey} data={surveys} allStats={allStats} similar={similar} setActiveTab={setActiveTab} />
        )}
      </section>
    </main>
  );
}

function HomeView({ startSurvey }: { startSurvey: () => void }) {
  return (
    <div className="home-grid">
      <div className="intro">
        <span className="section-code">01 / HOME</span>
        <h1>공부시간보다 중요한 패턴을 AI가 읽어줍니다.</h1>
        <p>설문을 시작하면 전체 학생 데이터와 비교해 나의 공부 스타일을 분석하고, Gemini 기반 AI 추천까지 확인할 수 있습니다.</p>
        <button className="primary-action" onClick={startSurvey}>
          시작하기
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function SurveyView({
  form,
  setForm,
  onSubmit,
  isSaving,
}: {
  form: { grade: number; studyHours: number; focus: number; effortResult: EffortResult; satisfaction: number };
  setForm: React.Dispatch<React.SetStateAction<{ grade: number; studyHours: number; focus: number; effortResult: EffortResult; satisfaction: number }>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
}) {
  return (
    <div className="survey-view">
      <ViewTitle code="02 / SURVEY" title="설문" desc="나의 현재 공부 패턴을 입력해주세요. 제출하면 AI 추천 탭으로 이동합니다." />
      <div className="survey-panel">
        <div className="panel-heading">
          <span>설문 입력</span>
          <strong>5개 항목</strong>
        </div>
        <form onSubmit={onSubmit}>
          <label>
            <span>학년</span>
            <select value={form.grade} onChange={(event) => setForm((prev) => ({ ...prev, grade: Number(event.target.value) }))}>
              {Array.from({ length: 7 }, (_, index) => index + 7).map((grade) => (
                <option key={grade} value={grade}>
                  {grade}학년
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>하루 순공시간</span>
            <input
              type="number"
              min="0"
              max="12"
              step="0.5"
              value={form.studyHours}
              onChange={(event) => setForm((prev) => ({ ...prev, studyHours: Number(event.target.value) }))}
            />
          </label>
          <label>
            <span>평균 집중도 {form.focus}%</span>
            <input
              type="range"
              min="0"
              max="100"
              value={form.focus}
              onChange={(event) => setForm((prev) => ({ ...prev, focus: Number(event.target.value) }))}
            />
          </label>
          <label>
            <span>노력 대비 성적</span>
            <div className="segmented">
              {(["O", "X"] as EffortResult[]).map((value) => (
                <button
                  type="button"
                  key={value}
                  className={form.effortResult === value ? "active" : ""}
                  onClick={() => setForm((prev) => ({ ...prev, effortResult: value }))}
                >
                  {value}
                </button>
              ))}
            </div>
          </label>
          <label>
            <span>성적 만족도 {form.satisfaction}/10</span>
            <input
              type="range"
              min="1"
              max="10"
              value={form.satisfaction}
              onChange={(event) => setForm((prev) => ({ ...prev, satisfaction: Number(event.target.value) }))}
            />
          </label>
          <button className="submit-button" type="submit" disabled={isSaving}>
            {isSaving ? "저장 중" : "설문 제출"}
            <Activity size={17} />
          </button>
        </form>
      </div>
    </div>
  );
}

function StatsView({
  data,
  stats,
  selectedGrade,
  setSelectedGrade,
  gradeChart,
  insight,
}: {
  data: Survey[];
  stats: ReturnType<typeof makeStats>;
  selectedGrade: number | "all";
  setSelectedGrade: React.Dispatch<React.SetStateAction<number | "all">>;
  gradeChart: ReturnType<typeof groupByGrade>;
  insight: string[];
}) {
  const pieData = [
    { name: "O", value: data.filter((item) => item.effortResult === "O").length },
    { name: "X", value: data.filter((item) => item.effortResult === "X").length },
  ];

  return (
    <div className="stack-view">
      <ViewTitle code="03 / STATS" title="통계" desc="전체와 학년별 데이터를 나눠 보고, 공부 패턴 사이의 관계를 확인합니다." />
      <div className="filter-row">
        {(["all", 7, 8, 9, 10, 11, 12, 13] as Array<number | "all">).map((grade) => (
          <button key={grade} className={selectedGrade === grade ? "active" : ""} onClick={() => setSelectedGrade(grade)}>
            {grade === "all" ? "전체" : `${grade}학년`}
          </button>
        ))}
      </div>
      <div className="metrics">
        <Metric label="전체 평균 순공시간" value={`${stats.avgHours}h`} />
        <Metric label="전체 평균 집중도" value={`${stats.avgFocus}%`} />
        <Metric label="전체 평균 성적 만족도" value={`${stats.avgSatisfaction}/10`} />
        <Metric label="노력 대비 성적 O 비율" value={`${stats.effortRatio}%`} />
      </div>
      <div className="chart-grid">
        <ChartPanel title="학년별 평균 순공시간">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gradeChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dce4e7" />
              <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#078c83" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <ChartPanel title="학년별 평균 집중도 / 만족도">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={gradeChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dce4e7" />
              <XAxis dataKey="grade" tick={{ fontSize: 11 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="focus" name="집중도" fill="#10171b" radius={[8, 8, 0, 0]} />
              <Bar dataKey="satisfaction" name="만족도" fill="#7accc5" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartPanel>
        <DistributionPanel title="순공시간 분포" data={makeDistribution(data, "studyHours")} />
        <DistributionPanel title="집중도 분포" data={makeDistribution(data, "focus")} />
        <DistributionPanel title="성적 만족도 분포" data={makeDistribution(data, "satisfaction")} />
        <ChartPanel title="노력 대비 성적 O/X 비율">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={54} outerRadius={82} paddingAngle={5}>
                <Cell fill="#078c83" />
                <Cell fill="#10171b" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartPanel>
      </div>
      <div className="relation-grid">
        <ScatterPanel title="순공시간 ↔ 성적 만족도" data={data.map((item) => ({ x: item.studyHours, y: item.satisfaction }))} x="시간" y="만족도" />
        <ScatterPanel title="집중도 ↔ 성적 만족도" data={data.map((item) => ({ x: item.focus, y: item.satisfaction }))} x="집중도" y="만족도" />
        <ScatterPanel title="순공시간 ↔ 집중도" data={data.map((item) => ({ x: item.studyHours, y: item.focus }))} x="시간" y="집중도" />
        <ScatterPanel title="학년 ↔ 공부시간" data={data.map((item) => ({ x: item.grade, y: item.studyHours }))} x="학년" y="시간" />
      </div>
      <div className="insight-box">
        <span>자동 인사이트</span>
        {insight.map((item) => (
          <p key={item}>{item}</p>
        ))}
      </div>
    </div>
  );
}

function AiView({
  mySurvey,
  allStats,
  data,
  setActiveTab,
}: {
  mySurvey: Survey | null;
  allStats: ReturnType<typeof makeStats>;
  data: Survey[];
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
}) {
  const [aiText, setAiText] = React.useState("");
  const [aiComment, setAiComment] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    async function run() {
      if (!mySurvey) return;
      const style = classifyStyle(mySurvey);
      setIsLoading(true);
      const geminiText = await requestGeminiText(mySurvey, style, allStats);
      if (!active) return;
      const fallbackText = localAiText(mySurvey, style, allStats);
      const fallbackComment = localAiComment(mySurvey, style);
      if (geminiText) {
        const [summary, ...commentParts] = geminiText.split(/AI 코멘트:/);
        setAiText(summary.trim() || fallbackText);
        setAiComment(commentParts.length ? `AI 코멘트: ${commentParts.join("AI 코멘트:").trim()}` : geminiText);
      } else {
        setAiText(fallbackText);
        setAiComment(fallbackComment);
      }
      setIsLoading(false);
    }
    run();
    return () => {
      active = false;
    };
  }, [mySurvey, allStats.avgHours, allStats.avgFocus, allStats.avgSatisfaction]);

  if (!mySurvey) {
    return (
      <div className="empty-state ai-empty">
        <ViewTitle code="04 / AI" title="AI 추천" desc="아직 설문 결과가 없어서 AI 추천을 만들 수 없습니다." />
        <p>먼저 설문 탭에서 5개 항목을 제출하면, Gemini API가 결과를 분석해 나에게 맞는 공부 스타일과 추천 루틴을 보여줍니다.</p>
        <button className="primary-action" onClick={() => setActiveTab("survey")}>
          설문하러 가기
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  const style = classifyStyle(mySurvey);
  const similar = findSimilarStudents(mySurvey, data);

  return (
    <div className="stack-view ai-layout">
      <ViewTitle code="04 / AI" title="AI 추천" desc="제출한 설문 결과를 바탕으로 공부 스타일을 자동 분류합니다." />
      <div className="ai-card">
        <span className="style-badge">{style.icon} {style.title}</span>
        <h2>당신의 공부 스타일은 {style.title}입니다.</h2>
        <div className="result-strip">
          <span>하루 순공시간 <strong>{mySurvey.studyHours}시간</strong></span>
          <span>평균 집중도 <strong>{mySurvey.focus}%</strong></span>
          <span>성적 만족도 <strong>{mySurvey.satisfaction}/10</strong></span>
        </div>
        <p className="rule-text">분류 기준: {style.rule}</p>
        <p>{isLoading ? "Gemini가 설문 결과를 분석하고 있습니다." : aiText}</p>
        {!geminiApiKey && <p className="api-note">VITE_GEMINI_API_KEY가 없어서 기본 분석 문장으로 표시 중입니다.</p>}
      </div>
      <div className="ai-comment-card">
        <span>Gemini AI 코멘트</span>
        <p>{isLoading ? "맞춤 공부 코멘트를 작성하고 있습니다." : aiComment}</p>
      </div>
      <StyleDetail style={style} />
      <div className="similar-panel">
        <span>비슷한 학생들의 평균 데이터</span>
        <div className="metrics compact">
          <Metric label="평균 순공시간" value={`${rounded(average(similar.map((item) => item.studyHours)))}h`} />
          <Metric label="평균 집중도" value={`${rounded(average(similar.map((item) => item.focus)))}%`} />
          <Metric label="평균 만족도" value={`${rounded(average(similar.map((item) => item.satisfaction)))}/10`} />
        </div>
      </div>
    </div>
  );
}

function MethodsView({
  selectedStyleId,
  setSelectedStyleId,
  selectedStyle,
}: {
  selectedStyleId: StudyStyleId;
  setSelectedStyleId: React.Dispatch<React.SetStateAction<StudyStyleId>>;
  selectedStyle: StudyStyle;
}) {
  return (
    <div className="stack-view">
      <ViewTitle code="05 / METHODS" title="공부법 추천" desc="원하는 스타일을 눌러 특징, 장점, 주의할 점, 추천 루틴을 확인하세요." />
      <div className="style-tabs">
        {styles.map((style) => (
          <button key={style.id} className={selectedStyleId === style.id ? "active" : ""} onClick={() => setSelectedStyleId(style.id)}>
            <span>{style.icon}</span>
            {style.title}
          </button>
        ))}
      </div>
      <StyleDetail style={selectedStyle} />
    </div>
  );
}

function MineView({
  mySurvey,
  data,
  allStats,
  similar,
  setActiveTab,
}: {
  mySurvey: Survey | null;
  data: Survey[];
  allStats: ReturnType<typeof makeStats>;
  similar: Survey[];
  setActiveTab: React.Dispatch<React.SetStateAction<TabId>>;
}) {
  if (!mySurvey) {
    return (
      <div className="empty-state">
        <ViewTitle code="06 / MY" title="내 분석" desc="설문을 제출하면 개인 결과와 전체 평균 비교가 표시됩니다." />
        <button className="primary-action" onClick={() => setActiveTab("survey")}>
          설문하러 가기
          <ChevronRight size={18} />
        </button>
      </div>
    );
  }

  const style = classifyStyle(mySurvey);
  const hourRank = percentile(mySurvey.studyHours, data.map((item) => item.studyHours));
  const focusRank = percentile(mySurvey.focus, data.map((item) => item.focus));
  const satRank = percentile(mySurvey.satisfaction, data.map((item) => item.satisfaction));

  return (
    <div className="stack-view">
      <ViewTitle code="06 / MY" title="내 분석" desc="나의 결과를 전체 평균과 비슷한 학생 그룹에 비교합니다." />
      <div className="analysis-card">
        <span className="style-badge">{style.icon} {style.title}</span>
        <div className="comparison-grid">
          <Compare label="내 순공시간 vs 전체 평균" mine={`${mySurvey.studyHours}h`} average={`${allStats.avgHours}h`} rank={`상위 ${100 - hourRank}%`} />
          <Compare label="내 집중도 vs 전체 평균" mine={`${mySurvey.focus}%`} average={`${allStats.avgFocus}%`} rank={`상위 ${100 - focusRank}%`} />
          <Compare label="내 성적 만족도 vs 전체 평균" mine={`${mySurvey.satisfaction}/10`} average={`${allStats.avgSatisfaction}/10`} rank={`상위 ${100 - satRank}%`} />
        </div>
      </div>
      <div className="similar-panel">
        <span>나와 가장 비슷한 학생들</span>
        <div className="student-list">
          {similar.map((item) => (
            <div key={item.id}>
              <strong>{item.grade}학년</strong>
              <span>{item.studyHours}h · 집중도 {item.focus}% · 만족도 {item.satisfaction}/10</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ViewTitle({ code, title, desc }: { code: string; title: string; desc: string }) {
  return (
    <div className="view-title">
      <span className="section-code">{code}</span>
      <h1>{title}</h1>
      <p>{desc}</p>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function ChartPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="chart-panel">
      <span>{title}</span>
      {children}
    </div>
  );
}

function DistributionPanel({ title, data }: { title: string; data: Array<{ label: string; count: number }> }) {
  return (
    <ChartPanel title={title}>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce4e7" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#078c83" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

function ScatterPanel({ title, data, x, y }: { title: string; data: Array<{ x: number; y: number }>; x: string; y: string }) {
  return (
    <ChartPanel title={title}>
      <ResponsiveContainer width="100%" height={210}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#dce4e7" />
          <XAxis type="number" dataKey="x" name={x} tick={{ fontSize: 11 }} />
          <YAxis type="number" dataKey="y" name={y} tick={{ fontSize: 11 }} />
          <Tooltip cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={data} fill="#10171b" />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartPanel>
  );
}

function StyleDetail({ style }: { style: StudyStyle }) {
  return (
    <div className="style-detail">
      <div className="style-hero">
        <span>{style.icon}</span>
        <div>
          <h2>{style.title}</h2>
          <p>{style.english}</p>
          <small>{style.rule}</small>
        </div>
      </div>
      <DetailColumn title="특징" items={style.features} />
      <DetailColumn title="장점" items={style.strengths} />
      <DetailColumn title="주의할 점" items={style.cautions} />
      <DetailColumn title="추천 공부법" items={style.methods} />
      <DetailColumn title="추천 루틴" items={style.routine} />
    </div>
  );
}

function DetailColumn({ title, items }: { title: string; items: string[] }) {
  return (
    <section>
      <h3>{title}</h3>
      {items.map((item) => (
        <p key={item}>{item}</p>
      ))}
    </section>
  );
}

function Compare({ label, mine, average, rank }: { label: string; mine: string; average: string; rank: string }) {
  return (
    <div className="compare">
      <span>{label}</span>
      <strong>{mine}</strong>
      <p>전체 평균 {average}</p>
      <em>{rank}</em>
    </div>
  );
}

const rootElement = document.getElementById("root")!;
const globalRoot = window as typeof window & {
  __studyAiRoot?: ReturnType<typeof ReactDOM.createRoot>;
};

globalRoot.__studyAiRoot ??= ReactDOM.createRoot(rootElement);
globalRoot.__studyAiRoot.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
