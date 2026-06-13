import { useState } from "react";

export default function StudentOrders({
  orders = [],
  currentStudent,
  setShowMyOrders,
}) {
  const [expandedCompletedOrders, setExpandedCompletedOrders] = useState({});

  const myOrders = orders.filter(
    (order) => order.studentId === currentStudent?.studentId
  );

  const latestOrder = myOrders[myOrders.length - 1];

  const totalSpent = myOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

  const getOrderProgressText = (order) => {
    if (order.status === "已下單") {
      return "等待接單";
    }

    if (order.status === "備餐中") {
      return `${order.estimatedMinutes || 5} 分鐘`;
    }

    if (order.status === "待取餐") {
      return "請前往取餐";
    }

    if (order.status === "已完成") {
      return "已完成";
    }

    return order.status || "未知";
  };

  const toggleCompletedOrder = (orderKey) => {
    setExpandedCompletedOrders((prev) => ({
      ...prev,
      [orderKey]: !prev[orderKey],
    }));
  };

  return (
    <div className="student-orders-page">
      <div className="orders-hero">
        <button
          className="page-back-btn dark"
          onClick={() => setShowMyOrders(false)}
          aria-label="返回學生首頁"
        >
          ←
        </button>

        <div>
          <span className="orders-label">My Orders</span>

          <h1 className="my-orders-title">我的訂單</h1>

          {currentStudent && (
            <p className="my-orders-login">
              目前登入：{currentStudent.studentId}
            </p>
          )}
        </div>
      </div>

      <section className="orders-summary-grid">
        <div className="orders-summary-card">
          <span>訂單數量</span>

          <div className="orders-summary-main small-number">
            {myOrders.length}
          </div>

          <p>目前累積訂單</p>
        </div>

        <div className="orders-summary-card">
          <span>累積金額</span>

          <div className="orders-summary-main money-number">
            NT$ {totalSpent}
          </div>

          <p>本次使用紀錄</p>
        </div>

        <div className="orders-summary-card">
          <span>最新狀態</span>

          <div className="orders-summary-main status-number">
            {latestOrder ? latestOrder.status : "尚無訂單"}
          </div>

          <p>{latestOrder ? latestOrder.shop : "尚未建立訂單"}</p>
        </div>
      </section>

      <section className="orders-panel">
        <div className="orders-panel-header">
          <div>
            <h2>訂單紀錄</h2>
            <p>未完成訂單會完整顯示，已完成訂單可點擊展開細項。</p>
          </div>
        </div>

        {myOrders.length === 0 ? (
          <div className="empty-orders">
            <div className="empty-orders-icon">🧾</div>
            <h3>目前尚無訂單</h3>
            <p>先到店家列表選擇餐點，送出後會顯示在這裡。</p>
          </div>
        ) : (
          <div className="student-orders-list">
            {[...myOrders].reverse().map((order, index) => {
              const orderKey = order.firebaseId || order.id || index;
              const isCompleted = order.status === "已完成";
              const isExpanded = expandedCompletedOrders[orderKey];

              if (isCompleted) {
                return (
                  <article
                    className={`student-order-card completed-order-card ${
                      isExpanded ? "expanded" : "collapsed"
                    }`}
                    key={orderKey}
                    onClick={() => toggleCompletedOrder(orderKey)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        toggleCompletedOrder(orderKey);
                      }
                    }}
                  >
                    <div className="completed-order-summary">
                      <span className="order-number">A{order.number}</span>

                      <h3>{order.shop}</h3>

                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </div>

                    <div className="completed-order-hint">
                      {isExpanded ? "點擊收合訂單細項" : "點擊查看訂單細項"}
                    </div>

                    {isExpanded && (
                      <>
                        <div className="student-order-items">
                          {(order.items || []).map((item, i) => (
                            <div className="student-order-item" key={i}>
                              <span>{item.name}</span>
                              <strong>× {item.qty}</strong>
                            </div>
                          ))}
                        </div>

                        <div className="student-order-info">
                          <div>
                            <span>取餐時間</span>
                            <strong>{order.pickupTime}</strong>
                          </div>

                          <div>
                            <span>訂單進度</span>
                            <strong>{getOrderProgressText(order)}</strong>
                          </div>

                          <div>
                            <span>總金額</span>
                            <strong>NT$ {order.total}</strong>
                          </div>

                          <div>
                            <span>下單時間</span>
                            <strong>
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleString()
                                : "未知"}
                            </strong>
                          </div>
                        </div>
                      </>
                    )}
                  </article>
                );
              }

              return (
                <article className="student-order-card" key={orderKey}>
                  <div className="student-order-top">
                    <div>
                      <span className="order-number">A{order.number}</span>
                      <h3>{order.shop}</h3>
                    </div>

                    <span className={`status-badge status-${order.status}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="student-order-items">
                    {(order.items || []).map((item, i) => (
                      <div className="student-order-item" key={i}>
                        <span>{item.name}</span>
                        <strong>× {item.qty}</strong>
                      </div>
                    ))}
                  </div>

                  <div className="student-order-info">
                    <div>
                      <span>取餐時間</span>
                      <strong>{order.pickupTime}</strong>
                    </div>

                    <div>
                      <span>訂單進度</span>
                      <strong>{getOrderProgressText(order)}</strong>
                    </div>

                    <div>
                      <span>總金額</span>
                      <strong>NT$ {order.total}</strong>
                    </div>

                    <div>
                      <span>下單時間</span>
                      <strong>
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleString()
                          : "未知"}
                      </strong>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}