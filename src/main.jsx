import React, { useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  AreaChart, Area, BarChart, Bar, CartesianGrid, Cell, ComposedChart,
  Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowRight, ArrowUpRight,
  BadgeCheck, Banknote, Bell, Boxes, BriefcaseBusiness, Calculator,
  Check, ChevronDown, CircleDollarSign, ClipboardCheck, Clock3, Download,
  Factory, FileCheck2, FileSpreadsheet, Gauge, HelpCircle, LayoutDashboard,
  Link2, Menu, MessageSquareText, PackageCheck, PanelLeftClose, Play,
  RefreshCw, Search, Settings, ShieldCheck, Sparkles, Target, TrendingUp,
  Upload, Users, WalletCards, X, Zap,
} from 'lucide-react';
import './styles.css';

const COLORS = {
  cyan: '#22d3ee',
  violet: '#8b5cf6',
  green: '#2dd4bf',
  amber: '#fbbf24',
  red: '#fb7185',
  blue: '#60a5fa',
};

const money = (value, digits = 1) => `${new Intl.NumberFormat('ru-RU', {
  maximumFractionDigits: digits,
}).format(value)} млн ₽`;

const navItems = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { id: 'statements', label: 'ДДС, ОПиУ, Баланс', icon: FileSpreadsheet, badge: '3' },
  { id: 'closing', label: 'Закрытие месяца', icon: ClipboardCheck, badge: '2' },
  { id: 'investment', label: 'Инвест-калькулятор', icon: Calculator },
  { id: 'working', label: 'Рабочий капитал', icon: WalletCards },
  { id: 'scenario', label: 'Сценарии', icon: TrendingUp },
];

const cashData = [
  { month: 'Апр', revenue: 118, cash: 23 },
  { month: 'Май', revenue: 126, cash: 21 },
  { month: 'Июн', revenue: 131, cash: 25 },
  { month: 'Июл', revenue: 137, cash: 19 },
  { month: 'Авг', revenue: 143, cash: 16 },
  { month: 'Сен', revenue: 151, cash: 13 },
];

const cashForecast = [
  { week: '01-07 сен', amount: 18.4 },
  { week: '08-14 сен', amount: 9.8 },
  { week: '15-21 сен', amount: -3.2 },
  { week: '22-28 сен', amount: 4.7 },
  { week: '29 сен-05 окт', amount: 12.1 },
];

const closingTasksInitial = [
  { id: 1, area: 'Склады & сырье', task: 'Списание материалов по производственным нормам и себестоимости', owner: 'Анна К.', status: 'done', date: '03 сен, 14:32' },
  { id: 2, area: 'Производство', task: 'Распределение косвенных и общецеховых расходов', owner: 'Олег М.', status: 'done', date: '04 сен, 10:15' },
  { id: 3, area: 'Взаиморасчеты', task: 'Контроль незакрытых авансов и отрицательных остатков', owner: 'Ирина П.', status: 'risk', date: 'Срок сегодня' },
  { id: 4, area: 'Финансы', task: 'Переоценка валютных остатков', owner: 'Мария С.', status: 'progress', date: 'В работе' },
  { id: 5, area: 'Финансы', task: 'Проверка сходимости ОПиУ и Баланса', owner: 'Мария С.', status: 'waiting', date: 'После п. 4' },
];

const validationRows = [
  { name: 'Отрицательные остатки запасов', detail: '2 позиции упаковки', state: 'error' },
  { name: 'Распределение затрат на себестоимость', detail: '100% распределено', state: 'ok' },
  { name: 'Сальдо транзитных счетов', detail: 'Счет 26.09: 184 тыс. ₽', state: 'warning' },
  { name: 'Незакрытые авансы поставщикам', detail: '7 документов', state: 'warning' },
  { name: 'Переоценка валютных остатков', detail: 'Выполняется', state: 'progress' },
];

const nwcData = [
  { month: 'Апр', dio: 82, dso: 42, dpo: 34, ccc: 90 },
  { month: 'Май', dio: 86, dso: 43, dpo: 35, ccc: 94 },
  { month: 'Июн', dio: 88, dso: 45, dpo: 33, ccc: 100 },
  { month: 'Июл', dio: 91, dso: 47, dpo: 34, ccc: 104 },
  { month: 'Авг', dio: 94, dso: 50, dpo: 35, ccc: 109 },
  { month: 'Сен', dio: 97, dso: 53, dpo: 36, ccc: 114 },
];

function StatusDot({ type = 'ok' }) {
  return <span className={`status-dot ${type}`} aria-hidden="true" />;
}

function Delta({ value, direction = 'up', negative = false }) {
  const Icon = direction === 'up' ? ArrowUpRight : ArrowDownRight;
  return <span className={`delta ${negative ? 'negative' : 'positive'}`}><Icon size={13} />{value}</span>;
}

function KpiCard({ icon: Icon, label, value, meta, delta, negative, tone = 'cyan', featured }) {
  return (
    <article className={`kpi-card ${featured ? 'animated-border' : ''}`}>
      <div className="kpi-top">
        <span className={`icon-box ${tone}`}><Icon size={18} /></span>
        <button className="icon-button tiny" aria-label={`Подробнее: ${label}`}><ArrowUpRight size={15} /></button>
      </div>
      <span className="eyebrow">{label}</span>
      <strong className="kpi-value">{value}</strong>
      <div className="kpi-meta">{delta && <Delta value={delta} negative={negative} direction={negative ? 'down' : 'up'} />}<span>{meta}</span></div>
    </article>
  );
}

function ChartTooltip({ active, payload, label, kind = 'money' }) {
  if (!active || !payload?.length) return null;
  const suffix = kind === 'money' ? ' млн ₽' : kind === 'days' ? ' дн.' : kind === 'years' ? ' года' : '';
  return (
    <div className="chart-tooltip">
      <span>{label}</span>
      {payload.map((item) => <b key={item.dataKey} style={{ color: item.color }}>{item.name}: {item.value}{suffix}</b>)}
    </div>
  );
}

function Topbar({ title, onUpload, onMenu }) {
  const fileRef = useRef(null);
  return (
    <header className="topbar">
      <div className="topbar-title">
        <button className="icon-button menu-button" onClick={onMenu} aria-label="Открыть меню"><Menu size={20} /></button>
        <div><span className="breadcrumb">FinPulse / {title}</span><h1>{title}</h1></div>
      </div>
      <div className="top-actions">
        <label className="period-select">Период<select defaultValue="sep"><option value="sep">Сентябрь 2026</option><option value="aug">Август 2026</option></select><ChevronDown size={14} /></label>
        <input ref={fileRef} className="sr-only" type="file" accept=".xlsx,.xls,.csv,.json" onChange={(e) => e.target.files[0] && onUpload(e.target.files[0])} />
        <button className="button secondary" onClick={() => fileRef.current?.click()}><Upload size={16} />Загрузить из 1С</button>
        <button className="icon-button notification" aria-label="Уведомления"><Bell size={18} /><i /></button>
        <div className="avatar">АК</div>
      </div>
    </header>
  );
}

function Sidebar({ active, setActive, open, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand"><span className="brand-mark"><Activity size={22} /></span><div><b>FINPULSE</b><small>PHARMA CONTROL</small></div></div>
      <nav>
        <span className="nav-section">Рабочее пространство</span>
        {navItems.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} className={`nav-item ${active === id ? 'active' : ''}`} onClick={() => { setActive(id); onClose(); }}>
            <Icon size={18} /><span>{label}</span>{badge && <em>{badge}</em>}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sync-card"><div><StatusDot /><b>1С подключена</b></div><span>Синхронизация: 5 мин назад</span><div className="sync-line"><i /></div></div>
        <button className="nav-item"><Settings size={18} /><span>Настройки</span></button>
        <button className="nav-item"><HelpCircle size={18} /><span>Помощь</span></button>
      </div>
    </aside>
  );
}

function AiSummary() {
  return (
    <section className="ai-panel animated-border">
      <div className="ai-head"><span className="ai-orb"><Sparkles size={19} /></span><div><b>Финансовый консультант</b><span>Анализ трех отчетов завершен</span></div><span className="live-badge"><i /> активен</span></div>
      <h2>Главный вывод за сентябрь</h2>
      <p>Выручка растет, но качество денежного потока ухудшается. Дебиторская задолженность увеличилась на 18%, а операционный денежный поток снизился на 12%. При текущем графике платежей прогнозируется кассовый разрыв <b>3,2 млн ₽</b> на третьей неделе сентября.</p>
      <div className="ai-alert"><AlertTriangle size={18} /><div><b>Требует внимания</b><span>Согласовать перенос платежа поставщику «ФармСубстанция» на 4,8 млн ₽ или ускорить сбор дебиторки по трем крупнейшим клиентам.</span></div></div>
      <div className="ai-actions"><button className="button primary"><MessageSquareText size={16} />Задать вопрос</button><button className="button ghost"><Download size={16} />Скачать резюме</button></div>
    </section>
  );
}

function Overview({ onNavigate }) {
  return (
    <div className="page-stack">
      <section className="intro-row"><div><div className="status-line"><StatusDot />Данные актуальны на 05.09.2026, 09:42</div><h2>Финансовый пульс компании</h2><p>Ключевые показатели, риски и статус закрытия периода в одном окне.</p></div><button className="button primary" onClick={() => onNavigate('statements')}><Zap size={16} />Запустить анализ</button></section>
      <div className="kpi-grid">
        <KpiCard icon={CircleDollarSign} label="Выручка с начала года" value="1 284,6 млн ₽" delta="8,4%" meta="к плану" tone="cyan" featured />
        <KpiCard icon={TrendingUp} label="Прибыль до процентов, налогов и амортизации" value="214,8 млн ₽" delta="2,1%" meta="к прошлому году" tone="violet" />
        <KpiCard icon={WalletCards} label="Операционный денежный поток" value="48,2 млн ₽" delta="12,0%" meta="к августу" negative tone="amber" />
        <KpiCard icon={Gauge} label="Финансовый цикл" value="114 дней" delta="5 дней" meta="хуже нормы" negative tone="red" />
      </div>
      <div className="overview-grid">
        <section className="panel cash-chart-panel">
          <div className="panel-head"><div><span className="eyebrow">ДИНАМИКА</span><h3>Выручка и операционный денежный поток</h3></div><div className="chart-legend"><span><i className="cyan" />Выручка</span><span><i className="violet" />Денежный поток</span></div></div>
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height="100%"><ComposedChart data={cashData} margin={{ top: 12, right: 8, left: -14, bottom: 0 }}><defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COLORS.cyan} stopOpacity={0.28}/><stop offset="1" stopColor={COLORS.cyan} stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(148,163,184,.12)"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7f8ba3', fontSize: 14.6 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: '#7f8ba3', fontSize: 14.6 }}/><Tooltip content={<ChartTooltip />}/><Area type="monotone" dataKey="revenue" name="Выручка" stroke={COLORS.cyan} strokeWidth={2} fill="url(#rev)"/><Line type="monotone" dataKey="cash" name="Денежный поток" stroke={COLORS.violet} strokeWidth={2.5} dot={{ r: 3, fill: COLORS.violet, strokeWidth: 0 }}/></ComposedChart></ResponsiveContainer>
          </div>
        </section>
        <AiSummary />
      </div>
      <div className="bottom-grid">
        <section className="panel closing-widget">
          <div className="panel-head"><div><span className="eyebrow">ЗАКРЫТИЕ СЕНТЯБРЯ</span><h3>Готовность периода</h3></div><button className="text-button" onClick={() => onNavigate('closing')}>Подробнее <ArrowRight size={14} /></button></div>
          <div className="progress-head"><strong>67%</strong><span>4 из 6 участков завершено</span></div><div className="progress-bar"><i style={{ width: '67%' }} /></div>
          <div className="mini-tasks"><div><span className="check-icon done"><Check size={13}/></span><p><b>Склады & сырье</b><span>Завершено</span></p></div><div><span className="check-icon risk"><AlertTriangle size={13}/></span><p><b>Взаиморасчеты</b><span>2 ошибки требуют внимания</span></p></div><div><span className="check-icon wait"><Clock3 size={13}/></span><p><b>Финансы</b><span>Ожидает</span></p></div></div>
        </section>
        <section className="panel forecast-widget">
          <div className="panel-head"><div><span className="eyebrow">ПРОГНОЗ ЛИКВИДНОСТИ</span><h3>Остаток денежных средств</h3></div><span className="danger-tag">Риск разрыва</span></div>
          <div className="forecast-chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={cashForecast} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><defs><linearGradient id="cashgrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={COLORS.green} stopOpacity={0.25}/><stop offset="1" stopColor={COLORS.red} stopOpacity={0.03}/></linearGradient></defs><CartesianGrid vertical={false} stroke="rgba(148,163,184,.1)"/><XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fill: '#7f8ba3', fontSize: 12.5 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: '#7f8ba3', fontSize: 13.6 }}/><ReferenceLine y={0} stroke={COLORS.red} strokeDasharray="4 4"/><Tooltip content={<ChartTooltip />}/><Area type="monotone" dataKey="amount" name="Остаток" stroke={COLORS.green} strokeWidth={2.5} fill="url(#cashgrad)" dot={(props) => { const { cx, cy, payload } = props; return <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={payload.amount < 0 ? 5 : 3} fill={payload.amount < 0 ? COLORS.red : COLORS.green}/>; }}/></AreaChart></ResponsiveContainer></div>
        </section>
      </div>
    </div>
  );
}

function Statements() {
  const [activeReport, setActiveReport] = useState('cashflow');
  const reports = [
    {
      id: 'cashflow', title: 'ДДС', subtitle: 'Движение денег', color: COLORS.green,
      metrics: [['Остаток денег', '126,8 млн ₽'], ['Поступления', '151,2 млн ₽'], ['Операционный поток', '48,2 млн ₽']],
      relation: 'Конечный остаток 126,8 млн ₽ совпадает со строкой «Денежные средства» в Балансе.', ok: true,
    },
    {
      id: 'profit', title: 'ОПиУ', subtitle: 'Доходы, расходы и прибыль', color: COLORS.cyan,
      metrics: [['Выручка', '151,0 млн ₽'], ['Валовая прибыль', '72,5 млн ₽'], ['Чистая прибыль', '38,4 млн ₽']],
      relation: 'Чистая прибыль 38,4 млн ₽ должна увеличить нераспределенную прибыль в Балансе.', ok: true,
    },
    {
      id: 'balance', title: 'Баланс', subtitle: 'Имущество и источники средств', color: COLORS.violet,
      metrics: [['Активы', '846,2 млн ₽'], ['Обязательства', '412,7 млн ₽'], ['Собственный капитал', '433,5 млн ₽']],
      relation: 'Активы равны сумме обязательств и собственного капитала. Расхождений нет.', ok: true,
    },
  ];
  const reportTables = {
    cashflow: [
      ['Деньги от основной деятельности', '48,2 млн ₽', '54,8 млн ₽', '-12,0%', 'Денег от основной деятельности стало меньше, несмотря на рост продаж.'],
      ['Поступления от покупателей', '132,4 млн ₽', '128,1 млн ₽', '+3,4%', 'Поступления растут медленнее выручки. Часть денег остается у покупателей.'],
      ['Платежи поставщикам', '69,7 млн ₽', '61,2 млн ₽', '+13,9%', 'Расходы поставщикам растут быстрее поступлений от покупателей.'],
      ['Покупка оборудования', '21,5 млн ₽', '8,0 млн ₽', '+168,8%', 'Крупная выплата по производственной линии снижает запас денег.'],
      ['Конечный остаток денег', '126,8 млн ₽', '114,1 млн ₽', '+11,1%', 'Общий остаток положительный, но внутри месяца ожидается временный дефицит.'],
    ],
    profit: [
      ['Выручка', '151,0 млн ₽', '142,2 млн ₽', '+6,2%', 'Продажи растут, план месяца выполнен на 98%.'],
      ['Себестоимость продукции', '78,5 млн ₽', '70,1 млн ₽', '+12,0%', 'Себестоимость растет почти вдвое быстрее выручки.'],
      ['Валовая прибыль', '72,5 млн ₽', '72,1 млн ₽', '+0,6%', 'Рост продаж почти не увеличил валовую прибыль.'],
      ['Коммерческие и управленческие расходы', '25,9 млн ₽', '23,4 млн ₽', '+10,7%', 'Расходы выше темпа роста выручки, требуется детализация.'],
      ['Чистая прибыль', '38,4 млн ₽', '40,2 млн ₽', '-4,5%', 'Компания продает больше, но зарабатывает меньше на каждом рубле выручки.'],
    ],
    balance: [
      ['Денежные средства', '126,8 млн ₽', '114,1 млн ₽', '+11,1%', 'Значение совпадает с конечным остатком в ДДС.'],
      ['Долги покупателей', '184,6 млн ₽', '156,4 млн ₽', '+18,0%', 'Покупатели стали дольше оплачивать поставки. Это главный риск для ликвидности.'],
      ['Запасы', '213,7 млн ₽', '199,6 млн ₽', '+7,1%', 'Запасы растут быстрее продаж. В сырье заморожены лишние деньги.'],
      ['Долги поставщикам', '98,2 млн ₽', '94,7 млн ₽', '+3,7%', 'Отсрочка поставщиков почти не компенсирует рост долгов покупателей.'],
      ['Нераспределенная прибыль', '286,9 млн ₽', '248,5 млн ₽', '+15,5%', 'Рост на 38,4 млн ₽ совпадает с чистой прибылью в ОПиУ.'],
    ],
  };
  const selected = reports.find(report => report.id === activeReport);
  return (
    <div className="page-stack">
      <section className="section-heading"><div><span className="eyebrow">АВТОМАТИЧЕСКАЯ СВЕРКА</span><h2>ДДС, ОПиУ и Баланс</h2><p>Три отчета показывают, сколько компания зарабатывает, где находятся деньги и за счет чего сформировано имущество.</p></div><button className="button primary"><RefreshCw size={16}/>Обновить расчеты</button></section>
      <div className="report-strip detailed">
        {reports.map(report => <button key={report.id} className={`report-card detailed-card ${activeReport === report.id ? 'selected' : ''}`} onClick={() => setActiveReport(report.id)}>
          <div className="report-card-title"><span className="report-icon" style={{color: report.color}}><FileSpreadsheet size={20}/></span><div><b>{report.title}</b><span>{report.subtitle}</span></div><span className="status-chip done"><Check size={11}/>сходится</span></div>
          <div className="report-metrics">{report.metrics.map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}</div>
          <div className="report-relation"><Link2 size={15}/><span>{report.relation}</span></div>
        </button>)}
      </div>
      <section className="panel statement-table-panel animated-border">
        <div className="statement-tabs" role="tablist" aria-label="Выбор финансового отчета">{reports.map(report => <button key={report.id} role="tab" aria-selected={activeReport === report.id} className={activeReport === report.id ? 'active' : ''} onClick={() => setActiveReport(report.id)}>{report.title}<small>{report.subtitle}</small></button>)}</div>
        <div className="statement-table-title"><div><span className="eyebrow">ДЕТАЛИЗАЦИЯ ПО СТРОКАМ</span><h3>{selected.title}: {selected.subtitle.toLowerCase()}</h3></div><span className="period-note">Сентябрь 2026 к августу 2026</span></div>
        <div className="statement-table-wrap"><table className="statement-table"><thead><tr><th>Строка отчета</th><th>Сентябрь</th><th>Август</th><th>Изменение</th><th>Краткий вывод для собственника</th></tr></thead><tbody>{reportTables[activeReport].map(([name,current,previous,change,conclusion]) => <tr key={name}><td>{name}</td><td>{current}</td><td>{previous}</td><td className={change.startsWith('-') ? 'change-negative' : 'change-positive'}>{change}</td><td>{conclusion}</td></tr>)}</tbody></table></div>
      </section>
      <section className="panel anomalies-panel">
        <div className="panel-head"><div><span className="eyebrow">АВТОМАТИЧЕСКИЙ КОНТРОЛЬ</span><h3>Обнаруженные аномалии</h3></div><span className="count-badge">3 сигнала</span></div>
        <div className="anomaly-grid">
          <article className="anomaly critical"><div><AlertTriangle size={17}/><span>Высокий риск</span></div><h4>Кассовый разрыв</h4><p>Прогнозный остаток: -3,2 млн ₽ на неделе 15-21 сентября.</p><button className="text-button">Открыть прогноз <ArrowRight size={14}/></button></article>
          <article className="anomaly warning"><div><TrendingUp size={17}/><span>Отклонение</span></div><h4>Рост долгов покупателей</h4><p>Долги покупателей выросли на 18%, при росте выручки только на 6,2%.</p><button className="text-button">Посмотреть клиентов <ArrowRight size={14}/></button></article>
          <article className="anomaly info"><div><Boxes size={17}/><span>Наблюдение</span></div><h4>Избыточные запасы</h4><p>В субстанциях заморожено на 14,1 млн ₽ больше нормы.</p><button className="text-button">Детализация <ArrowRight size={14}/></button></article>
        </div>
      </section>
      <section className="attention-section">
        <div className="attention-heading"><div><span className="eyebrow">ЧТО ДЕЛАТЬ ДАЛЬШЕ</span><h3>Выводы и меры предотвращения рисков</h3></div><p>Приоритеты расположены по силе влияния на деньги компании.</p></div>
        <div className="attention-list">
          <article className="attention-item priority-one"><div className="attention-number">01</div><div className="attention-main"><span className="priority-label">Критический приоритет</span><h4>Не допустить кассового разрыва 3,2 млн ₽</h4><p>Причина: платеж поставщику на 4,8 млн ₽ наступает раньше поступлений от трех крупных покупателей. Денег в целом достаточно, но даты выплат и поступлений не совпадают.</p></div><div className="attention-actions"><b>Что сделать</b><ul><li>Перенести часть платежа поставщику на 7-10 дней.</li><li>Получить подтвержденные даты оплаты от трех крупнейших должников.</li><li>Ввести ежедневный платежный календарь на ближайшие четыре недели.</li></ul><span>Цель: сохранить минимальный запас денег 5 млн ₽.</span></div></article>
          <article className="attention-item priority-two"><div className="attention-number">02</div><div className="attention-main"><span className="priority-label">Высокий приоритет</span><h4>Остановить рост долгов покупателей</h4><p>Причина: долги покупателей выросли на 18%, а выручка только на 6,2%. Компания фактически финансирует клиентов за свой счет и теряет свободные деньги.</p></div><div className="attention-actions"><b>Как избежать повторения</b><ul><li>Установить денежный лимит и срок отсрочки для каждого покупателя.</li><li>Для новых и просрочивших клиентов использовать частичную предоплату.</li><li>Запрещать новые отгрузки при превышении согласованного срока оплаты.</li></ul><span>Цель: сократить срок оплаты покупателями с 53 до 45 дней.</span></div></article>
          <article className="attention-item priority-three"><div className="attention-number">03</div><div className="attention-main"><span className="priority-label">Средний приоритет</span><h4>Высвободить деньги из избыточных запасов</h4><p>Причина: запас субстанций рассчитан на 97 дней при внутренней норме 75 дней. Это замораживает 14,1 млн ₽ и увеличивает риск списаний по сроку годности.</p></div><div className="attention-actions"><b>Как избежать повторения</b><ul><li>Временно остановить закупки позиций с запасом более 90 дней.</li><li>Связать закупочный план с подтвержденным планом производства.</li><li>Еженедельно контролировать медленно используемые партии и сроки годности.</li></ul><span>Цель: вернуть запас к норме 75 дней без риска остановки производства.</span></div></article>
        </div>
      </section>
    </div>
  );
}

function Closing() {
  const [tasks, setTasks] = useState(closingTasksInitial);
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(true);
  const completed = tasks.filter(t => t.status === 'done').length;
  const runCheck = () => { setChecking(true); setChecked(false); setTimeout(() => { setChecking(false); setChecked(true); }, 1100); };
  const finishTask = (id) => setTasks(tasks.map(t => t.id === id ? {...t, status: 'done', date: 'Завершено сейчас'} : t));
  return (
    <div className="page-stack">
      <section className="closing-hero animated-border"><div><span className="eyebrow">ЗАКРЫТИЕ МЕСЯЦА</span><h2>Закрытие сентября</h2><p>Осталось 3 рабочих дня до плановой даты закрытия.</p></div><div className="radial-progress" style={{'--progress': `${completed / tasks.length * 360}deg`}}><span>{Math.round(completed / tasks.length * 100)}%<small>готово</small></span></div><div className="hero-stat"><span>Целевая дата</span><b>08 сентября</b><small><Clock3 size={13}/>по плану</small></div><div className="hero-stat"><span>Критических ошибок</span><b className="red-number">2</b><small><AlertTriangle size={13}/>требуют действий</small></div></section>
      <section className="panel task-panel">
        <div className="panel-head"><div><span className="eyebrow">СТАТУС ПО УЧАСТКАМ</span><h3>Чек-лист закрытия</h3></div><div className="filter-chips"><button className="active">Все</button><button>Мои задачи</button><button>С риском</button></div></div>
        <div className="task-table"><div className="task-row task-header"><span>Участок</span><span>Задача</span><span>Ответственный</span><span>Статус</span><span></span></div>{tasks.map(task => <div className="task-row" key={task.id}><span className="area-name">{task.area}</span><span className="task-name"><b>{task.task}</b><small>{task.date}</small></span><span className="owner"><i>{task.owner.split(' ').map(x=>x[0]).join('')}</i>{task.owner}</span><span className={`status-chip ${task.status}`}>{task.status === 'done' ? 'Завершено' : task.status === 'risk' ? 'Есть риск' : task.status === 'progress' ? 'В процессе' : 'Ожидает'}</span><span>{task.status !== 'done' && <button className="icon-button tiny" aria-label="Отметить завершенной" onClick={() => finishTask(task.id)}><Check size={15}/></button>}</span></div>)}</div>
      </section>
      <section className="validator-layout">
        <div className="panel validator-panel"><div className="panel-head"><div><span className="eyebrow">АВТО-ВАЛИДАТОР</span><h3>Проверки перед закрытием</h3></div><button className="button primary" onClick={runCheck} disabled={checking}>{checking ? <RefreshCw className="spin" size={16}/> : <Play size={16}/>} {checking ? 'Проверяем...' : 'Запустить проверку'}</button></div>
          <div className={`validator-list ${checking ? 'is-checking' : ''}`}>{validationRows.map(row => <div key={row.name}><span className={`check-icon ${row.state === 'ok' ? 'done' : row.state === 'error' ? 'risk' : row.state === 'warning' ? 'warn' : 'wait'}`}>{row.state === 'ok' ? <Check size={14}/> : row.state === 'error' ? <X size={14}/> : row.state === 'warning' ? <AlertTriangle size={14}/> : <RefreshCw size={14}/>}</span><p><b>{row.name}</b><span>{row.detail}</span></p><button className="text-button">Открыть</button></div>)}</div>
        </div>
        <aside className="panel readiness-card"><span className="eyebrow">РЕШЕНИЕ</span><div className="readiness-icon"><ShieldCheck size={30}/></div><h3>{checked ? 'Период пока не готов' : 'Выполняется проверка'}</h3><p>{checked ? 'Исправьте 2 критические ошибки и завершите переоценку валютных остатков.' : 'Сверяем регистры и контрольные соотношения...'}</p><button className="button secondary" disabled>Закрыть период</button><small>Кнопка станет доступна после прохождения всех проверок.</small></aside>
      </section>
    </div>
  );
}

function HelpTip({ text }) {
  return <button type="button" className="help-tip" aria-label={text} data-tip={text}><HelpCircle size={14}/></button>;
}

const formattedNumber = value => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value);

function Field({ label, value, onChange, suffix, tooltip, text = false, wide = false }) {
  const change = event => {
    if (text) return onChange(event.target.value);
    const normalized = event.target.value.replace(/\s/g, '').replace(',', '.');
    if (normalized === '' || Number.isNaN(Number(normalized))) return;
    onChange(Number(normalized));
  };
  return <label className={`calc-field ${wide ? 'wide' : ''}`}><span>{label}<HelpTip text={tooltip}/></span><div><input type="text" inputMode={text ? 'text' : 'decimal'} value={text ? value : formattedNumber(value)} onChange={change}/>{suffix && <em>{suffix}</em>}</div></label>;
}

function Investment() {
  const initialInputs = { name: 'Кардиолекс 50 мг', capex: 120, price: 1480, vc: 620, fc: 8.5, volume: 18000, years: 5, discount: 18 };
  const [inputs, setInputs] = useState(initialInputs);
  const [selectedScenario, setSelectedScenario] = useState('base');
  const set = key => value => setInputs(current => ({...current, [key]: value}));
  const calculate = values => {
    const contribution = values.price - values.vc;
    const bepUnits = contribution > 0 ? values.fc * 1e6 / contribution : 0;
    const grossMargin = values.price ? contribution / values.price * 100 : 0;
    const annualCash = contribution * values.volume * 12 / 1e6 - values.fc * 12;
    const payback = annualCash > 0 ? values.capex / annualCash : 99;
    let npv = -values.capex;
    for(let year = 1; year <= values.years; year++) npv += annualCash / Math.pow(1 + values.discount / 100, year);
    return { contribution, bepUnits, grossMargin, annualCash, payback, npv };
  };
  const metrics = useMemo(() => calculate(inputs), [inputs]);
  const sensitivity = useMemo(() => [0,5,10,15,20].map(growth => {
    const result = calculate({...inputs, vc: inputs.vc * (1 + growth / 100)});
    return { growth: `+${growth}%`, payback: Number(Math.min(result.payback, 10).toFixed(1)) };
  }), [inputs]);
  const breakEvenData = useMemo(() => {
    const points = [0, metrics.bepUnits * .5, metrics.bepUnits, metrics.bepUnits * 1.5, inputs.volume].sort((a,b) => a-b);
    return [...new Set(points.map(value => Math.round(value)))].map(units => ({
      units,
      label: `${Math.round(units / 1000)} тыс.`,
      revenue: Number((units * inputs.price / 1e6).toFixed(1)),
      costs: Number((inputs.fc + units * inputs.vc / 1e6).toFixed(1)),
      profit: Number((units * (inputs.price - inputs.vc) / 1e6 - inputs.fc).toFixed(1)),
    }));
  }, [inputs, metrics.bepUnits]);
  const scenarios = useMemo(() => {
    const variants = [
      ['base', 'Базовый план', 'Без изменений', inputs],
      ['price', 'Снижение цены', 'Цена ниже на 10%', {...inputs, price: inputs.price * .9}],
      ['raw', 'Удорожание сырья', 'Сырье дороже на 15%', {...inputs, vc: inputs.vc * 1.15}],
      ['volume', 'Снижение спроса', 'Объем ниже на 20%', {...inputs, volume: inputs.volume * .8}],
      ['stress', 'Негативный сценарий', 'Цена -10%, сырье +15%, объем -20%', {...inputs, price: inputs.price * .9, vc: inputs.vc * 1.15, volume: inputs.volume * .8}],
      ['growth', 'Рост продаж', 'Цена +5%, объем +15%', {...inputs, price: inputs.price * 1.05, volume: inputs.volume * 1.15}],
    ];
    return variants.map(([id, name, description, values]) => ({ id, name, description, ...calculate(values) }));
  }, [inputs]);
  const activeScenario = scenarios.find(scenario => scenario.id === selectedScenario) || scenarios[0];
  const scenarioChart = scenarios.map(scenario => ({ name: scenario.name, cash: Number(scenario.annualCash.toFixed(1)), fill: scenario.annualCash < 0 ? COLORS.red : scenario.id === selectedScenario ? COLORS.cyan : COLORS.violet }));
  const targetVolume = Math.ceil(metrics.bepUnits * 1.25 / 100) * 100;
  const maxVariableCost = inputs.price - ((inputs.fc * 12 + inputs.capex / 3) * 1e6 / (inputs.volume * 12));
  const reset = () => { setInputs(initialInputs); setSelectedScenario('base'); };
  return (
    <div className="page-stack investment-page">
      <section className="section-heading"><div><span className="eyebrow">НОВЫЙ ПРЕПАРАТ ИЛИ ОБОРУДОВАНИЕ</span><h2>Экономика препарата «{inputs.name}»</h2><p>Расчет точки безубыточности, окупаемости и устойчивости проекта к изменению условий.</p></div><button className="button secondary"><Download size={16}/>Экспорт модели</button></section>
      <div className="calculator-layout">
        <section className="panel inputs-panel"><div className="panel-head"><div><span className="step-number">01</span><h3>Исходные данные</h3></div><button className="icon-button tiny" aria-label="Сбросить исходные данные" onClick={reset}><RefreshCw size={15}/></button></div><div className="field-grid">
          <Field wide text label="Наименование препарата" value={inputs.name} onChange={set('name')} tooltip="Рабочее наименование препарата или проекта, по которому рассчитывается экономика."/>
          <Field label="Начальные вложения" value={inputs.capex} onChange={set('capex')} suffix="млн ₽" tooltip="Все разовые затраты до начала продаж: оборудование, регистрация, запуск линии и подготовка производства."/>
          <Field label="Цена за упаковку" value={inputs.price} onChange={set('price')} suffix="₽" tooltip="Плановая отпускная цена одной упаковки без налога на добавленную стоимость."/>
          <Field label="Затраты на упаковку" value={inputs.vc} onChange={set('vc')} suffix="₽/уп." tooltip="Сырье, субстанция, упаковка и другие расходы, которые возникают при выпуске каждой упаковки."/>
          <Field label="Постоянные расходы цеха" value={inputs.fc} onChange={set('fc')} suffix="млн ₽/мес." tooltip="Ежемесячные расходы, которые не зависят от объема выпуска: персонал, аренда, обслуживание и часть коммунальных расходов."/>
          <Field label="План продаж" value={inputs.volume} onChange={set('volume')} suffix="уп./мес." tooltip="Количество упаковок, которое планируется продавать каждый месяц после выхода на рабочую мощность."/>
          <Field label="Период оценки" value={inputs.years} onChange={set('years')} suffix="лет" tooltip="Срок, за который учитываются будущие денежные поступления проекта."/>
          <Field label="Требуемая доходность" value={inputs.discount} onChange={set('discount')} suffix="%" tooltip="Минимальная годовая доходность, которую собственник ожидает от вложенных денег с учетом риска."/>
        </div><div className="contribution-note"><span>С каждой проданной упаковки остается на покрытие постоянных расходов и прибыль</span><strong>{Math.round(metrics.contribution).toLocaleString('ru-RU')} ₽</strong></div></section>
        <div className="results-column">
          <div className="result-grid">
            <article className="result-card animated-border"><span>Точка безубыточности <HelpTip text="Минимальный месячный объем продаж, при котором доходы покрывают все расходы."/></span><b>{Math.round(metrics.bepUnits).toLocaleString('ru-RU')} уп.</b><small>{money(metrics.bepUnits * inputs.price / 1e6)} выручки</small></article>
            <article className="result-card"><span>Срок возврата вложений <HelpTip text="Количество лет, за которое накопленный денежный поток вернет начальные вложения."/></span><b>{metrics.payback >= 99 ? 'Не окупается' : `${metrics.payback.toFixed(1)} года`}</b><small>{metrics.payback <= 3 ? 'В пределах целевого срока' : 'Выше целевого срока'}</small></article>
            <article className="result-card"><span>Доля прибыли в цене <HelpTip text="Часть цены упаковки, которая остается после вычета сырья и упаковки."/></span><b>{metrics.grossMargin.toFixed(1)}%</b><small>{money(metrics.annualCash)} денег в год</small></article>
            <article className={`result-card ${metrics.npv < 0 ? 'negative-card' : ''}`}><span>Стоимость проекта сегодня <HelpTip text="Будущие деньги проекта пересчитаны в сегодняшнюю стоимость и уменьшены на начальные вложения."/></span><b>{money(metrics.npv)}</b><small>при доходности {inputs.discount}%</small></article>
          </div>
          <section className="panel sensitivity-panel"><div className="panel-head"><div><span className="eyebrow">ЧУВСТВИТЕЛЬНОСТЬ</span><h3>Срок возврата вложений при росте цены сырья</h3></div><span className="unit-label">лет</span></div><div className="sensitivity-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={sensitivity} margin={{top: 18,right: 6,left: -24,bottom: 0}}><CartesianGrid vertical={false} stroke="rgba(148,163,184,.1)"/><XAxis dataKey="growth" axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize: 14.6}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize: 13.6}} domain={[0, 'dataMax + 1']}/><ReferenceLine y={3} stroke={COLORS.red} strokeDasharray="4 4" label={{value:'Предел 3 года',fill:COLORS.red,fontSize: 13.6,position:'insideTopRight'}}/><Tooltip content={<ChartTooltip kind="years"/>}/><Bar dataKey="payback" name="Срок возврата" radius={[5,5,0,0]}>{sensitivity.map((entry,index)=><Cell key={index} fill={entry.payback > 3 ? COLORS.red : index > 1 ? COLORS.amber : COLORS.cyan}/>)}</Bar></BarChart></ResponsiveContainer></div></section>
        </div>
      </div>
      <div className="investment-charts">
        <section className="panel"><div className="panel-head"><div><span className="eyebrow">ТОЧКА БЕЗУБЫТОЧНОСТИ</span><h3>Доходы и расходы при разном объеме продаж</h3></div><span className="value-highlight">Порог: {Math.round(metrics.bepUnits).toLocaleString('ru-RU')} уп.</span></div><div className="investment-chart"><ResponsiveContainer width="100%" height="100%"><ComposedChart data={breakEvenData} margin={{top:16,right:12,left:-10,bottom:0}}><CartesianGrid vertical={false} stroke="rgba(148,163,184,.1)"/><XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize: 13.6}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize: 13.6}}/><Tooltip content={<ChartTooltip/>}/><Area dataKey="profit" name="Прибыль" fill="rgba(45,212,191,.12)" stroke={COLORS.green}/><Line dataKey="revenue" name="Выручка" stroke={COLORS.cyan} strokeWidth={2.5} dot={{r:3}}/><Line dataKey="costs" name="Все расходы" stroke={COLORS.amber} strokeWidth={2.5} dot={{r:3}}/></ComposedChart></ResponsiveContainer></div><div className="chart-legend center"><span><i className="cyan"/>Выручка</span><span><i className="amber"/>Все расходы</span><span><i className="green"/>Прибыль</span></div></section>
        <section className="panel"><div className="panel-head"><div><span className="eyebrow">СРАВНЕНИЕ СЦЕНАРИЕВ</span><h3>Денежный результат за год</h3></div><span className={`scenario-health ${activeScenario.annualCash < 0 ? 'bad' : ''}`}>{activeScenario.annualCash < 0 ? 'Убыток' : 'Прибыль'}</span></div><div className="investment-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={scenarioChart} margin={{top:16,right:8,left:-10,bottom:20}}><CartesianGrid vertical={false} stroke="rgba(148,163,184,.1)"/><XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-14} textAnchor="end" height={52} tick={{fill:'#7f8ba3',fontSize: 11.5}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize: 13.6}}/><ReferenceLine y={0} stroke="rgba(251,113,133,.55)"/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="cash" name="Денежный результат" radius={[5,5,0,0]}>{scenarioChart.map((entry,index)=><Cell key={index} fill={entry.fill}/>)}</Bar></BarChart></ResponsiveContainer></div></section>
      </div>
      <section className="panel what-if-panel"><div className="panel-head"><div><span className="eyebrow">ЧТО БУДЕТ, ЕСЛИ</span><h3>Шесть вариантов развития проекта</h3></div><span className="period-note">Нажмите на вариант для сравнения</span></div><div className="what-if-grid">{scenarios.map(scenario => <button key={scenario.id} className={selectedScenario === scenario.id ? 'selected' : ''} onClick={() => setSelectedScenario(scenario.id)}><span><i className={scenario.annualCash < 0 ? 'risk' : ''}/>{scenario.name}</span><small>{scenario.description}</small><div><b>{money(scenario.annualCash)}</b><em>{scenario.payback >= 99 ? 'не окупается' : `${scenario.payback.toFixed(1)} года`}</em></div></button>)}</div><div className="selected-scenario"><Sparkles size={18}/><p><b>{activeScenario.name}</b><span>{activeScenario.annualCash < 0 ? 'В этом варианте проект ежегодно теряет деньги. Запуск без пересмотра цены, объема или затрат нецелесообразен.' : `Проект приносит ${money(activeScenario.annualCash)} в год и возвращает вложения за ${activeScenario.payback.toFixed(1)} года.`}</span></p></div></section>
      <section className="investment-conclusion animated-border"><div className="conclusion-verdict"><span className={`verdict-icon ${metrics.npv < 0 ? 'bad' : ''}`}>{metrics.npv < 0 ? <AlertTriangle size={25}/> : <BadgeCheck size={25}/>}</span><div><span className="eyebrow">ИТОГ ДЛЯ СОБСТВЕННИКА</span><h3>{metrics.npv >= 0 && metrics.payback <= 3 ? 'Проект экономически привлекателен' : 'Проект требует пересмотра условий'}</h3><p>При текущем плане «{inputs.name}» {metrics.npv >= 0 ? `создает ${money(metrics.npv)} дополнительной стоимости` : `уменьшает стоимость бизнеса на ${money(Math.abs(metrics.npv))}`} за выбранный период.</p></div></div><div className="proposal-grid"><article><Target size={18}/><div><b>Зафиксировать минимальный объем</b><span>Получить подтвержденный план продаж не ниже {targetVolume.toLocaleString('ru-RU')} упаковок в месяц. Это на 25% выше точки безубыточности.</span></div></article><article><ShieldCheck size={18}/><div><b>Ограничить стоимость сырья</b><span>Для возврата вложений за 3 года затраты на упаковку должны быть не выше {Math.max(0,Math.round(maxVariableCost)).toLocaleString('ru-RU')} ₽.</span></div></article><article><Banknote size={18}/><div><b>Защитить отпускную цену</b><span>Закрепить цену в договорах или предусмотреть ее пересмотр при росте стоимости субстанций более чем на 5%.</span></div></article></div><div className="decision-note"><AlertTriangle size={17}/><span>Это расчетная модель на введенных допущениях, а не подтвержденный прогноз. Перед решением нужны коммерческие предложения поставщиков и подтвержденный план продаж.</span></div></section>
    </div>
  );
}

function WorkingCapital() {
  const [workingView, setWorkingView] = useState(null);
  const resultRef = useRef(null);
  const capitalStructure = [
    { month: 'Апр', inventory: 184, receivables: 146, payables: 91 },
    { month: 'Май', inventory: 190, receivables: 151, payables: 93 },
    { month: 'Июн', inventory: 196, receivables: 158, payables: 92 },
    { month: 'Июл', inventory: 201, receivables: 166, payables: 95 },
    { month: 'Авг', inventory: 208, receivables: 174, payables: 97 },
    { month: 'Сен', inventory: 214, receivables: 185, payables: 98 },
  ];
  const releasePotential = [
    { name: 'Излишние запасы', value: 14.1, color: COLORS.amber },
    { name: 'Долги покупателей', value: 9.6, color: COLORS.red },
    { name: 'Условия поставщиков', value: 5.4, color: COLORS.cyan },
  ];
  const openResult = view => {
    setWorkingView(view);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };
  return (
    <div className="page-stack">
      <section className="section-heading"><div><span className="eyebrow">ОБОРОТНЫЙ КАПИТАЛ</span><h2>Оборотный капитал и финансовый цикл</h2><p>Контроль денег, замороженных в запасах и расчетах с контрагентами.</p></div><button className="button primary" onClick={() => openResult('recommendations')}><Sparkles size={16}/>Получить рекомендации</button></section>
      <div className="kpi-grid three"><KpiCard icon={Boxes} label="Срок хранения запасов" value="97 дней" delta="6 дней" meta="хуже нормы" negative tone="red" featured/><KpiCard icon={Users} label="Срок оплаты покупателями" value="53 дня" delta="3 дня" meta="хуже августа" negative tone="amber"/><KpiCard icon={BriefcaseBusiness} label="Срок оплаты поставщикам" value="36 дней" delta="1 день" meta="лучше августа" tone="green"/></div>
      <div className="working-layout"><section className="panel nwc-chart"><div className="panel-head"><div><span className="eyebrow">ПОСЛЕДНИЕ 6 МЕСЯЦЕВ</span><h3>Динамика финансового цикла</h3></div><span className="value-highlight">Финансовый цикл: 114 дней</span></div><div className="large-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={nwcData} margin={{top:12,right:12,left:-18,bottom:0}}><CartesianGrid vertical={false} stroke="rgba(148,163,184,.1)"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize: 14.6}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize: 13.6}}/><Tooltip content={<ChartTooltip kind="days"/>}/><Line dataKey="ccc" name="Финансовый цикл" stroke={COLORS.cyan} strokeWidth={3} dot={{r:4,fill:COLORS.cyan,stroke:'#0b111c',strokeWidth:2}}/><Line dataKey="dio" name="Хранение запасов" stroke={COLORS.violet} strokeWidth={2} dot={false}/><Line dataKey="dso" name="Оплата покупателями" stroke={COLORS.amber} strokeWidth={2} dot={false}/></LineChart></ResponsiveContainer></div><div className="chart-legend center"><span><i className="cyan"/>Финансовый цикл</span><span><i className="violet"/>Хранение запасов</span><span><i className="amber"/>Оплата покупателями</span></div></section>
      <aside className="panel frozen-panel animated-border"><span className="eyebrow">ПОТЕНЦИАЛ ВЫСВОБОЖДЕНИЯ</span><span className="frozen-icon"><Boxes size={26}/></span><h3>14,1 млн ₽</h3><p>заморожено в запасах субстанций сверх нормативного уровня.</p><div className="frozen-detail"><span>Фактический запас<b>97 дней</b></span><span>Целевой запас<b>75 дней</b></span><span>Разрыв<b className="red-number">22 дня</b></span></div><button className="button primary" onClick={() => openResult('plan')}>Открыть план оптимизации <ArrowRight size={15}/></button></aside></div>
      <section className="panel inventory-table"><div className="panel-head"><div><span className="eyebrow">ТОП ПО ЗАМОРОЖЕННОМУ КАПИТАЛУ</span><h3>Категории запасов</h3></div><button className="text-button">Все категории <ArrowRight size={14}/></button></div><div className="inventory-row header"><span>Категория</span><span>Остаток</span><span>Дней запаса</span><span>Выше нормы</span></div>{[['Активные фармсубстанции','34,8 млн ₽',121,'+46 дней'],['Первичная упаковка','18,2 млн ₽',94,'+19 дней'],['Вспомогательные вещества','11,7 млн ₽',83,'+8 дней']].map(([name,sum,days,over])=><div className="inventory-row" key={name}><span><Boxes size={16}/>{name}</span><b>{sum}</b><span><i className="day-bar"><em style={{width:`${Math.min(days/1.4,100)}%`}}/></i>{days}</span><strong>{over}</strong></div>)}</section>
      <div className="working-extra-charts">
        <section className="panel"><div className="panel-head"><div><span className="eyebrow">СТРУКТУРА ДЕНЕГ В ОБОРОТЕ</span><h3>Запасы, долги покупателей и поставщиков</h3></div><span className="unit-label">млн ₽</span></div><div className="working-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={capitalStructure} margin={{top:14,right:8,left:-12,bottom:0}}><CartesianGrid vertical={false} stroke="rgba(148,163,184,.1)"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize:13.6}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize:13.6}}/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="inventory" name="Запасы" fill={COLORS.violet} radius={[3,3,0,0]}/><Bar dataKey="receivables" name="Долги покупателей" fill={COLORS.amber} radius={[3,3,0,0]}/><Bar dataKey="payables" name="Долги поставщикам" fill={COLORS.cyan} radius={[3,3,0,0]}/></BarChart></ResponsiveContainer></div><div className="chart-legend center"><span><i className="violet"/>Запасы</span><span><i className="amber"/>Долги покупателей</span><span><i className="cyan"/>Долги поставщикам</span></div></section>
        <section className="panel"><div className="panel-head"><div><span className="eyebrow">ПОТЕНЦИАЛ УЛУЧШЕНИЯ</span><h3>Сколько денег можно вернуть в оборот</h3></div><span className="value-highlight">Всего: 29,1 млн ₽</span></div><div className="working-chart"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={releasePotential} margin={{top:14,right:30,left:26,bottom:0}}><CartesianGrid horizontal={false} stroke="rgba(148,163,184,.1)"/><XAxis type="number" axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize:13.6}}/><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={145} tick={{fill:'#aab4c6',fontSize:12.6}}/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="value" name="Можно высвободить" radius={[0,5,5,0]}>{releasePotential.map((item,index)=><Cell key={index} fill={item.color}/>)}</Bar></BarChart></ResponsiveContainer></div></section>
      </div>
      {workingView && <section ref={resultRef} className="working-result animated-border">
        <div className="working-result-head"><div><span className="eyebrow">ПРАКТИЧЕСКИЕ ДЕЙСТВИЯ</span><h3>{workingView === 'recommendations' ? 'Рекомендации по оборотному капиталу' : 'План оптимизации на 90 дней'}</h3></div><div className="working-result-tabs"><button className={workingView === 'recommendations' ? 'active' : ''} onClick={() => setWorkingView('recommendations')}>Рекомендации</button><button className={workingView === 'plan' ? 'active' : ''} onClick={() => setWorkingView('plan')}>План на 90 дней</button></div></div>
        {workingView === 'recommendations' ? <div className="working-recommendations">
          <article><span className="recommendation-rank critical">01</span><div><b>Сначала вернуть просроченные долги покупателей</b><p>Нужно разобрать 10 крупнейших должников, подтвердить даты оплаты и временно остановить новые отгрузки клиентам с просрочкой.</p><small>Потенциал: вернуть 9,6 млн ₽ в течение 30 дней.</small></div></article>
          <article><span className="recommendation-rank warning">02</span><div><b>Сократить закупки избыточных субстанций</b><p>Для позиций с запасом более 90 дней остановить новые заказы и связать закупки с подтвержденным производственным планом и сроками годности партий.</p><small>Потенциал: высвободить 14,1 млн ₽ без остановки производства.</small></div></article>
          <article><span className="recommendation-rank info">03</span><div><b>Пересогласовать сроки оплаты поставщикам</b><p>Добиться дополнительной отсрочки по пяти крупнейшим поставщикам сырья. Приоритет отдать тем, кому компания платит быстрее, чем получает деньги от покупателей.</p><small>Потенциал: сохранить в обороте еще 5,4 млн ₽.</small></div></article>
          <div className="working-total"><Sparkles size={20}/><p><b>Итоговый потенциал: 29,1 млн ₽</b><span>Целевой финансовый цикл после выполнения рекомендаций: 88 дней вместо текущих 114 дней.</span></p></div>
        </div> : <div className="optimization-plan">
          <div className="plan-row plan-header"><span>Срок</span><span>Действие</span><span>Ответственный</span><span>Целевой результат</span></div>
          {[
            ['1-7 дней','Заморозить закупки запасов свыше 90 дней и проверить сроки годности партий.','Закупки и производство','4,8 млн ₽'],
            ['1-30 дней','Собрать подтвержденный график оплаты от 10 крупнейших должников.','Продажи и казначейство','9,6 млн ₽'],
            ['8-45 дней','Пересчитать нормы страхового запаса по каждой группе сырья.','Производство и финансы','9,3 млн ₽'],
            ['15-60 дней','Пересогласовать отсрочку с пятью крупнейшими поставщиками.','Закупки и финансы','5,4 млн ₽'],
            ['61-90 дней','Ввести еженедельный контроль запасов, долгов покупателей и платежей поставщикам.','Финансовый директор','Цикл не более 88 дней'],
          ].map(([term,action,owner,result]) => <div className="plan-row" key={term}><span>{term}</span><b>{action}</b><span>{owner}</span><strong>{result}</strong></div>)}
          <div className="plan-summary"><ShieldCheck size={22}/><p><b>Условие успеха</b><span>У каждого действия должен быть один ответственный и подтвержденная дата. Финансовый директор проверяет результат по фактически высвобожденным деньгам, а не по статусу задачи.</span></p></div>
        </div>}
        <div className="decision-note"><AlertTriangle size={17}/><span>Суммы рассчитаны на демонстрационных данных. Перед включением в рабочий план их нужно подтвердить по реестрам запасов, покупателей и поставщиков.</span></div>
      </section>}
    </div>
  );
}

function ScenarioParameter({ label, value, onChange, min, max, suffix, tooltip }) {
  const handleInput = event => {
    const normalized = event.target.value.replace(/\s/g, '').replace(',', '.');
    if (normalized === '' || Number.isNaN(Number(normalized))) return;
    onChange(Math.min(max, Math.max(min, Number(normalized))));
  };
  return <div className="scenario-parameter"><div className="scenario-parameter-head"><span>{label}<HelpTip text={tooltip}/></span><label><input type="text" inputMode="decimal" value={formattedNumber(value)} onChange={handleInput}/><em>{suffix}</em></label></div><input type="range" min={min} max={max} value={value} onChange={event => onChange(Number(event.target.value))}/><small><i>{min}{suffix}</i><i>{max > 0 ? '+' : ''}{max}{suffix}</i></small></div>;
}

function Scenario() {
  const base = { name: 'Финансовый план 2027', currency: 92, raw: 8, logistics: 5, price: 0, volume: 0 };
  const [params, setParams] = useState(base);
  const [activePreset, setActivePreset] = useState('current');
  const change = key => value => { setParams(current => ({...current, [key]: value})); setActivePreset('current'); };
  const factorImpact = useMemo(() => [
    { name: 'Курс валюты', value: Number((-(params.currency - 92) * .82).toFixed(1)), color: COLORS.cyan },
    { name: 'Стоимость сырья', value: Number((-params.raw * 1.38).toFixed(1)), color: COLORS.amber },
    { name: 'Логистика', value: Number((-params.logistics * .54).toFixed(1)), color: COLORS.violet },
    { name: 'Отпускная цена', value: Number((params.price * 1.65).toFixed(1)), color: COLORS.green },
    { name: 'Объем продаж', value: Number((params.volume * 1.15).toFixed(1)), color: COLORS.red },
  ], [params]);
  const totalImpact = factorImpact.reduce((sum, factor) => sum + factor.value, 0);
  const profit = 142.4 + totalImpact;
  const profitChange = profit - 142.4;
  const presets = [
    { id: 'stable', name: 'Стабильные условия', note: 'Все внешние факторы без изменений', values: {...base, name: 'Стабильные условия', raw: 0, logistics: 0} },
    { id: 'currency', name: 'Доллар по 110 ₽', note: 'Только изменение курса валюты', values: {...base, name: 'Доллар по 110 ₽', currency: 110, raw: 0, logistics: 0} },
    { id: 'materials', name: 'Сырье дороже на 20%', note: 'Давление закупочных цен', values: {...base, name: 'Рост стоимости сырья', raw: 20, logistics: 0} },
    { id: 'demand', name: 'Продажи ниже на 15%', note: 'Снижение рыночного спроса', values: {...base, name: 'Снижение спроса', raw: 0, logistics: 0, volume: -15} },
    { id: 'stress', name: 'Негативный сценарий', note: 'Курс 110 ₽, сырье +20%, продажи -15%', values: {...base, name: 'Негативный сценарий', currency: 110, raw: 20, logistics: 20, price: -5, volume: -15} },
    { id: 'growth', name: 'Сценарий роста', note: 'Цена +5%, продажи +12%, мягкий курс', values: {...base, name: 'Сценарий роста', currency: 90, raw: 3, logistics: 3, price: 5, volume: 12} },
  ];
  const presetProfits = presets.map(preset => {
    const values = preset.values;
    const value = 142.4 - (values.currency - 92) * .82 - values.raw * 1.38 - values.logistics * .54 + values.price * 1.65 + values.volume * 1.15;
    return { name: preset.name, value: Number(value.toFixed(1)), color: value < 100 ? COLORS.red : value < 130 ? COLORS.amber : COLORS.green };
  });
  const monthlyProfit = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'].map((month,index) => ({ month, base: Number((142.4 * (index + 1) / 12).toFixed(1)), scenario: Number((profit * (index + 1) / 12).toFixed(1)) }));
  const largestRisk = [...factorImpact].filter(factor => factor.value < 0).sort((a,b) => a.value - b.value)[0];
  const applyPreset = preset => { setParams(preset.values); setActivePreset(preset.id); };
  const reset = () => { setParams(base); setActivePreset('current'); };
  const status = profit >= 130 ? 'Сценарий устойчив' : profit >= 100 ? 'Нужны защитные меры' : 'Высокий риск для прибыли';
  return <div className="page-stack scenario-page">
    <section className="section-heading"><div><span className="eyebrow">ПЛАНИРОВАНИЕ СЦЕНАРИЕВ</span><h2>{params.name}</h2><p>Проверьте, как курс, сырье, логистика, цена и объем продаж влияют на годовую прибыль.</p></div><span className={`scenario-badge ${profit < 100 ? 'danger' : ''}`}><Activity size={14}/>{status}</span></section>
    <div className="scenario-layout expanded"><section className="panel scenario-controls"><div className="panel-head"><div><span className="step-number">01</span><h3>Параметры сценария</h3></div><button className="icon-button tiny" aria-label="Сбросить сценарий" onClick={reset}><RefreshCw size={15}/></button></div>
      <Field wide text label="Наименование сценария" value={params.name} onChange={change('name')} tooltip="Название помогает сохранить смысл набора допущений, например «Негативный план закупок 2027»."/>
      <ScenarioParameter label="Курс доллара в рублях" value={params.currency} onChange={change('currency')} min={75} max={125} suffix=" ₽" tooltip="Ожидаемый средний курс доллара, используемый для пересчета импортного сырья и оборудования."/>
      <ScenarioParameter label="Рост стоимости сырья" value={params.raw} onChange={change('raw')} min={0} max={30} suffix="%" tooltip="Изменение закупочной стоимости субстанций и материалов относительно базового плана."/>
      <ScenarioParameter label="Рост стоимости логистики" value={params.logistics} onChange={change('logistics')} min={0} max={40} suffix="%" tooltip="Изменение расходов на доставку, страхование и таможенное оформление."/>
      <ScenarioParameter label="Изменение отпускной цены" value={params.price} onChange={change('price')} min={-15} max={20} suffix="%" tooltip="Плановое повышение или снижение средней цены реализации продукции."/>
      <ScenarioParameter label="Изменение объема продаж" value={params.volume} onChange={change('volume')} min={-30} max={30} suffix="%" tooltip="Ожидаемое отклонение количества проданной продукции от базового плана."/>
      <button className="button secondary" onClick={reset}><RefreshCw size={15}/>Сбросить к исходным значениям</button>
    </section><div className="scenario-results"><div className="scenario-kpis"><article><span>Базовая прибыль</span><b>142,4 млн ₽</b></article><article className={profit<100?'danger-result':''}><span>Прибыль по сценарию</span><b>{money(profit)}</b></article><article><span>Изменение к плану</span><b className={profitChange < 0 ? 'red-number' : 'green-number'}>{profitChange > 0 ? '+' : ''}{money(profitChange)}</b></article></div>
      <section className="panel scenario-chart"><div className="panel-head"><div><span className="eyebrow">ВЛИЯНИЕ ФАКТОРОВ</span><h3>Вклад каждого изменения в прибыль</h3></div><span className="unit-label">млн ₽</span></div><div className="large-chart"><ResponsiveContainer width="100%" height="100%"><BarChart layout="vertical" data={factorImpact} margin={{top:8,right:35,left:22,bottom:0}}><CartesianGrid horizontal={false} stroke="rgba(148,163,184,.1)"/><XAxis type="number" axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize:13.6}}/><YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={125} tick={{fill:'#aab4c6',fontSize:12.6}}/><ReferenceLine x={0} stroke="rgba(148,163,184,.35)"/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="value" name="Влияние" radius={[4,4,4,4]}>{factorImpact.map((entry,index)=><Cell key={index} fill={entry.value < 0 ? COLORS.red : COLORS.green}/>)}</Bar></BarChart></ResponsiveContainer></div></section>
      <div className="scenario-insight"><Sparkles size={18}/><p><b>Текущий вывод</b><span>{largestRisk ? `Главное отрицательное влияние: ${largestRisk.name.toLowerCase()}, снижение прибыли на ${Math.abs(largestRisk.value).toFixed(1)} млн ₽.` : 'Отрицательных факторов в выбранном сценарии нет.'} Итоговая прибыль составляет {money(profit)}.</span></p></div>
    </div></div>
    <section className="panel scenario-presets"><div className="panel-head"><div><span className="eyebrow">ЧТО БУДЕТ, ЕСЛИ</span><h3>Готовые варианты для быстрой проверки</h3></div><span className="period-note">Нажмите, чтобы применить значения</span></div><div className="scenario-preset-grid">{presets.map((preset,index) => <button key={preset.id} className={activePreset === preset.id ? 'selected' : ''} onClick={() => applyPreset(preset)}><span><i style={{background:presetProfits[index].color}}/>{preset.name}</span><small>{preset.note}</small><b>{money(presetProfits[index].value)}</b></button>)}</div></section>
    <div className="scenario-extra-charts">
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">ДИНАМИКА В ТЕЧЕНИЕ ГОДА</span><h3>Накопленная прибыль по месяцам</h3></div></div><div className="scenario-extra-chart"><ResponsiveContainer width="100%" height="100%"><LineChart data={monthlyProfit} margin={{top:14,right:10,left:-10,bottom:0}}><CartesianGrid vertical={false} stroke="rgba(148,163,184,.1)"/><XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize:12.6}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize:12.6}}/><Tooltip content={<ChartTooltip/>}/><Line dataKey="base" name="Базовый план" stroke={COLORS.cyan} strokeWidth={2.5} dot={false}/><Line dataKey="scenario" name="Выбранный сценарий" stroke={profit < 100 ? COLORS.red : COLORS.violet} strokeWidth={2.5} dot={false}/></LineChart></ResponsiveContainer></div><div className="chart-legend center"><span><i className="cyan"/>Базовый план</span><span><i className="violet"/>Выбранный сценарий</span></div></section>
      <section className="panel"><div className="panel-head"><div><span className="eyebrow">СРАВНЕНИЕ ВАРИАНТОВ</span><h3>Годовая прибыль по готовым сценариям</h3></div></div><div className="scenario-extra-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={presetProfits} margin={{top:14,right:8,left:-10,bottom:35}}><CartesianGrid vertical={false} stroke="rgba(148,163,184,.1)"/><XAxis dataKey="name" axisLine={false} tickLine={false} interval={0} angle={-15} textAnchor="end" height={65} tick={{fill:'#7f8ba3',fontSize:10.5}}/><YAxis axisLine={false} tickLine={false} tick={{fill:'#7f8ba3',fontSize:12.6}}/><Tooltip content={<ChartTooltip/>}/><Bar dataKey="value" name="Годовая прибыль" radius={[5,5,0,0]}>{presetProfits.map((entry,index)=><Cell key={index} fill={entry.color}/>)}</Bar></BarChart></ResponsiveContainer></div></section>
    </div>
    <section className="scenario-conclusion animated-border"><div className="scenario-verdict"><span className={`verdict-icon ${profit < 100 ? 'bad' : ''}`}>{profit < 100 ? <AlertTriangle size={25}/> : <BadgeCheck size={25}/>}</span><div><span className="eyebrow">ВЫВОД ДЛЯ СОБСТВЕННИКА</span><h3>{status}</h3><p>Сценарий «{params.name}» {profitChange < 0 ? `снижает годовую прибыль на ${money(Math.abs(profitChange))}` : `увеличивает годовую прибыль на ${money(profitChange)}`} относительно базового плана.</p></div></div><div className="scenario-actions"><article><ShieldCheck size={18}/><div><b>Защитить главный риск</b><span>{largestRisk?.name === 'Стоимость сырья' ? 'Зафиксировать цену ключевых субстанций минимум на шесть месяцев и подготовить второго поставщика.' : largestRisk?.name === 'Курс валюты' ? 'Согласовать валютный коридор в договорах и заранее распределить закупки по срокам.' : largestRisk?.name === 'Объем продаж' ? 'Подтвердить план продаж заказами клиентов до увеличения производства.' : 'Установить предел отклонения по каждому фактору и пересматривать сценарий ежемесячно.'}</span></div></article><article><Target size={18}/><div><b>Установить порог решения</b><span>Если расчетная прибыль опускается ниже 100 млн ₽, новые вложения и необязательные расходы требуют отдельного согласования собственника.</span></div></article><article><RefreshCw size={18}/><div><b>Обновлять фактическими данными</b><span>Ежемесячно заменять допущения фактическим курсом, ценами поставщиков, продажами и логистическими расходами.</span></div></article></div><div className="decision-note"><AlertTriangle size={17}/><span>Это демонстрационная модель. Коэффициенты влияния не подтверждены данными компании, поэтому итог нельзя использовать как финансовый прогноз без калибровки на фактической отчетности.</span></div></section>
  </div>;
}

function App() {
  const [active, setActive] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState('');
  const titles = { overview: 'Обзор', statements: 'ДДС, ОПиУ, Баланс', closing: 'Закрытие месяца', investment: 'Инвест-калькулятор', working: 'Рабочий капитал', scenario: 'Сценарное планирование' };
  const upload = file => { setToast(`Файл «${file.name}» загружен. Для разбора нужна схема выгрузки 1С.`); setTimeout(()=>setToast(''), 4500); };
  const pages = { overview: <Overview onNavigate={setActive}/>, statements: <Statements/>, closing: <Closing/>, investment: <Investment/>, working: <WorkingCapital/>, scenario: <Scenario/> };
  return (
    <div className="app-shell">
      <Sidebar active={active} setActive={setActive} open={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>
      {sidebarOpen && <button className="mobile-overlay" onClick={()=>setSidebarOpen(false)} aria-label="Закрыть меню"/>}
      <main className="main-content"><Topbar title={titles[active]} onUpload={upload} onMenu={()=>setSidebarOpen(true)}/><div className="content-scroll" key={active}>{pages[active]}</div></main>
      {toast && <div className="toast" role="status"><FileCheck2 size={18}/><span>{toast}</span><button onClick={()=>setToast('')} aria-label="Закрыть"><X size={15}/></button></div>}
    </div>
  );
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
