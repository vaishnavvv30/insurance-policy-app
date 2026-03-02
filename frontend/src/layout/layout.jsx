import "../styles/global.css";

export default function Layout({ children }) {
  return (
    <div className="app-bg">
      <div className="app-content">
        {children}
      </div>
    </div>
  );
}
