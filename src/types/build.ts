export type BrandType = {
  name?: string;
  logo?: {
    url: string;
  };
  id?: number;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};
export type ModelType = {
  name: string;
  id: number;
   logo?: {
    url: string;
  };
};
export type ModelTypes = {
  name: string;
  id: number;
   logo?: {
    url: string;
  };
};
export type ContentType = {
  carModelsList: BrandType[] | ModelType[] | ModelTypes[] | [];
  heading: string;
  subheading: string;
  key: string;
  label?: string;
  buttonText?: string;
  buttonLink?: string;
  tooltipText?: string;
  tooltipLabel?: string;
  placeholder?: string;
  skip?: string;
};
export type ContentInput = {
  slug: string;
  brands?: BrandType[];
  models?: ModelType[];
  types?: ModelTypes[];
};

export type CreateBuild = {
  userId: number;
  brandId: number;
  modelId: number;
  typeId: number;
  licensePlate?: string;
  vinNumber?: string;
};

export type AddressType = {
  userId: number;
  buildId: number;
  addressLine1: string;
  addressLine2?: string;
  state?: string;
  postalCode?: string;
  type?: string;
};
