import { Star, StarHalf } from "lucide-react";

export function renderStars(
  rating: number,
  size: "sm" | "md" | "lg" = "md"
) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };
  const className = sizeClasses[size];

  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <Star
        key={i}
        className={`${className} fill-yellow-400 text-yellow-400`}
      />
    );
  }
  if (hasHalfStar) {
    stars.push(
      <StarHalf
        key="half"
        className={`${className} fill-yellow-400 text-yellow-400`}
      />
    );
  }
  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars.push(
      <Star key={`empty-${i}`} className={`${className} text-gray-300`} />
    );
  }
  return stars;
}

