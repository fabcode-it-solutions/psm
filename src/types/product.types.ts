export type SlideProfile = {
  profilePic: string;
  username: string;
};
export type ProductCardType = {
  id?: number,
  listingLabelTextColor?: string;
  title: string;
  images?: string[];
  medias?: {
    url: string;
    alt: string;
  }[];
  listingCount?: number;
  price: string;
  isWishlisted: boolean;
  listingLabel?: string;
  slug?: string;
  productId?: string;
  link?: string;
  marketplaceId?: number;
  manufacture: {
    logo: string;
    name: string;
    text: string;
    slideProfiles?: SlideProfile;
  };
  slideProfiles?: SlideProfile;
  type: string;
};
