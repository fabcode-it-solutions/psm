import React from "react";
import Image from "next/image";
const ProductMainImage = () => {
  return (
      <div className="w-[55.1724138%] max-des-sm:w-full aspect-[766/661]">
        <Image
          src="https://overlap-asset.s3.ap-south-1.amazonaws.com/images/image_10_1755608514115.png"
          alt="Product main Image"
          width={766}
          height={662}
          className="w-[115.70997%] aspect-[766/661] "
        />
      </div>
  );
};

export default ProductMainImage;
