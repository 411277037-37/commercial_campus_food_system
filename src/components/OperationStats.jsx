import { useMemo } from "react";
import { ShoppingCart, Clock3, BarChart3 } from "lucide-react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

import { money, sameDay, sameMonth } from "../utils/format";

ChartJS.register(ArcElement, Tooltip, Legend);

export default function OperationStats({
  vendorOrders,
  completedVendorOrders,
}) {
  const todayRevenue = useMemo(() => {
    const today = new Date();
    return completedVendorOrders
      .filter((order) => sameDay(order.completedAt, today))
      .reduce((sum, order) => sum + order.total, 0);
  }, [completedVendorOrders]);

  const monthRevenue = useMemo(() => {
    const now = new Date();
    return completedVendorOrders
      .filter((order) => sameMonth(order.completedAt, now))
      .reduce((sum, order) => sum + order.total, 0);
  }, [completedVendorOrders]);

  const productStats = useMemo(() => {
    const map = {};
    completedVendorOrders.forEach((order) => {
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
  }, [completedVendorOrders]);

  const totalRevenue = useMemo(() => {
    return completedVendorOrders.reduce((sum, order) => sum + order.total, 0);
  }, [completedVendorOrders]);

  const averageOrderAmount = useMemo(() => {
    if (completedVendorOrders.length === 0) return 0;
    return Math.round(totalRevenue / completedVendorOrders.length);
  }, [completedVendorOrders, totalRevenue]);

  const preparingOrders = useMemo(() => {
    return vendorOrders.filter((order) => order.status === "備餐中").length;
  }, [vendorOrders]);

  const waitingOrders = useMemo(() => {
    return vendorOrders.filter((order) => order.status === "已下單").length;
  }, [vendorOrders]);

  const completedRate = useMemo(() => {
    if (vendorOrders.length === 0) return 0;
    return Math.round((completedVendorOrders.length / vendorOrders.length) * 100);
  }, [vendorOrders, completedVendorOrders]);

  const topProduct = productStats.length > 0 ? productStats[0] : null;

  const pieData = useMemo(() => {
    const labels = productStats.map((item) => item.name);
    const data = productStats.map((item) => item.qty);

    return {
      labels,
      datasets: [
        {
          label: "銷售數量",
          data,
          backgroundColor: [
            "#FF6B35",
            "#004E89",
            "#00A86B",
            "#F59E0B",
            "#EF4444",
            "#8B5CF6",
            "#14B8A6",
            "#F97316",
            "#06B6D4",
            "#84CC16",
          ],
          borderColor: "#FFFFFF",
          borderWidth: 2,
        },
      ],
    };
  }, [productStats]);

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || "";
            const value = context.raw || 0;
            return `${label}: ${value} 份`;
          },
        },
      },
    },
  };

  return (
    <div className="operation-stats-panel">
      <div className="top-banner">
        <div>
          <h1>營運統計</h1>
          <p>查看店家訂單、收益與商品銷售狀況</p>
        </div>
        <BarChart3 />
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <Clock3 />
          <div>
            <h3>待接單</h3>
            <p>{waitingOrders} 筆</p>
          </div>
        </div>

        <div className="stat-card">
          <ShoppingCart />
          <div>
            <h3>備餐中</h3>
            <p>{preparingOrders} 筆</p>
          </div>
        </div>

        <div className="stat-card">
          <BarChart3 />
          <div>
            <h3>完成率</h3>
            <p>{completedRate}%</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
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

        <div className="stat-card">
          <Clock3 />
          <div>
            <h3>平均客單價</h3>
            <p>{money(averageOrderAmount)}</p>
          </div>
        </div>
      </div>

      <div className="chart-panel">
        <h2 className="section-title">產品銷售統計</h2>

        {productStats.length > 0 ? (
          <div className="pie-wrap">
            <Pie data={pieData} options={pieOptions} />
          </div>
        ) : (
          <div className="empty-box">目前還沒有已完成訂單可統計</div>
        )}
      </div>

      <div className="chart-panel">
        <h2 className="section-title">營運摘要</h2>

        <div className="order-card">
          <p>全部訂單：{vendorOrders.length} 筆</p>
          <p>已完成訂單：{completedVendorOrders.length} 筆</p>
          <p>累積收益：{money(totalRevenue)}</p>
          <p>
            熱銷商品：
            {topProduct ? `${topProduct.name}，共 ${topProduct.qty} 份` : "尚無資料"}
          </p>
        </div>
      </div>

      <div className="chart-panel">
        <h2 className="section-title">商品銷售明細</h2>

        {productStats.length > 0 ? (
          productStats.map((item, index) => (
            <div className="order-card" key={index}>
              <h3>{item.name}</h3>
              <p>銷售數量：{item.qty} 份</p>
              <p>銷售金額：{money(item.revenue)}</p>
            </div>
          ))
        ) : (
          <div className="empty-box">目前沒有商品銷售紀錄</div>
        )}
      </div>
    </div>
  );
}