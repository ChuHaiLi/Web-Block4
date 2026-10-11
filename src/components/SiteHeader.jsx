export default function SiteHeader() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand" href="#main-content" aria-label="Quản lý học vụ — danh sách sinh viên">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M3 5.5c3.5-1.2 6.5-.5 9 1.5 2.5-2 5.5-2.7 9-1.5v13c-3.5-1.2-6.5-.5-9 1.5-2.5-2-5.5-2.7-9-1.5v-13Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
              <path d="M12 7v13" stroke="currentColor" strokeWidth="1.7" />
            </svg>
          </span>
          <span><strong>Quản lý học vụ</strong><span className="brand-subtitle">Không gian quản lý sinh viên</span></span>
        </a>
        <span className="header-label">Danh sách sinh viên</span>
      </div>
    </header>
  );
}
