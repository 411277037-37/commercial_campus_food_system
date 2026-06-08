import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "./firebase";
import LoginPage from "./components/LoginPage";
import StudentPage from "./components/StudentPage";
import VendorPage from "./components/VendorPage";
import StudentOrders from "./components/StudentOrders";
import { shopsData } from "./data/shopsData";

export default function App() {
  const [page, setPage] = useState("login");

  const [currentStudent, setCurrentStudent] = useState(() => {
    const savedStudent = localStorage.getItem("currentStudent");

    return savedStudent
      ? JSON.parse(savedStudent)
      : null;
  });

  const [shops, setShops] = useState(() => {
    const savedShops = localStorage.getItem("shops");

    if (!savedShops) {
      return shopsData;
    }

    const parsedShops = JSON.parse(savedShops);

    return parsedShops.map((savedShop) => {
      const originalShop = shopsData.find(
        (shop) => shop.id === savedShop.id
      );

      return {
        ...savedShop,
        image: originalShop?.image || savedShop.image,
      };
    });
  });

  const [selectedShop, setSelectedShop] = useState(null);

  const [orders, setOrders] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pickupTime, setPickupTime] = useState("");

  const [vendorShopId, setVendorShopId] = useState(null);
  const [vendorUsername, setVendorUsername] = useState("");
  const [vendorPassword, setVendorPassword] = useState("");
  const [vendorLogin, setVendorLogin] = useState(false);

  const [showMyOrders, setShowMyOrders] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const firebaseOrders = snapshot.docs.map((docItem) => ({
        firebaseId: docItem.id,
        ...docItem.data(),
      }));

      setOrders(firebaseOrders);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("shops", JSON.stringify(shops));
  }, [shops]);

  useEffect(() => {
    localStorage.setItem(
      "currentStudent",
      JSON.stringify(currentStudent)
    );
  }, [currentStudent]);

  useEffect(() => {
    const handlePopState = () => {
      setShowMyOrders(false);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const openMyOrders = () => {
    setShowMyOrders(true);
    window.history.pushState({ page: "studentOrders" }, "", "#my-orders");
  };

  const closeMyOrders = () => {
    setShowMyOrders(false);

    if (window.location.hash === "#my-orders") {
      window.history.back();
    }
  };

  const increaseQty = (index) => {
    if (!selectedShop) return;

    const updatedShop = {
      ...selectedShop,
      foods: selectedShop.foods.map((food, i) =>
        i === index ? { ...food, qty: food.qty + 1 } : food
      ),
    };

    setSelectedShop(updatedShop);
  };

  const decreaseQty = (index) => {
    if (!selectedShop) return;

    const updatedShop = {
      ...selectedShop,
      foods: selectedShop.foods.map((food, i) =>
        i === index && food.qty > 0
          ? { ...food, qty: food.qty - 1 }
          : food
      ),
    };

    setSelectedShop(updatedShop);
  };

  const submitOrder = async () => {
    if (!selectedShop) return;

    if (!currentStudent) {
      alert("請先登入學生帳號");
      return;
    }

    const selectedFoods = selectedShop.foods.filter((food) => food.qty > 0);

    if (selectedFoods.length === 0) {
      alert("請先選擇餐點");
      return;
    }

    const hasSoldOutFood = selectedFoods.some((food) => food.soldOut);

    if (hasSoldOutFood) {
      alert("訂單中有餐點已售完，請重新選擇");
      return;
    }

    if (!pickupTime) {
      alert("請選擇取餐時間");
      return;
    }

    const total = selectedFoods.reduce(
      (sum, item) => sum + item.price * item.qty,
      0
    );

    const newOrder = {
      id: Date.now(),
      studentId: currentStudent.studentId,
      studentNickname: currentStudent.nickname,
      shopId: selectedShop.id,
      shop: selectedShop.name,
      items: selectedFoods.map((item) => ({
        name: item.name,
        price: item.price,
        qty: item.qty,
      })),
      total,
      pickupTime,
      estimatedMinutes:
        orders.filter(
          (order) =>
            order.shopId === selectedShop.id &&
            order.status !== "已完成"
        ).length *
          5 +
        5,
      isNew: true,
      status: "已下單",
      number: Math.floor(Math.random() * 900 + 100),
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    try {
      await addDoc(collection(db, "orders"), newOrder);
      setShowConfirm(true);
    } catch (error) {
      console.error("新增訂單失敗：", error);
      alert("訂單送出失敗，請稍後再試");
    }
  };

  if (page === "login") {
    return (
      <LoginPage
        setPage={setPage}
        setVendorLogin={setVendorLogin}
        setCurrentStudent={setCurrentStudent}
      />
    );
  }

  if (page === "vendor") {
    return (
      <VendorPage
        setPage={setPage}
        shops={shops}
        setShops={setShops}
        orders={orders}
        setOrders={setOrders}
        vendorShopId={vendorShopId}
        setVendorShopId={setVendorShopId}
        vendorUsername={vendorUsername}
        setVendorUsername={setVendorUsername}
        vendorPassword={vendorPassword}
        setVendorPassword={setVendorPassword}
        vendorLogin={vendorLogin}
        setVendorLogin={setVendorLogin}
      />
    );
  }

  return (
    <>
      {showMyOrders ? (
        <StudentOrders
          orders={orders}
          currentStudent={currentStudent}
          setShowMyOrders={closeMyOrders}
        />
      ) : (
        <StudentPage
          setPage={setPage}
          shops={shops}
          selectedShop={selectedShop}
          setSelectedShop={setSelectedShop}
          orders={orders}
          setOrders={setOrders}
          showConfirm={showConfirm}
          setShowConfirm={setShowConfirm}
          pickupTime={pickupTime}
          setPickupTime={setPickupTime}
          increaseQty={increaseQty}
          decreaseQty={decreaseQty}
          submitOrder={submitOrder}
          setShowMyOrders={openMyOrders}
          setShops={setShops}
          currentStudent={currentStudent}
          setCurrentStudent={setCurrentStudent}
        />
      )}
    </>
  );
}