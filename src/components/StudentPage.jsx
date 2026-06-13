import { useState } from "react";
import ReviewSection from "./ReviewSection";
import StudentProfile from "./StudentProfile";

export default function StudentPage({
  setPage,
  shops,
  selectedShop,
  setSelectedShop,
  orders,
  setOrders,
  showConfirm,
  setShowConfirm,
  pickupTime,
  setPickupTime,
  increaseQty,
  decreaseQty,
  submitOrder,
  setShowMyOrders,
  setShops,
  currentStudent,
  setCurrentStudent,
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  const scrollToSection = (id) => {
    closeDrawer();

    setTimeout(() => {
      const target = document.getElementById(id);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }, 120);
  };

  const scrollToShop = (shopName) => {
    closeDrawer();

    setTimeout(() => {
      const target = document.getElementById(`shop-${shopName}`);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 120);
  };
  const handleSearch = () => {
    const keyword = searchKeyword.trim();

    if (!keyword) {
      alert("請輸入要搜尋的店家名稱");
      return;
    }

    const foundShop = shops.find((shop) =>
      shop.name.includes(keyword)
    );

    if (!foundShop) {
      alert("找不到符合的店家");
      return;
    }

    scrollToShop(foundShop.name);
  };
  const getOneHourPreparingCount = (shop) => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    return orders.filter((order) => {
      const isSameShop = order.shopId
        ? order.shopId === shop.id
        : order.shop === shop.name;

      if (!isSameShop) return false;
      if (order.status !== "備餐中") return false;
      if (!order.pickupTime) return false;

      let orderDate = now;

      if (order.createdAt) {
        orderDate =
          typeof order.createdAt.toDate === "function"
            ? order.createdAt.toDate()
            : new Date(order.createdAt);
      }

      const isToday =
        orderDate.getFullYear() === now.getFullYear() &&
        orderDate.getMonth() === now.getMonth() &&
        orderDate.getDate() === now.getDate();

      if (!isToday) return false;

      const [hour, minute] = order.pickupTime.split(":").map(Number);

      const pickupDate = new Date();
      pickupDate.setHours(hour);
      pickupDate.setMinutes(minute);
      pickupDate.setSeconds(0);

      return pickupDate <= oneHourLater;
    }).length;
  };

  if (showProfile) {
    return (
      <StudentProfile
        currentStudent={currentStudent}
        setCurrentStudent={setCurrentStudent}
        onClose={() => setShowProfile(false)}
      />
    );
  }

  return (
    <div className="student-shell">
      <button
        className={`mobile-menu-btn ${drawerOpen ? "drawer-open" : ""}`}
        onClick={() => setDrawerOpen(!drawerOpen)}
        aria-label="開啟選單"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <div
        className={`drawer-overlay ${drawerOpen ? "show" : ""}`}
        onClick={closeDrawer}
      ></div>

      <aside className={`student-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-brand">
          <h2>歸燕食巢</h2>

          {currentStudent && (
            <p className="student-login-info">
              目前登入：{currentStudent.nickname || currentStudent.studentId}
            </p>
          )}
        </div>

        <nav className="drawer-nav">
          <button onClick={() => scrollToSection("home")}>首頁</button>
          <button onClick={() => scrollToSection("categories")}>餐點分類</button>
          <button onClick={() => scrollToSection("shops")}>店家列表</button>

          <button
            onClick={() => {
              closeDrawer();
              setShowMyOrders(true);
            }}
          >
            我的訂單
          </button>

          <button
            onClick={() => {
              closeDrawer();
              setShowProfile(true);
            }}
          >
            我的資料
          </button>

          <button
            onClick={() => {
              closeDrawer();
              setPage("login");
            }}
          >
            登出
          </button>
        </nav>

        <div className="drawer-mini-card">
          <h3>今日提醒</h3>
          <p>中午尖峰時段建議提前 10 分鐘預訂。</p>
        </div>
      </aside>

      <div className="student-page">
        <header className="hero" id="home">
          <div className="hero-text">
            <h1 className="student-brand-title">
              <span>歸燕</span>
              <span>食巢</span>
            </h1>

            {currentStudent && (
              <p className="student-login-info">
                目前登入：{currentStudent.nickname || currentStudent.studentId}
              </p>
            )}
          </div>

          <div className="hero-actions">
            <button
              className="back-btn"
              onClick={() => setShowMyOrders(true)}
            >
              我的訂單
            </button>

            <button
              className="back-btn"
              onClick={() => setShowProfile(true)}
            >
              我的資料
            </button>

            <button
              className="back-btn logout-btn"
              onClick={() => setPage("login")}
            >
              登出
            </button>
          </div>
        </header>

        {!selectedShop ? (
          <>
            <section className="search-panel home-search-panel">
              <input
                placeholder="搜尋店家，例如：關東煮、丼飯、早餐店"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              <button onClick={handleSearch}>搜尋</button>
            </section>

            <section className="home-section" id="categories">
              <div className="section-header">
                <div>
                  <h2 className="section-title">餐點分類</h2>
                  <p className="section-subtitle">快速找到今天想吃的類型</p>
                </div>
              </div>

              <div className="category-row">
                <button
                  className="category-chip"
                  onClick={() => scrollToShop("關東煮")}
                >
                  <span className="category-icon">🍢</span>
                  <span>關東煮</span>
                </button>

                <button
                  className="category-chip"
                  onClick={() => scrollToShop("丼飯")}
                >
                  <span className="category-icon">🍚</span>
                  <span>丼飯</span>
                </button>

                <button
                  className="category-chip"
                  onClick={() => scrollToShop("早餐店")}
                >
                  <span className="category-icon">🍳</span>
                  <span>早餐店</span>
                </button>

                <button
                  className="category-chip"
                  onClick={() => scrollToShop("飲料店")}
                >
                  <span className="category-icon">🥤</span>
                  <span>飲料店</span>
                </button>

                <button
                  className="category-chip"
                  onClick={() => scrollToShop("鍋燒")}
                >
                  <span className="category-icon">🍲</span>
                  <span>鍋燒</span>
                </button>
              </div>
            </section>

            <section className="home-section">
              <div className="notice-card">
                <span>📢</span>

                <div>
                  <strong>今日公告</strong>
                  <p>中午 12:00 - 12:40 為尖峰時段，建議提前預訂。</p>
                </div>
              </div>
            </section>

            <section className="home-section" id="shops">
              <div className="section-header">
                <div>
                  <h2 className="section-title">店家列表</h2>
                  <p className="section-subtitle">選擇店家開始點餐</p>
                </div>

                <span className="section-link">共 {shops.length} 間店家</span>
              </div>

              <div className="shop-grid">
                {shops.map((shop) => (
                  <div
                    id={`shop-${shop.name}`}
                    className="shop-card"
                    key={shop.id}
                    onClick={() => setSelectedShop(shop)}
                  >
                    <img src={shop.image} alt={shop.name} />

                    <div className="shop-content">
                      <h3>{shop.name}</h3>

                      <p className="shop-type">校園美食</p>

                      <p className="shop-rating">
                        {shop.rating > 0
                          ? `★★★★★ ${shop.rating}`
                          : "尚無評價"}
                      </p>

                      <div className="shop-preparing-count">
                        備餐中 {getOneHourPreparingCount(shop)} 單
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : (
          <>
            <div className="page-topbar">
              <button
                className="page-back-btn"
                onClick={() => {
                  setSelectedShop(null);
                  setShowConfirm(false);
                }}
                aria-label="返回店家列表"
              >
                ←
              </button>

              <div className="page-topbar-title">
                <h2>{selectedShop.name}</h2>
                <p>選擇餐點並預約取餐時間</p>
              </div>
            </div>

            {selectedShop.notice && (
              <div className="shop-notice-card">
                <strong>📢 店家公告</strong>
                <p>{selectedShop.notice}</p>
              </div>
            )}

            <div className="food-grid">
              {selectedShop.foods.map((food, index) => (
                <div className="food-card" key={index}>
                  <div className="food-info">
                    <h3>{food.name}</h3>
                    <p>NT$ {food.price}</p>

                    {food.soldOut && (
                      <div className="sold-out-badge">
                        已售完
                      </div>
                    )}

                    {food.note && <div className="food-note">{food.note}</div>}
                  </div>

                  <div className="qty-box">
                    <button
                      className="qty-btn"
                      onClick={() => decreaseQty(index)}
                    >
                      -
                    </button>

                    <span>{food.qty}</span>

                    <button
                      className="qty-btn"
                      disabled={food.soldOut}
                      onClick={() => {
                        if (food.soldOut) {
                          return;
                        }

                        increaseQty(index);
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pickup-box">
              <label>選擇預約取餐時間</label>

              <input
                type="time"
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
              />
            </div>

            <button className="submit-order-btn" onClick={submitOrder}>
              送出訂單
            </button>

            <ReviewSection
              selectedShop={selectedShop}
              shops={shops}
              setShops={setShops}
              currentStudent={currentStudent}
            />

            {showConfirm && (
              <div className="cart-panel">
                <h2>訂單確認</h2>

                {orders[orders.length - 1]?.items.map((item, index) => (
                  <div className="cart-item" key={index}>
                    <span>
                      {item.name} × {item.qty}
                    </span>
                    <span>NT$ {item.price * item.qty}</span>
                  </div>
                ))}

                <h3>取餐時間：{orders[orders.length - 1]?.pickupTime}</h3>
                <h3>總金額：NT$ {orders[orders.length - 1]?.total}</h3>
                <h3>號碼牌：A{orders[orders.length - 1]?.number}</h3>
                <h3>
                  預估備餐時間：
                  {orders[orders.length - 1]?.estimatedMinutes} 分鐘
                </h3>

                <div className="confirm-actions">
                  <button
                    className="cancel-order-btn"
                    onClick={() => {
                      setShowConfirm(false);
                      setOrders(orders.slice(0, -1));
                    }}
                  >
                    返回修改
                  </button>

                  <button
                    className="submit-order-btn"
                    onClick={() => {
                      alert("訂單已成功送出！");
                      setShowConfirm(false);
                      setSelectedShop(null);
                      setPickupTime("");
                    }}
                  >
                    確認送出
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}