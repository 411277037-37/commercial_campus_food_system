import { vendorAccounts } from "../data/shopsData";

export default function VendorLogin({
  vendorShop,
  setVendorShop,
  vendorUsername,
  setVendorUsername,
  vendorPassword,
  setVendorPassword,
  setVendorLogin,
}) {
  return (
    <div className="vendor-login-card">
      <h2>店家登入</h2>

      <select value={vendorShop} onChange={(e) => setVendorShop(e.target.value)}>
        <option value="">請選擇店家</option>
        {vendorAccounts.map((vendor, index) => (
          <option key={index} value={vendor.shop}>
            {vendor.shop}
          </option>
        ))}
      </select>

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
        onClick={() => {
          const found = vendorAccounts.find(
            (vendor) =>
              vendor.shop === vendorShop &&
              vendor.username === vendorUsername &&
              vendor.password === vendorPassword
          );

          if (found) {
            setVendorLogin(true);
          } else {
            alert("帳號或密碼錯誤");
          }
        }}
      >
        登入
      </button>
    </div>
  );
}