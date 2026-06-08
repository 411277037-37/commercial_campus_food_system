export default function StudentOrders({
  orders = [],
  currentStudent,
  setShowMyOrders,
}) {
  const myOrders = orders.filter(
    (order) => order.studentId === currentStudent?.studentId
  );

  const latestOrder = myOrders[myOrders.length - 1];

  const totalSpent = myOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0
  );

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
          <h1>我的訂單</h1>
          <p>
            查看目前訂單狀態、取餐號碼與預約時間。
            {currentStudent && ` 目前登入：${currentStudent.studentId}`}
          </p>
        </div>
      </div>

      <section className="orders-summary-grid">
        <div className="orders-summary-card">
          <span>訂單數量</span>
          <strong>{myOrders.length}</strong>
          <p>目前累積訂單</p>
        </div>

        <div className="orders-summary-card">
          <span>累積金額</span>
          <strong>NT$ {totalSpent}</strong>
          <p>本次使用紀錄</p>
        </div>

        <div className="orders-summary-card">
          <span>最新狀態</span>
          <strong>{latestOrder ? latestOrder.status : "尚無訂單"}</strong>
          <p>{latestOrder ? latestOrder.shop : "尚未建立訂單"}</p>
        </div>
      </section>

      <section className="orders-panel">
        <div className="orders-panel-header">
          <div>
            <h2>訂單紀錄</h2>
            <p>請依照號碼牌與取餐時間前往櫃台取餐。</p>
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
            {[...myOrders].reverse().map((order, index) => (
              <article
                className="student-order-card"
                key={order.id || index}
              >
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
                    <span>預估備餐時間</span>
                    <strong>
                      {order.status === "已完成"
                        ? "已完成"
                        : `${order.estimatedMinutes || 5} 分鐘`}
                    </strong>
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
            ))}
          </div>
        )}
      </section>
    </div>
  );
}