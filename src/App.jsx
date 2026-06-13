import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  setDoc,
  doc,
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

    return savedStudent ? JSON.parse(savedStudent) : null;
  });

  const [shops, setShops] = useState(shopsData);

  const [selectedShop, setSelectedShop] = useState(null);

  const [orders, setOrders] = useState([]);

  const [showConfirm, setShowConfirm] = useState(false);
  const [pickupTime, setPickupTime] = useState("");

  const [pendingOrder, setPendingOrder] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

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
    const unsubscribe = onSnapshot(collection(db, "shops"), async (snapshot) => {
      if (snapshot.empty) {
        await Promise.all(
          shopsData.map((shop) =>
            setDoc(doc(db, "shops", String(shop.id)), {
              ...shop,
              image: "",
            })
          )
        );

        return;
      }

      const firebaseShops = snapshot.docs.map((docItem) => {
        const data = docItem.data();

        const originalShop = shopsData.find(
          (shop) => shop.id === data.id
        );

        return {
          ...data,
          image: originalShop?.image || data.image,
        };
      });

      setShops(
        firebaseShops.sort((a, b) => a.id - b.id)
      );
    });

    return () => unsubscribe();
  }, []);

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

  useEffect(() => {
    if (!selectedShop) return;

    const latestShop = shops.find(
      (shop) => shop.id === selectedShop.id
    );

    if (latestShop) {
      setSelectedShop(latestShop);
    }
  }, [shops]);

  const updateShops = (value) => {
    setShops((prevShops) => {
      const newShops =
        typeof value === "function" ? value(prevShops) : value;

      Promise.all(
        newShops.map((shop) => {
          const { image, ...shopData } = shop;

          return setDoc(doc(db, "shops", String(shop.id)), {
            ...shopData,
            image: "",
          });
        })
      ).catch((error) => {
        console.error("更新店家資料失敗：", error);
        alert("店家資料更新失敗，請稍後再試");
      });

      return newShops;
    });
  };

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

  const submitOrder = () => {
    if (!selectedShop) return;

    if (!currentStudent) {
      alert("請先登入學生帳號");
      return;
    }

    if (showConfirm) {
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

    const unfinishedOrders = orders.filter((order) => {
      const isSameShop =
        String(order.shopId) === String(selectedShop.id) ||
        order.shop === selectedShop.name;

      return isSameShop && order.status !== "已完成";
    });

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
      estimatedMinutes: unfinishedOrders.length * 5 + 5,
      isNew: true,
      status: "已下單",
      number: Math.floor(Math.random() * 900 + 100),
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    setPendingOrder(newOrder);
    setShowConfirm(true);
  };

  const cancelPendingOrder = () => {
    setPendingOrder(null);
    setShowConfirm(false);
  };

  const confirmOrder = async () => {
    if (!pendingOrder) return;

    if (isSubmittingOrder) return;

    try {
      setIsSubmittingOrder(true);

      await addDoc(collection(db, "orders"), pendingOrder);

      alert("訂單已成功送出！");

      setPendingOrder(null);
      setShowConfirm(false);
      setSelectedShop(null);
      setPickupTime("");
    } catch (error) {
      console.error("訂單送出失敗：", error);
      alert("訂單送出失敗，請稍後再試");
    } finally {
      setIsSubmittingOrder(false);
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
        setShops={updateShops}
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
          pendingOrder={pendingOrder}
          confirmOrder={confirmOrder}
          cancelPendingOrder={cancelPendingOrder}
          isSubmittingOrder={isSubmittingOrder}
          setShowMyOrders={openMyOrders}
          setShops={updateShops}
          currentStudent={currentStudent}
          setCurrentStudent={setCurrentStudent}
        />
      )}
    </>
  );
}