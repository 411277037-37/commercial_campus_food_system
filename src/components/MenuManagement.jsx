export default function MenuManagement({
  shops,
  setShops,
  vendorShop,
  newFoodName,
  setNewFoodName,
  newFoodPrice,
  setNewFoodPrice,
  newFoodNote,
  setNewFoodNote,
}) {
  return (
    <div className="menu-manage-panel">
      <div className="menu-header">
        <h2>菜單管理</h2>
      </div>

      {shops
        .find((shop) => shop.name === vendorShop)
        ?.foods.map((food, index) => (
          <div className="manage-food-card" key={index}>
            <div>
              <h3>{food.name}</h3>
              <p>NT$ {food.price}</p>
              {food.note && <p>備註：{food.note}</p>}
            </div>

            <div className="manage-actions">
              <button
                className="delete-btn"
                onClick={() => {
                  const updated = [...shops];
                  const shopIndex = updated.findIndex(
                    (shop) => shop.name === vendorShop
                  );
                  updated[shopIndex].foods.splice(index, 1);
                  setShops(updated);
                }}
              >
                刪除
              </button>

              <button
                className="note-btn"
                onClick={() => {
                  const note = prompt("輸入備註");
                  const updated = [...shops];
                  const shopIndex = updated.findIndex(
                    (shop) => shop.name === vendorShop
                  );
                  updated[shopIndex].foods[index].note = note;
                  setShops(updated);
                }}
              >
                新增備註
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
          onClick={() => {
            if (!newFoodName || !newFoodPrice) {
              alert("請輸入餐點名稱與價格");
              return;
            }

            const updated = [...shops];
            const shopIndex = updated.findIndex(
              (shop) => shop.name === vendorShop
            );

            updated[shopIndex].foods.push({
              name: newFoodName,
              price: Number(newFoodPrice),
              qty: 0,
              note: newFoodNote,
            });

            setShops(updated);
            setNewFoodName("");
            setNewFoodPrice("");
            setNewFoodNote("");
          }}
        >
          新增餐點
        </button>
      </div>
    </div>
  );
}