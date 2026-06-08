export default function VendorReviews({
  shops,
  setShops,
  vendorShop
}) {
  const currentShop =
    shops.find((shop) => shop.name === vendorShop);

  const reviews = currentShop?.reviews || [];

  const replyReview = (reviewId) => {
    const reply = prompt("請輸入店家回覆");

    if (!reply) {
      return;
    }

    const updatedShops = shops.map((shop) => {
      if (shop.name === vendorShop) {
        return {
          ...shop,
          reviews: shop.reviews.map((review) => {
            if (review.id === reviewId) {
              return {
                ...review,
                reply: reply
              };
            }

            return review;
          })
        };
      }

      return shop;
    });

    setShops(updatedShops);
  };

  return (
    <div className="vendor-reviews-panel">

      <h2>顧客評論</h2>

      <p className="vendor-rating">
        平均評分：
        {
          currentShop?.rating > 0
            ? `★ ${currentShop.rating}`
            : "尚無評價"
        }
      </p>

      {
        reviews.length === 0 ? (

          <div className="empty-box">
            目前尚無評論
          </div>

        ) : (

          reviews.map((review) => (

            <div
              className="vendor-review-card"
              key={review.id}
            >

              <p className="review-stars">
                {"★".repeat(review.rating)}
              </p>

              <p>
                {review.comment}
              </p>

              {
                review.reply && (

                  <div className="vendor-reply">
                    <strong>店家回覆：</strong>
                    <p>{review.reply}</p>
                  </div>

                )
              }

              <button
                className="note-btn"
                onClick={() => replyReview(review.id)}
              >
                回覆評論
              </button>

            </div>

          ))

        )
      }

    </div>
  );
}