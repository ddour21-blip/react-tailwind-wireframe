import React, { useMemo, useState } from "react";

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors duration-150 ${
      active
        ? "bg-indigo-600 text-white border-indigo-600 shadow"
        : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

const SectionCard = ({ title, description, actions, children }) => (
  <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">
    <header className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500">{title}</p>
        {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
      </div>
      {actions}
    </header>
    <div className="p-6 space-y-4">{children}</div>
  </section>
);

const StatusBadge = ({ status }) => {
  const palette = {
    success: "bg-emerald-100 text-emerald-700 border-emerald-200",
    running: "bg-indigo-100 text-indigo-700 border-indigo-200",
    waiting: "bg-gray-100 text-gray-600 border-gray-200",
    failed: "bg-red-100 text-red-700 border-red-200",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
        palette[status]
      }`}
    >
      <span
        className={`h-2 w-2 rounded-full ${
          status === "success"
            ? "bg-emerald-500"
            : status === "running"
            ? "bg-indigo-500"
            : status === "failed"
            ? "bg-red-500"
            : "bg-gray-400"
        }`}
      />
      {status === "success" && "성공"}
      {status === "running" && "진행 중"}
      {status === "waiting" && "대기"}
      {status === "failed" && "실패"}
    </span>
  );
};

const scenarioBlueprint = [
  {
    key: "upload",
    title: "업로드",
    description: "테스트 대상 URL과 기획서를 받아 분석을 시작합니다.",
    steps: [
      {
        action: "테스트할 웹사이트 URL을 입력하고 유효성 검사를 통과한다.",
        validation: "HTTP 200 응답 및 리다이렉션 확인",
        evidence: "접속 직후 스크린샷 / 콘솔 로그",
      },
      {
        action: "기획서 파일을 드래그 앤 드롭하여 업로드한다.",
        validation: "파일 해시 저장 및 분석 대기열 등록",
        evidence: "업로드 완료 토스트 메시지",
      },
      {
        action: "LLM 분석 옵션과 브라우저 타입(Playwright/Selenium)을 선택한다.",
        validation: "선택 항목이 세션 설정에 반영",
        evidence: "설정 요약 패널",
      },
    ],
  },
  {
    key: "notification",
    title: "알림 설정",
    description: "변경 사항이 감지될 경우 받을 알림 경로를 지정합니다.",
    steps: [
      {
        action: "테스트 대상 페이지에서 로그인 필요 여부를 자동 감지한다.",
        validation: "401/302 응답 시 로그인 시나리오 분기",
        evidence: "로그인 시도 로그",
      },
      {
        action: "로그인 정보를 이용해 세션을 생성하고 알림 채널(Email/Slack)을 설정한다.",
        validation: "OAuth 또는 폼 로그인 성공",
        evidence: "알림 구독 확인 토스트",
      },
      {
        action: "테스트 실패 시 재실행 및 담당자 알림 정책을 지정한다.",
        validation: "재시도 정책 저장",
        evidence: "정책 저장 이벤트",
      },
    ],
  },
  {
    key: "edit",
    title: "편집",
    description: "기획서에서 추출한 QA 시나리오를 검토하고 수정합니다.",
    steps: [
      {
        action: "LLM이 추출한 테스트 케이스를 페이지 섹션별로 정렬한다.",
        validation: "섹션 맵핑(업로드/알림 설정/편집/템플릿 선택) 확인",
        evidence: "시나리오 미리보기",
      },
      {
        action: "테스트 단계별 예상 결과 및 검증 포인트를 편집한다.",
        validation: "수정 내용이 버전 히스토리에 저장",
        evidence: "버전 태그",
      },
      {
        action: "테스트 데이터(샘플 계정, 입력값)를 주입한다.",
        validation: "민감정보 암호화 저장",
        evidence: "환경 변수 요약",
      },
    ],
  },
  {
    key: "template",
    title: "템플릿 선택",
    description: "브라우저 자동화 엔진에서 사용할 실행 템플릿을 결정합니다.",
    steps: [
      {
        action: "Playwright E2E, Selenium, API 연동 중 템플릿을 선택한다.",
        validation: "선택한 템플릿이 실행 계획에 반영",
        evidence: "테스트 계획 미리보기",
      },
      {
        action: "선택된 템플릿에 맞춰 스텁/훅을 자동 생성한다.",
        validation: "테스트 코드 생성 후 lint 통과",
        evidence: "생성된 코드 스니펫",
      },
      {
        action: "실행 전에 환경 변수를 주입하고 시뮬레이션을 사전 검증한다.",
        validation: "사전 검증 성공",
        evidence: "Dry-run 리포트",
      },
    ],
  },
];

const runnerStatuses = [
  {
    title: "사전 검증",
    status: "success",
    summary: "URL 진입 및 로그인 세션 확보",
    duration: "00:00:12",
  },
  {
    title: "업로드 시나리오 실행",
    status: "running",
    summary: "파일 업로드 후 파싱 결과 비교 중",
    duration: "00:00:32",
  },
  {
    title: "알림 설정 검증",
    status: "waiting",
    summary: "알림 채널 목업 대기",
    duration: "-",
  },
  {
    title: "편집/템플릿 동기화",
    status: "waiting",
    summary: "Playwright 스크립트 생성 예정",
    duration: "-",
  },
];

const historyItems = [
  {
    id: "RUN-2024-0420-01",
    url: "https://staging.xr-project.io",
    result: "success",
    duration: "3m 24s",
    createdAt: "2024-04-20 11:32",
  },
  {
    id: "RUN-2024-0418-07",
    url: "https://dev.xr-project.io",
    result: "failed",
    duration: "2m 02s",
    createdAt: "2024-04-18 19:20",
  },
  {
    id: "RUN-2024-0415-02",
    url: "https://staging.xr-project.io",
    result: "success",
    duration: "4m 11s",
    createdAt: "2024-04-15 09:48",
  },
];

const automationSnippet = `import { test, expect } from '@playwright/test';

test.describe('업로드 > 알림 설정 > 편집 > 템플릿 선택', () => {
  test('기획서 기반 시나리오', async ({ page }) => {
    await page.goto(process.env.TARGET_URL);

    if (await page.locator('text="로그인"').first().isVisible()) {
      await page.fill('#email', process.env.LOGIN_ID);
      await page.fill('#password', process.env.LOGIN_PW);
      await page.click('button:has-text("로그인")');
      await expect(page).toHaveURL(/dashboard/);
    }

    await page.click('[data-test="upload-tab"]');
    await page.setInputFiles('input[type=file]', 'spec.pdf');
    await expect(page.locator('[data-test="upload-toast"]')).toHaveText('업로드 완료');

    await page.click('[data-test="notification-tab"]');
    await expect(page.locator('[data-test="slack-toggle"]')).toBeChecked();

    await page.click('[data-test="edit-tab"]');
    await expect(page.locator('h1')).toContainText('시나리오 편집');

    await page.click('[data-test="template-tab"]');
    await expect(page.locator('[data-test="runner-ready"]')).toBeVisible();
  });
});`;

const createShareSlug = (seed) => {
  let hash = 0;
  const normalized = seed.replace(/\s+/g, "").toLowerCase();
  for (let index = 0; index < normalized.length; index += 1) {
    hash = (hash << 5) - hash + normalized.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(8, "0");
};

export default function App() {
  const [activeTab, setActiveTab] = useState("run");
  const [url, setUrl] = useState("https://staging.xr-project.io");
  const [fileName, setFileName] = useState("XR-플랫폼-신규기능-기획서.pdf");
  const [loginRequired, setLoginRequired] = useState(true);
  const [selectedEngine, setSelectedEngine] = useState("playwright");
  const [selectedLLM, setSelectedLLM] = useState("openai");
  const [copyStatus, setCopyStatus] = useState("idle");

  const activeScenario = useMemo(() => scenarioBlueprint, []);
  const shareSlug = useMemo(
    () =>
      createShareSlug(
        [url, fileName, selectedEngine, selectedLLM, loginRequired ? "login" : "nologin"].join("|"),
      ),
    [fileName, loginRequired, selectedEngine, selectedLLM, url],
  );

  const shareUrl = useMemo(() => {
    const fallbackOrigin = "https://qa-auto.preview";
    const origin = typeof window !== "undefined" && window.location.origin ? window.location.origin : fallbackOrigin;
    return `${origin.replace(/\/$/, "")}/app/${shareSlug}`;
  }, [shareSlug]);

  const shareReady = Boolean(url && fileName);

  const handleCopyShareUrl = async () => {
    if (!shareUrl) {
      return;
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else if (typeof document !== "undefined") {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopyStatus("copied");
    } catch (error) {
      console.error("URL copy failed", error);
      setCopyStatus("failed");
    } finally {
      setTimeout(() => setCopyStatus("idle"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-2">
          <p className="text-xs font-semibold text-indigo-500 uppercase tracking-[0.3em]">
            QA Automation Control Center
          </p>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">기획서 기반 QA 자동화 시스템</h1>
              <p className="text-sm text-gray-500">
                업로드 &gt; 알림 설정 &gt; 편집 &gt; 템플릿 선택 흐름을 기준으로 브라우저 자동화를 설정하고 실행합니다.
              </p>
            </div>
            <div className="flex gap-2">
              <TabButton active={activeTab === "run"} onClick={() => setActiveTab("run")}>
                테스트 실행
              </TabButton>
              <TabButton active={activeTab === "analysis"} onClick={() => setActiveTab("analysis")}>
                결과 분석
              </TabButton>
              <TabButton active={activeTab === "history"} onClick={() => setActiveTab("history")}>
                히스토리
              </TabButton>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {activeTab === "run" && (
          <div className="space-y-8">
            <SectionCard
              title="테스트 환경 설정"
              description="웹사이트 접근, 로그인, 기획서 업로드, 분석 엔진 선택을 설정합니다."
              actions={<StatusBadge status="running" />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2 text-sm font-medium">
                  테스트할 웹사이트 URL
                  <input
                    className="rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://"
                  />
                  <span className="text-xs font-normal text-gray-500">
                    입력 즉시 유효성 검사를 수행하고 HTTP 상태를 확인합니다.
                  </span>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium">
                  기획서 파일 업로드
                  <div className="relative flex items-center gap-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm">
                    <div className="flex-1 truncate text-gray-700">{fileName}</div>
                    <button className="rounded-full border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-white">
                      파일 선택
                    </button>
                    <input
                      type="file"
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) {
                          setFileName(file.name);
                        }
                      }}
                    />
                  </div>
                  <span className="text-xs font-normal text-gray-500">
                    PDF / Markdown / 텍스트를 지원하며 업로드 후 LLM 분석을 실행합니다.
                  </span>
                </label>
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-medium">로그인 &amp; 접근 제어</span>
                  <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold">로그인이 필요한 페이지</p>
                      <p className="text-xs text-gray-500">자동 로그인 후 보호된 화면을 테스트합니다.</p>
                    </div>
                    <button
                      onClick={() => setLoginRequired((prev) => !prev)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        loginRequired ? "bg-indigo-500" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          loginRequired ? "translate-x-5" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                  {loginRequired && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        className="rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        placeholder="로그인 이메일"
                        defaultValue="qa.tester@xr-project.io"
                      />
                      <input
                        className="rounded-2xl border border-gray-200 px-4 py-2 text-sm focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        placeholder="비밀번호"
                        type="password"
                        defaultValue="••••••••"
                      />
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-medium">AI 분석 &amp; 실행 엔진</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold text-gray-500">LLM Provider</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {[
                          { key: "openai", label: "OpenAI GPT" },
                          { key: "gemini", label: "Google Gemini" },
                        ].map((item) => (
                          <button
                            key={item.key}
                            onClick={() => setSelectedLLM(item.key)}
                            className={`rounded-full border px-3 py-1 font-semibold transition ${
                              selectedLLM === item.key
                                ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                                : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="text-xs font-semibold text-gray-500">Test Runner</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        {[
                          { key: "playwright", label: "Playwright" },
                          { key: "selenium", label: "Selenium" },
                        ].map((item) => (
                          <button
                            key={item.key}
                            onClick={() => setSelectedEngine(item.key)}
                            className={`rounded-full border px-3 py-1 font-semibold transition ${
                              selectedEngine === item.key
                                ? "border-indigo-500 bg-indigo-50 text-indigo-600"
                                : "border-gray-200 bg-gray-50 text-gray-500 hover:border-gray-300"
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-dashed border-indigo-200 bg-indigo-50 p-4 text-xs text-indigo-700">
                    {selectedLLM === "openai" ? "OpenAI GPT" : "Google Gemini"} 기반으로 기획서를 분석한 뒤, {" "}
                    {selectedEngine === "playwright" ? "Playwright" : "Selenium"} 템플릿으로 테스트 코드를 생성합니다.
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="기획서 기반 QA 시나리오"
              description="업로드 &gt; 알림 설정 &gt; 편집 &gt; 템플릿 선택 플로우를 기준으로 자동 생성된 단계입니다."
            >
              <div className="grid grid-cols-1 gap-6">
                {activeScenario.map((group) => (
                  <div key={group.key} className="rounded-3xl border border-gray-200 bg-gray-50">
                    <div className="flex flex-col gap-2 border-b border-gray-200 p-6 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-indigo-500 uppercase tracking-wide">
                          {group.title}
                        </p>
                        <p className="text-base font-bold text-gray-800">{group.description}</p>
                      </div>
                      <span className="text-xs text-gray-500">시나리오 단계 {group.steps.length}개</span>
                    </div>
                    <ol className="space-y-4 p-6">
                      {group.steps.map((step, index) => (
                        <li
                          key={step.action}
                          className="rounded-2xl border border-white bg-white p-4 shadow-sm transition hover:border-indigo-200"
                        >
                          <div className="flex items-start gap-4">
                            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                              {index + 1}
                            </span>
                            <div className="space-y-2">
                              <p className="text-sm font-semibold text-gray-800">{step.action}</p>
                              <div className="grid gap-2 text-xs text-gray-500 md:grid-cols-2">
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                                  <p className="font-semibold text-gray-600">검증 기준</p>
                                  <p className="mt-1 leading-5 text-gray-500">{step.validation}</p>
                                </div>
                                <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                                  <p className="font-semibold text-gray-600">증빙</p>
                                  <p className="mt-1 leading-5 text-gray-500">{step.evidence}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="브라우저 자동화 실행 상태"
              description="실시간으로 테스트 런너의 진행 현황과 각 스텝의 결과를 추적합니다."
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {runnerStatuses.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">{item.summary}</p>
                      <p className="mt-3 text-xs text-gray-400">소요 시간: {item.duration}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-gray-50 p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
                      자동 생성된 Playwright 템플릿
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      기획서 분석 결과를 바탕으로 생성된 테스트 코드 스니펫입니다. 실행 전 편집이 가능합니다.
                    </p>
                  </div>
                  <pre className="flex-1 overflow-auto rounded-2xl border border-gray-200 bg-slate-900 p-4 text-[11px] leading-relaxed text-slate-100">
                    <code>{automationSnippet}</code>
                  </pre>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-indigo-100 px-3 py-1 font-semibold text-indigo-600">
                      LLM 파싱 완료
                    </span>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-600">
                      로그인 세션 확보
                    </span>
                    <span className="rounded-full bg-gray-200 px-3 py-1 font-semibold text-gray-600">
                      Dry-run 대기
                    </span>
                  </div>
                </div>
              </div>
            </SectionCard>
            <SectionCard
              title="최종 공유 URL 생성"
              description="설정한 정보를 바탕으로 QA 자동화 워크스페이스를 공유할 수 있는 링크를 발행합니다."
              actions={<StatusBadge status={shareReady ? "success" : "waiting"} />}
            >
              <div className="space-y-4">
                <div className="rounded-3xl border border-indigo-100 bg-indigo-50 p-5 text-sm text-indigo-700">
                  아래 링크는 현재 설정(접속 URL, 로그인 정책, LLM/Runner 선택)을 기준으로 생성된 고유 식별자와 함께
                  제공됩니다. 공유 받은 사람은 mgx 스타일의 고정 URL(
                  <span className="font-mono text-[11px] text-indigo-600">/app/{shareSlug}</span>
                  )로 바로 접속해 QA 자동화를 실행할 수 있습니다.
                </div>
                <div className="flex flex-col gap-2 text-sm">
                  <span className="font-semibold text-gray-700">공유 URL</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <a
                      href={shareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="max-w-full truncate rounded-2xl border border-gray-200 bg-white px-4 py-2 font-mono text-xs text-indigo-600 shadow-sm hover:border-indigo-300"
                    >
                      {shareUrl}
                    </a>
                    <button
                      onClick={handleCopyShareUrl}
                      className={`rounded-full px-4 py-2 text-xs font-semibold shadow-sm transition ${
                        copyStatus === "copied"
                          ? "bg-emerald-500 text-white"
                          : copyStatus === "failed"
                          ? "bg-red-500 text-white"
                          : "bg-indigo-600 text-white hover:bg-indigo-500"
                      }`}
                    >
                      {copyStatus === "copied" && "복사 완료"}
                      {copyStatus === "failed" && "복사 실패"}
                      {copyStatus === "idle" && "URL 복사"}
                    </button>
                  </div>
                </div>
                <div className="grid gap-4 md:grid-cols-3 text-xs text-gray-600">
                  {[
                    { label: "접속 URL", value: url || "-" },
                    { label: "기획서 파일", value: fileName || "-" },
                    { label: "실행 엔진", value: selectedEngine === "playwright" ? "Playwright" : "Selenium" },
                    { label: "LLM", value: selectedLLM === "openai" ? "OpenAI GPT" : "Google Gemini" },
                    { label: "로그인 처리", value: loginRequired ? "필수 (세션 선점)" : "불필요" },
                    { label: "생성된 ID", value: shareSlug },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-gray-200 bg-white p-4">
                      <p className="font-semibold text-gray-600">{item.label}</p>
                      <p className="mt-1 break-all font-mono text-[11px] text-gray-500">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-600">
                  <p className="font-semibold text-gray-700">배포 가이드</p>
                  <p className="mt-2 leading-5">
                    1) <code className="rounded bg-gray-100 px-1 py-0.5">npm run build</code>로 정적 번들을 생성합니다.
                    <br />2) 번들 출력(<code className="rounded bg-gray-100 px-1 py-0.5">dist/</code>)을 Static Hosting(MGX, Vercel,
                    Netlify 등)에 업로드합니다.
                    <br />3) 호스팅 도메인을 <span className="font-mono text-[11px] text-indigo-600">/app/{shareSlug}</span> 경로와 함께
                    공유하면, 위 링크와 동일한 QA 자동화 대시보드에 접속할 수 있습니다.
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "analysis" && (
          <div className="grid grid-cols-1 gap-8">
            <SectionCard
              title="실행 리포트 요약"
              description="테스트 성공률, 실패 지점, 알림 로그를 집계합니다."
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["성공률 92%", "실패 케이스 1건", "평균 소요 3m 08s"].map((metric) => (
                  <div key={metric} className="rounded-2xl border border-gray-200 bg-white p-4 text-sm font-semibold text-gray-600">
                    {metric}
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-dashed border-indigo-200 bg-indigo-50 p-6 text-sm text-indigo-700">
                업로드 &gt; 알림 설정 &gt; 편집 &gt; 템플릿 선택 단계에서 발견된 이슈를 기준으로 재실행 정책이 자동 반영되었습니다.
              </div>
            </SectionCard>
            <SectionCard title="세부 로그" description="브라우저 콘솔, 네트워크, DOM 스냅샷을 한눈에 확인합니다.">
              <div className="grid gap-4 text-xs text-gray-600">
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="font-semibold text-gray-700">🟢 업로드 단계</p>
                  <p className="mt-2 leading-5">
                    - 00:00:04 : URL 응답 200 확인
                    <br />- 00:00:07 : spec.pdf 업로드 성공 (SHA256 d39f...)
                    <br />- 00:00:09 : LLM 파싱 시작 (OpenAI GPT-4o)
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="font-semibold text-gray-700">🟡 알림 설정 단계</p>
                  <p className="mt-2 leading-5">
                    - 00:00:15 : 로그인 세션 재사용
                    <br />- 00:00:18 : Slack Webhook 검증 실패 &rarr; 재시도 성공
                  </p>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-4">
                  <p className="font-semibold text-gray-700">🟢 편집 / 템플릿 단계</p>
                  <p className="mt-2 leading-5">
                    - 00:00:26 : 시나리오 스텝 12건 정렬 완료
                    <br />- 00:00:32 : Playwright 템플릿 생성 및 lint 통과
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "history" && (
          <div className="space-y-8">
            <SectionCard
              title="실행 히스토리"
              description="과거 테스트 결과와 품질 추이를 추적합니다."
            >
              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 text-left">Run ID</th>
                      <th className="px-4 py-3 text-left">테스트 URL</th>
                      <th className="px-4 py-3 text-left">결과</th>
                      <th className="px-4 py-3 text-left">소요 시간</th>
                      <th className="px-4 py-3 text-left">실행 시각</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {historyItems.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/40">
                        <td className="px-4 py-3 font-mono text-xs text-indigo-600">{item.id}</td>
                        <td className="px-4 py-3 text-gray-600">{item.url}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={item.result === "success" ? "success" : "failed"} />
                        </td>
                        <td className="px-4 py-3 text-gray-500">{item.duration}</td>
                        <td className="px-4 py-3 text-gray-500">{item.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
            <SectionCard
              title="테스트 재실행"
              description="기존 기획서를 기반으로 신속하게 테스트를 다시 실행합니다."
            >
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-gray-500">
                  선택한 히스토리 실행을 복제하여 동일한 시나리오를 즉시 재실행합니다.
                </span>
                <button className="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-indigo-500">
                  RUN-2024-0420-01 재실행
                </button>
                <button className="rounded-full border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50">
                  결과 다운로드 (.zip)
                </button>
              </div>
            </SectionCard>
          </div>
        )}
      </main>
    </div>
  );
}
