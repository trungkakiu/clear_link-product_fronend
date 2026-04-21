import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProductSkeleton = () => {
  return (
    <div className="p-4">
      <Skeleton height={400} borderRadius={15} className="mb-3" />

      <Skeleton width="60%" height={30} className="mb-2" />

      <Skeleton width="30%" height={25} className="mb-4" />

      <Row>
        <Col xs={6}>
          <Skeleton height={60} borderRadius={10} />
        </Col>
        <Col xs={6}>
          <Skeleton height={60} borderRadius={10} />
        </Col>
      </Row>

      <div className="mt-4">
        <Skeleton count={3} /> {/* Tự tạo 3 dòng mô tả mờ mờ */}
      </div>
    </div>
  );
};

export default { ProductSkeleton };
