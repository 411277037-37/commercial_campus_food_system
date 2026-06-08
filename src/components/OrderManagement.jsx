import { ShoppingCart, Bell, Clock3, BarChart3 } from "lucide-react";
import { money, sameDay, sameMonth } from "../utils/format";

export default function OrderManagement({
  setPage,
  orders,
  setOrders,
  vendorShop,
  setVendorLogin,
  vendorOrders,
  completedVendorOrders,
}) {
  const todayRevenue = (() => {
    const today = new Date();
    return completedVendorOrders
      .filter((order) => sameDay(order.completedAt, today))
      .reduce((sum, order) => sum + order.total, 0);
  })();

  const monthRevenue = (() => {
    const now = new Date();
    return completedVendorOrders
      .filter((order) => sameMonth(order.completedAt, now))
      .reduce((sum, order) => sum + order.total, 0);
  })();

  return (
    <>
      <div className="top-banner">
        <div>
          <h1>{vendorShop} Dashboard</h1>
          <p>即時管理訂單</p>
        </div>
        <Bell />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Clock3 />
          <div>
            <h3>今日訂單</h3>
            <p>{vendorOrders.length} 筆</p>
          </div>
        </div>

        <div className="stat-card">
          <ShoppingCart />
          <div>
            <h3>今日收益</h3>
            <p>{money(todayRevenue)}</p>
          </div>
        </div>

        <div className="stat-card">
          <BarChart3 />
          <div>
            <h3>本月收益</h3>
            <p>{money(monthRevenue)}</p>
          </div>
        </div>
      </div>

      <h2 className="section-title">即時訂單</h2>

      {vendorOrders.map((order, index) => (
        <div className="order-card" key={order.id || index}>
          <h3>{order.shop}</h3>

          {order.items.map((item, i) => (
            <p key={i}>
              {item.name} × {item.qty}
            </p>
          ))}

          <p>取餐時間：{order.pickupTime}</p>
          <p>總金額：NT$ {order.total}</p>
          <p>號碼牌：A{order.number}</p>
          <p>狀態：{order.status}</p>

          <div className="order-actions">
            <button
              className="prepare-btn"
              onClick={() => {
                const updated = [...orders];
                const targetIndex = updated.findIndex((o) => o.id === order.id);
                if (targetIndex !== -1) {
                  updated[targetIndex].status = "備餐中";
                  setOrders(updated);
                }
              }}
            >
              接單
            </button>

            <button
              className="finish-btn"
              onClick={() => {
                const updated = [...orders];
                const targetIndex = updated.findIndex((o) => o.id === order.id);
                if (targetIndex !== -1) {
                  updated[targetIndex].status = "已完成";
                  updated[targetIndex].completedAt = new Date().toISOString();
                  setOrders(updated);
                }
              }}
            >
              完成
            </button>
          </div>
        </div>
      ))}

      <button
        className="back-btn"
        onClick={() => {
          setPage("login");
          setVendorLogin(false);
        }}
      >
        登出
      </button>
    </>
  );
}