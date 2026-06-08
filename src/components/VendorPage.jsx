import { useMemo, useState } from "react";
import VendorReviews from "./VendorReviews";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

const vendorAccounts = [
  {
    shopId: 1,
    username: "oden",
    password: "1234",
  },
  {
    shopId: 2,
    username: "don",
    password: "1234",
  },
  {
    shopId: 3,
    username: "breakfast",
    password: "1234",
  },
  {
    shopId: 4,
    username: "drink",
    password: "1234",
  },
  {
    shopId: 5,
    username: "hotpot",
    password: "1234",
  },
];

const money = (n) => `NT$ ${Number(n || 0).toLocaleString()}`;

const sameDay = (a, b) => {
  if (!a || !b) return false;

  const da = new Date(a);
  const db = new Date(b);

  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

const sameMonth = (a, b) => {
  if (!a || !b) return false;

  const da = new Date(a);
  const db = new Date(b);

  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth()
  );
};

const getSuggestedStartTime = (pickupTime, estimatedMinutes) => {
  if (!pickupTime) {
    return "未知";
  }

  const [hour, minute] = pickupTime.split(":").map(Number);

  const date = new Date();

  date.setHours(hour);
  date.setMinutes(minute);
  date.setSeconds(0);

  date.setMinutes(date.getMinutes() - estimatedMinutes);

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function VendorPage({
  setPage,
  shops,
  setShops,
  orders,
  setOrders,
  vendorShopId,
  setVendorShopId,
  vendorUsername,
  setVendorUsername,
  vendorPassword,
  setVendorPassword,
  vendorLogin,
  setVendorLogin,
}) {
  const [activeTab, setActiveTab] = useState("orders");

  const [newFoodName, setNewFoodName] = useState("");
  const [newFoodPrice, setNewFoodPrice] = useState("");
  const [newFoodNote, setNewFoodNote] = useState("");

  const [editingShopName, setEditingShopName] = useState("");
  const [editingNotice, setEditingNotice] = useState("");

  const currentShop = useMemo(() => {
    return shops.find((shop) => shop.id === vendorShopId);
  }, [shops, vendorShopId]);

  const vendorOrders = useMemo(() => {
    if (!currentShop) return [];

    return orders.filter((order) => {
      if (order.shopId) {
        return order.shopId === currentShop.id;
      }

      return order.shop === currentShop.name;
    });
  }, [orders, currentShop]);

  const sortByPickupTime = (list) => {
    return [...list].sort((a, b) =>
      a.pickupTime.localeCompare(b.pickupTime)
    );
  };

  const pendingOrders = useMemo(() => {
    return sortByPickupTime(
      vendorOrders.filter((order) => order.status === "已下單")
    );
  }, [vendorOrders]);

  const preparingOrders = useMemo(() => {
    return sortByPickupTime(
      vendorOrders.filter((order) => order.status === "備餐中")
    );
  }, [vendorOrders]);

  const completedOrders = useMemo(() => {
    return vendorOrders.filter((order) => order.status === "已完成");
  }, [vendorOrders]);

  const todayRevenue = useMemo(() => {
    const today = new Date();

    return completedOrders
      .filter((order) => sameDay(order.completedAt, today))
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [completedOrders]);

  const monthRevenue = useMemo(() => {
    const now = new Date();

    return completedOrders
      .filter((order) => sameMonth(order.completedAt, now))
      .reduce((sum, order) => sum + Number(order.total || 0), 0);
  }, [completedOrders]);

  const productStats = useMemo(() => {
    const map = {};

    completedOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!map[item.name]) {
          map[item.name] = {
            name: item.name,
            qty: 0,
            revenue: 0,
          };
        }

        map[item.name].qty += item.qty;
        map[item.name].revenue += item.qty * item.price;
      });
    });

    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [completedOrders]);

  const updateOrderStatus = async (orderId, status) => {
    const targetOrder = orders.find((order) => order.id === orderId);

    if (!targetOrder?.firebaseId) {
      alert("找不到 Firebase 訂單資料");
      return;
    }

    await updateDoc(doc(db, "orders", targetOrder.firebaseId), {
      status,
      isNew: false,
      completedAt:
        status === "已完成"
          ? new Date().toISOString()
          : targetOrder.completedAt,
    });
  };

  const renderOrderCard = (order) => {
    return (
      <div className="order-card" key={order.id}>
        {!order.isNew && (
          <div className={`order-status-bar status-${order.status}`}>
            {order.status}
          </div>
        )}

        <div className="vendor-order-head">
          <div>
            <span className="order-number">A{order.number}</span>
            <h3>{order.shop}</h3>
          </div>
        </div>

        {order.items.map((item, i) => (
          <p key={i}>
            {item.name} × {item.qty}
          </p>
        ))}

        <p>取餐時間：{order.pickupTime}</p>

        <p>
          預估備餐時間：
          {order.status === "已完成"
            ? "已完成"
            : `${order.estimatedMinutes || 5} 分鐘`}
        </p>

        {order.status !== "已完成" && (
          <p>
            建議開始製作：
            {getSuggestedStartTime(
              order.pickupTime,
              order.estimatedMinutes || 5
            )}
          </p>
        )}

        <p>總金額：NT$ {order.total}</p>

        <div className="order-actions">
          {order.status === "已下單" && (
            <button
              className="prepare-btn"
              onClick={() => updateOrderStatus(order.id, "備餐中")}
            >
              接單
            </button>
          )}

          {order.status === "備餐中" && (
            <button
              className="finish-btn"
              onClick={() => updateOrderStatus(order.id, "已完成")}
            >
              完成
            </button>
          )}
        </div>
      </div>
    );
  };

  const handleVendorLogin = () => {
    const found = vendorAccounts.find(
      (account) =>
        account.username === vendorUsername &&
        account.password === vendorPassword
    );

    if (!found) {
      alert("帳號或密碼錯誤");
      return;
    }

    setVendorShopId(found.shopId);
    setVendorLogin(true);

    const shop = shops.find((item) => item.id === found.shopId);

    if (shop) {
      setEditingShopName(shop.name);
      setEditingNotice(shop.notice || "");
    }
  };

  const handleVendorLogout = () => {
    setVendorLogin(false);
    setVendorShopId(null);
    setVendorUsername("");
    setVendorPassword("");
    setActiveTab("orders");
    setPage("login");
  };

  const handleToggleSoldOut = (foodIndex) => {
    if (!currentShop) return;

    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id !== currentShop.id) return shop;

        return {
          ...shop,
          foods: shop.foods.map((food, index) =>
            index === foodIndex
              ? {
                  ...food,
                  soldOut: !food.soldOut,
                }
              : food
          ),
        };
      })
    );
  };

  const handleDeleteFood = (foodIndex) => {
    if (!currentShop) return;

    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id !== currentShop.id) return shop;

        return {
          ...shop,
          foods: shop.foods.filter((_, index) => index !== foodIndex),
        };
      })
    );
  };

  const handleAddNote = (foodIndex) => {
    if (!currentShop) return;

    const note = prompt("請輸入餐點備註");

    if (note === null) return;

    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id !== currentShop.id) return shop;

        return {
          ...shop,
          foods: shop.foods.map((food, index) =>
            index === foodIndex ? { ...food, note } : food
          ),
        };
      })
    );
  };

  const handleAddFood = () => {
    if (!currentShop) return;

    if (!newFoodName || !newFoodPrice) {
      alert("請輸入餐點名稱與價格");
      return;
    }

    setShops((prev) =>
      prev.map((shop) => {
        if (shop.id !== currentShop.id) return shop;

        return {
          ...shop,
          foods: [
            ...shop.foods,
            {
              name: newFoodName,
              price: Number(newFoodPrice),
              qty: 0,
              note: newFoodNote,
              soldOut: false,
            },
          ],
        };
      })
    );

    setNewFoodName("");
    setNewFoodPrice("");
    setNewFoodNote("");
  };

  const handleSaveShopName = () => {
    if (!currentShop) return;

    const trimmedName = editingShopName.trim();

    if (!trimmedName) {
      alert("店家名稱不可空白");
      return;
    }

    const oldName = currentShop.name;

    setShops((prev) =>
      prev.map((shop) =>
        shop.id === currentShop.id
          ? {
              ...shop,
              name: trimmedName,
            }
          : shop
      )
    );

    setOrders((prev) =>
      prev.map((order) =>
        order.shopId === currentShop.id || order.shop === oldName
          ? {
              ...order,
              shop: trimmedName,
              shopId: currentShop.id,
            }
          : order
      )
    );

    alert("店家名稱已更新，學生端會看到新的名稱");
  };

  const handleSaveNotice = () => {
    if (!currentShop) return;

    setShops((prev) =>
      prev.map((shop) =>
        shop.id === currentShop.id
          ? {
              ...shop,
              notice: editingNotice.trim(),
            }
          : shop
      )
    );

    alert("店家公告已更新");
  };

  if (!vendorLogin) {
    return (
      <div className="vendor-login-page">
        <button
          className="page-back-btn vendor-login-back"
          onClick={() => setPage("login")}
          aria-label="返回登入首頁"
        >
          ←
        </button>

        <div className="vendor-login-card">
          <span className="vendor-login-label">Vendor Login</span>

          <h2>店家登入</h2>

          <p className="vendor-login-desc">
            請使用店家帳號與密碼登入後台，不需要再選擇店家。
          </p>

          <input
            placeholder="帳號"
            value={vendorUsername}
            onChange={(e) => setVendorUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="密碼"
            value={vendorPassword}
            onChange={(e) => setVendorPassword(e.target.value)}
          />

          <button
            className="submit-order-btn"
            onClick={handleVendorLogin}
          >
            登入後台
          </button>

          <div className="vendor-login-hint">
            <strong>測試帳號</strong>
            <p>oden / don / breakfast / drink / hotpot</p>
            <p>密碼皆為 1234</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentShop) {
    return (
      <div className="vendor-login-page">
        <div className="vendor-login-card">
          <h2>找不到店家資料</h2>
          <p className="vendor-login-desc">
            請重新登入，或確認帳號是否正確。
          </p>

          <button
            className="submit-order-btn"
            onClick={handleVendorLogout}
          >
            返回登入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-page">
      <aside className="sidebar">
        <div className="vendor-sidebar-top">
          <div>
            <h2>{currentShop.name}</h2>
            <p>店家後台</p>
          </div>
        </div>

        <nav>
          <a
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            訂單管理
          </a>

          <a
            className={activeTab === "menu" ? "active" : ""}
            onClick={() => setActiveTab("menu")}
          >
            菜單管理
          </a>

          <a
            className={activeTab === "stats" ? "active" : ""}
            onClick={() => setActiveTab("stats")}
          >
            銷售統計
          </a>

          <a
            className={activeTab === "reviews" ? "active" : ""}
            onClick={() => setActiveTab("reviews")}
          >
            查看評論
          </a>

          <a
            className={activeTab === "settings" ? "active" : ""}
            onClick={() => setActiveTab("settings")}
          >
            店家設定
          </a>
        </nav>
      </aside>

      <main className="vendor-main">
        <div className="vendor-global-actions">
          <button
            className="back-btn logout-btn"
            onClick={handleVendorLogout}
          >
            登出
          </button>
        </div>

        {activeTab === "orders" && (
          <>
            <div className="top-banner">
              <div>
                <span className="vendor-banner-label">Dashboard</span>
                <h1>{currentShop.name}</h1>
                <p>即時管理學生訂單與取餐狀態</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div>
                  <h3>目前訂單</h3>
                  <p>{vendorOrders.length} 筆</p>
                </div>
              </div>
            </div>

            <h2 className="section-title">即時訂單</h2>

            {vendorOrders.length === 0 ? (
              <div className="empty-box">
                目前沒有訂單
              </div>
            ) : (
              <>
                <div className="order-status-section">
                  <h3>已下單</h3>

                  {pendingOrders.length === 0 ? (
                    <div className="empty-box small-empty">
                      目前沒有已下單訂單
                    </div>
                  ) : (
                    pendingOrders.map((order) => renderOrderCard(order))
                  )}
                </div>

                <div className="order-status-section">
                  <h3>備餐中</h3>

                  {preparingOrders.length === 0 ? (
                    <div className="empty-box small-empty">
                      目前沒有備餐中訂單
                    </div>
                  ) : (
                    preparingOrders.map((order) => renderOrderCard(order))
                  )}
                </div>

                <div className="order-status-section">
                  <h3>已完成</h3>

                  {completedOrders.length === 0 ? (
                    <div className="empty-box small-empty">
                      目前沒有已完成訂單
                    </div>
                  ) : (
                    completedOrders.map((order) => renderOrderCard(order))
                  )}
                </div>
              </>
            )}
          </>
        )}

        {activeTab === "stats" && (
          <div className="vendor-stats-page">
            <div className="page-topbar">
              <button
                className="page-back-btn"
                onClick={() => setActiveTab("orders")}
                aria-label="返回訂單管理"
              >
                ←
              </button>

              <div className="page-topbar-title">
                <h2>銷售統計</h2>
                <p>查看店家餐點銷售數量與營收表現。</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <div>
                  <h3>今日收益</h3>
                  <p>{money(todayRevenue)}</p>
                </div>
              </div>

              <div className="stat-card">
                <div>
                  <h3>本月收益</h3>
                  <p>{money(monthRevenue)}</p>
                </div>
              </div>

              <div className="stat-card">
                <div>
                  <h3>已完成訂單</h3>
                  <p>{completedOrders.length} 筆</p>
                </div>
              </div>
            </div>

            <section className="chart-panel">
              <div className="orders-panel-header">
                <div>
                  <h2>產品銷售統計</h2>
                  <p>依照已完成訂單統計餐點銷售數量。</p>
                </div>
              </div>

              {productStats.length === 0 ? (
                <div className="empty-box">
                  目前還沒有已完成訂單可統計
                </div>
              ) : (
                <div className="product-stat-list">
                  {productStats.map((item) => (
                    <div className="product-stat-item" key={item.name}>
                      <div>
                        <strong>{item.name}</strong>
                        <span>售出 {item.qty} 份</span>
                      </div>

                      <p>{money(item.revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="menu-manage-panel">
            <div className="page-topbar">
              <button
                className="page-back-btn"
                onClick={() => setActiveTab("orders")}
                aria-label="返回訂單管理"
              >
                ←
              </button>

              <div className="page-topbar-title">
                <h2>菜單管理</h2>
                <p>管理學生端可以看到的餐點。</p>
              </div>
            </div>

            {currentShop.foods.map((food, index) => (
              <div className="manage-food-card" key={`${food.name}-${index}`}>
                <div>
                  <h3>{food.name}</h3>
                  <p>NT$ {food.price}</p>

                  {food.soldOut && (
                    <span className="sold-out-badge">
                      已售完
                    </span>
                  )}

                  {food.note && <p>備註：{food.note}</p>}
                </div>

                <div className="manage-actions">
                  <button
                    className={food.soldOut ? "finish-btn" : "prepare-btn"}
                    onClick={() => handleToggleSoldOut(index)}
                  >
                    {food.soldOut ? "恢復供應" : "設為售完"}
                  </button>

                  <button
                    className="note-btn"
                    onClick={() => handleAddNote(index)}
                  >
                    新增備註
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteFood(index)}
                  >
                    刪除
                  </button>
                </div>
              </div>
            ))}

            <div className="add-food-panel">
              <h3>新增餐點</h3>

              <input
                placeholder="餐點名稱"
                value={newFoodName}
                onChange={(e) => setNewFoodName(e.target.value)}
              />

              <input
                placeholder="價格"
                value={newFoodPrice}
                onChange={(e) => setNewFoodPrice(e.target.value)}
              />

              <input
                placeholder="備註"
                value={newFoodNote}
                onChange={(e) => setNewFoodNote(e.target.value)}
              />

              <button
                className="submit-order-btn"
                onClick={handleAddFood}
              >
                新增餐點
              </button>
            </div>
          </div>
        )}

        {activeTab === "reviews" && (
          <VendorReviews
            shops={shops}
            setShops={setShops}
            vendorShop={currentShop.name}
          />
        )}

        {activeTab === "settings" && (
          <div className="vendor-settings-page">
            <div className="page-topbar">
              <button
                className="page-back-btn"
                onClick={() => setActiveTab("orders")}
                aria-label="返回訂單管理"
              >
                ←
              </button>

              <div className="page-topbar-title">
                <h2>店家設定</h2>
                <p>修改店家顯示名稱與學生端資訊。</p>
              </div>
            </div>

            <div className="settings-hero-card">
              <span>Shop Settings</span>
              <h1>店家設定</h1>
              <p>
                可以修改學生端看到的店家名稱、公告與學生端顯示資訊。
              </p>
            </div>

            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h2>店家顯示名稱</h2>
                  <p>這個名稱會顯示在學生端店家列表與訂單紀錄中。</p>
                </div>
              </div>

              <div className="settings-form">
                <label>目前店名</label>

                <input
                  value={editingShopName}
                  onChange={(e) => setEditingShopName(e.target.value)}
                  placeholder="請輸入店家名稱"
                />

                <button
                  className="submit-order-btn"
                  onClick={handleSaveShopName}
                >
                  儲存店家名稱
                </button>
              </div>
            </section>

            <section className="settings-panel">
              <div className="settings-panel-header">
                <div>
                  <h2>店家公告</h2>
                  <p>
                    公告會顯示在學生端店家頁面，例如售完、提早打烊或優惠資訊。
                  </p>
                </div>
              </div>

              <div className="settings-form">
                <label>公告內容</label>

                <textarea
                  className="notice-textarea"
                  value={editingNotice}
                  onChange={(e) => setEditingNotice(e.target.value)}
                  placeholder="例如：今日牛丼已售完，飲料第二杯半價"
                />

                <button
                  className="submit-order-btn"
                  onClick={handleSaveNotice}
                >
                  儲存公告
                </button>
              </div>
            </section>

            <section className="settings-preview-card">
              <h3>學生端預覽</h3>

              <div className="shop-preview-card">
                <img src={currentShop.image} alt={currentShop.name} />

                <div>
                  <h3>{editingShopName || currentShop.name}</h3>
                  <p>校園美食 · 快速預點餐</p>

                  {(editingNotice || currentShop.notice) && (
                    <p>
                      📢 {editingNotice || currentShop.notice}
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}