import ListingCard from "@/component/products/ListingCard";

export default function ListingPage() {
  return (
    <ListingCard
      slug=""
      images={[
        "https://overlap-asset.s3.ap-south-1.amazonaws.com/images/image_10_1755608514115.png",
        "/assets/images/wheel3.png",
        "/assets/images/products/image 14.png",
        "/assets/images/products/image 11.png",
        "https://overlap-asset.s3.ap-south-1.amazonaws.com/images/image_10_1755608514115.png",
        "/assets/images/products/image 11.png",
      ]}
      breadcrumb={["Home", "Cars", "Toyota"]}
      productName="RAYS Volk Racing TE37V Mark II"
      brandImage="/images/toyota-logo.png"
      listingsCount={15}
      condition="Used"
      pcd=" 5 x 100"
      pairInfo="Pair "
      sizeInfo="Size 18"
      lastSalePrice="$2,000"
      // priceChange={{ amount: "-$2,285 ", percent: "27%" }}
      buyLink="/buy-now"
      suggestPriceLink="/suggest-price"
      user={{
        name: "John Doe",
        profileImage: "/images/profile.jpg",
        registeredSince: " 2012",
        listingsCount: 25,
        onlineStatus: " Online Today",
      }}
      accordionItems={[
        {
          value: "item-1",
          title: "Details",
          content:
            "The VOLK RACING Wheel brand represents the benchmark for forged sport wheels that leverage racing technology. The lightness and strength of VOLK RACING wheels has been attained by applying the latest technologies, coupled with real world testing in high pressure motorsport environments. World renowned for making the highest quality motorsport wheels, Rays brings their hard won knowledge and experience to every wheel they make – and the VOLK line of wheels is at the top of the tree. All of Rays Engineering wheels undergo stringent testing, far exceeding the minimum quality controls laid down to receive JWL certification. All of Rays forged wheels must exceed Rays own internal JWL+R Spec 2 standards – the world’s most stringent standard for wheel manufacturing. As an example, the JWL standards require a wheel to undergo a radial stress test for a minimum of 500,000 rotations – JWL+R Spec 2 sees the wheel do 1,000,000 rotations.",
        },
        {
          value: "item-2",
          title: "Features",
          content:
            "The VOLK RACING Wheel brand represents the benchmark for forged sport wheels that leverage racing technology...",
        },
        {
          value: "item-3",
          title: "Specifications",
          content:
            "The VOLK RACING Wheel brand represents the benchmark for forged sport wheels that leverage racing technology...",
        },
        {
          value: "item-4",
          title: "Condition",
          content:
            "The VOLK RACING Wheel brand represents the benchmark for forged sport wheels that leverage racing technology...",
        },
        {
          value: "item-5",
          title: "Compatible Vehicles",
          content:
            "The VOLK RACING Wheel brand represents the benchmark for forged sport wheels that leverage racing technology...",
        },
        {
          value: "item-6",
          title: "How to Install",
          content: "",
        },
      ]}
    />
  );
}
