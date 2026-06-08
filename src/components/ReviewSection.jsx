import { useState } from "react";

export default function ReviewSection({
  selectedShop,
  shops,
  setShops,
  currentStudent
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const submitReview = () => {
    if (!currentStudent) {
      alert("請先登入學生帳號");
      return;
    }

    if (!comment.trim()) {
      alert("請輸入評論內容");
      return;
    }

    const updatedShops = shops.map((shop) => {
      if (shop.id === selectedShop.id) {
        const oldReviews = shop.reviews || [];

        const newReview = {
          id: Date.now(),
          studentId: currentStudent.studentId,
          nickname: currentStudent.nickname,
          rating,
          comment,
          reply: ""
        };

        const newReviews = [...oldReviews, newReview];

        const avgRating =
          newReviews.reduce((sum, item) => sum + item.rating, 0) /
          newReviews.length;

        return {
          ...shop,
          reviews: newReviews,
          rating: Number(avgRating.toFixed(1))
        };
      }

      return shop;
    });

    setShops(updatedShops);
    setComment("");
    setRating(5);

    alert("評論已送出！");
  };

  return (
    <div className="review-panel">
      <h2>店家評論</h2>

      <div className="star-select">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={star <= rating ? "star active" : "star"}
            onClick={() => setRating(star)}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        placeholder="輸入你的評論..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        className="submit-review-btn"
        onClick={submitReview}
      >
        送出評論
      </button>

      <div className="review-list">
        {(selectedShop.reviews || []).length === 0 ? (
          <p className="empty-review">目前尚無評論</p>
        ) : (
          selectedShop.reviews.map((review) => (
            <div className="review-card" key={review.id}>
              <div className="review-user-row">
                <strong>
                  {review.nickname || "匿名學生"}
                </strong>

                <span className="review-stars">
                  {"★".repeat(review.rating)}
                </span>
              </div>

              <p>
                {review.comment}
              </p>

              {
                review.reply && (
                  <div className="vendor-reply">
                    <strong>
                      店家回覆：
                    </strong>

                    <p>
                      {review.reply}
                    </p>
                  </div>
                )
              }
            </div>
          ))
        )}
      </div>
    </div>
  );
}