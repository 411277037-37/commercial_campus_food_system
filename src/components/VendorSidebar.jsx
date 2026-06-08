export default function VendorSidebar({ vendorShop, vendorTab, setVendorTab }) {
  return (
    <aside className="sidebar">
      <h2>{vendorShop}</h2>
      <nav>
        <a
          className={vendorTab === "orders" ? "active" : ""}
          onClick={() => setVendorTab("orders")}
        >
          訂單管理
        </a>

        <a
          className={vendorTab === "menu" ? "active" : ""}
          onClick={() => setVendorTab("menu")}
        >
          菜單管理
        </a>

        <a
          className={vendorTab === "stats" ? "active" : ""}
          onClick={() => setVendorTab("stats")}
        >
          營運統計
        </a>
      </nav>
    </aside>
  );
}