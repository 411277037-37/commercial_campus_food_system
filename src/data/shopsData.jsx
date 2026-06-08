import guandong from "../assets/關東煮.jpg";
import drink from "../assets/飲料店.jpg";
import hotpot from "../assets/鍋燒.jpg";
import donburi from "../assets/丼飯.jpg";
import breakfast from "../assets/早餐.png";

export const vendorAccounts = [
  { shop: "關東煮", username: "oden", password: "1234" },
  { shop: "丼飯", username: "don", password: "1234" },
  { shop: "早餐店", username: "breakfast", password: "1234" },
  { shop: "飲料店", username: "drink", password: "1234" },
  { shop: "鍋燒", username: "hotpot", password: "1234" },
];

export const shopsData = [
  {
    id: 1,
    name: "關東煮",
    image: guandong,
    rating: 0,
    reviews: [],
    notice: "",
    foods: [
      { name: "米血", price: 20, qty: 0, soldOut: false },
      { name: "白蘿蔔", price: 15, qty: 0, soldOut: false },
      { name: "黑輪", price: 20, qty: 0, soldOut: false },
      { name: "玉米", price: 30, qty: 0, soldOut: false },
      { name: "香菇", price: 20, qty: 0, soldOut: false },
      { name: "高麗菜", price: 25, qty: 0, soldOut: false },
      { name: "冬粉", price: 25, qty: 0, soldOut: false },
      { name: "烏龍麵", price: 35, qty: 0, soldOut: false },
    ],
  },
  {
    id: 2,
    name: "丼飯",
    image: donburi,
    rating: 0,
    reviews: [],
    notice: "",
    foods: [
      { name: "牛丼", price: 120, qty: 0, soldOut: false },
      { name: "豬肉丼", price: 110, qty: 0, soldOut: false },
      { name: "海鮮丼", price: 150, qty: 0, soldOut: false },
    ],
  },
  {
    id: 3,
    name: "早餐店",
    image: breakfast,
    rating: 0,
    reviews: [],
    notice: "",
    foods: [
      { name: "原味蛋餅", price: 35, qty: 0, soldOut: false },
      { name: "玉米蛋餅", price: 45, qty: 0, soldOut: false },
      { name: "鮪魚蛋餅", price: 55, qty: 0, soldOut: false },
      { name: "紅茶", price: 20, qty: 0, soldOut: false },
      { name: "豆漿", price: 25, qty: 0, soldOut: false },
      { name: "奶茶", price: 30, qty: 0, soldOut: false },
    ],
  },
  {
    id: 4,
    name: "飲料店",
    image: drink,
    rating: 0,
    reviews: [],
    notice: "",
    foods: [
      { name: "紅茶", price: 25, qty: 0, soldOut: false },
      { name: "綠茶", price: 25, qty: 0, soldOut: false },
      { name: "檸檬汁", price: 40, qty: 0, soldOut: false },
      { name: "珍珠奶茶", price: 60, qty: 0, soldOut: false },
    ],
  },
  {
    id: 5,
    name: "鍋燒",
    image: hotpot,
    rating: 0,
    reviews: [],
    notice: "",
    foods: [
      { name: "原味鍋燒", price: 90, qty: 0, soldOut: false },
      { name: "沙茶鍋燒", price: 100, qty: 0, soldOut: false },
      { name: "泡菜鍋燒", price: 110, qty: 0, soldOut: false },
      { name: "牛奶鍋燒", price: 120, qty: 0, soldOut: false },
    ],
  },
];