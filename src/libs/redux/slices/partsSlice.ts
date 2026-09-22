import { ProductOption } from "@/component/dashboard/parts/Variants";
import { Option } from "@/component/ui/dashboard/TagSelect";
import { SEOMetaType } from "@/types";
import { AdditionalDetail, Metafield, Variant } from "@/types/parts.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
export type Errors = {
  title?: string;
  brandId?: string;
  modelId?: string;
  typeId?: string;
  status?: string;
  manufacturerId?: string;
  listed?: string;
  price?: string;
  compareAtPrice?: string;
  lowStockThreshold?: string;
  option1label?: string;
  option1Values?: string;
  option2label?: string;
  option2Values?: string;
  option3label?: string;
  option3Values?: string;
  additionalfieldsHeadings?: number[];
  additionalfieldsContent?: number[];
};

export type Parts = {
  title?: string;
  slug?: string;
  description?: string;
  status?: "active";
  categoryIds?: number[];
  brandId?: number;
  modelId?: number;
  typeId?: number;
  manufacturerId?: number;
  model?: {
    name?: string;
    id?: number;
  };
  type?: {
    name?: string;
    id?: number;
  };
  brand?: {
    name?: string;
    id?: number;
  };
  manufacturer?: {
    name?: string;
    id?: number;
  };
  tags?: string[];
  listed?: "For Sale" | "Up for Offer";
  media?: {
    id: number;
    order?: number;
    url?: string;
    alt?: string;
  }[];
  price?: number;
  additionalDetails?: AdditionalDetail[];
  options?: ProductOption[];
  variants?: Variant[];
  defaultVariant?: Variant;
  proMetafields?: Metafield[];
  seoMetadata?: SEOMetaType;
  categories?: Option[];
  editTags?: Option[];
};
type PartState = {
  loading: string | boolean;
  part?: Parts;
  errors?: Errors;
};

const initialState: PartState = {
  loading: false,
  part: {
    variants: [],
    additionalDetails: [],
    seoMetadata: {},
    proMetafields: [],
    defaultVariant: {},
    options: [],
  categoryIds: [],     
  },
  errors: {},
};

export const dashboardSlice = createSlice({
  name: "parts",
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<string | boolean>) {
      state.loading = action.payload;
    },
    setPart(state: PartState, action: PayloadAction<PartState["part"]>) {
      state.part = action.payload;
      state.errors = {};
    },
    resetPart<K extends keyof NonNullable<PartState["part"]>>(
      state: PartState,
      action: PayloadAction<{
        key: K;
        value: NonNullable<PartState["part"]>[K];
      }>
    ) {
      state.part = {
        variants: [],
        additionalDetails: [],
        seoMetadata: {},
        proMetafields: [],
        defaultVariant: {},
        options: [],
      };
      if (process.env.NODE_ENV != "production") {
        console.log(action);
      }
      state.errors = {};
    },
    updatePartField<K extends keyof NonNullable<PartState["part"]>>(
      state: PartState,
      action: PayloadAction<{
        key: K;
        value: NonNullable<PartState["part"]>[K];
      }>
    ) {
      if (!state.part) state.part = {};
      state.part[action.payload.key] = action.payload.value;
    },
    updateVariantField<K extends keyof Variant>(
      state: PartState,
      action: PayloadAction<{ index: number; key: K; value: Variant[K] }>
    ) {
      if (state.part?.variants && state.part.variants[action.payload.index]) {
        state.part.variants[action.payload.index][action.payload.key] =
          action.payload.value;
      }
    },
    updateDefaultVariantField<K extends keyof Variant>(
      state: PartState,
      action: PayloadAction<{ key: K; value: Variant[K] }>
    ) {
      if (state.part?.defaultVariant) {
        state.part.defaultVariant[action.payload.key] = action.payload.value;
      }
    },
    addVariants(state: PartState, action: PayloadAction<Variant[]>) {
      if (!state.part) state.part = {};
      if (!state.part.variants) state.part.variants = [];
      if (state.part?.variants) {
        state.part.variants = action.payload;
      }
    },
    addDefaultVariantField(state: PartState, action: PayloadAction<Variant>) {
      if (state.part?.defaultVariant) {
        state.part.defaultVariant = action.payload;
      }
    },
    updateAdditionalDetailField<K extends keyof AdditionalDetail>(
      state: PartState,
      action: PayloadAction<{
        index: number;
        key: K;
        value: AdditionalDetail[K];
      }>
    ) {
      if (
        state.part?.additionalDetails &&
        state.part.additionalDetails[action.payload.index]
      ) {
        state.part.additionalDetails[action.payload.index][action.payload.key] =
          action.payload.value;
      }
    },
    addAdditionalDetail(
      state: PartState,
      action: PayloadAction<AdditionalDetail>
    ) {
      if (!state.part) state.part = {};
      if (!state.part.additionalDetails) state.part.additionalDetails = [];
      state.part.additionalDetails.push(action.payload);
    },
    removeAdditionalDetail(state: PartState, action: PayloadAction<number>) {
      if (state.part?.additionalDetails) {
        state.part.additionalDetails.splice(action.payload, 1);
      }
    },
    updateSeoFields<K extends keyof NonNullable<SEOMetaType>>(
      state: PartState,
      action: PayloadAction<{
        key: K;
        value: NonNullable<SEOMetaType>[K];
      }>
    ) {
      if (!state.part) state.part = { seoMetadata: {} };
      if (state.part.seoMetadata) {
        state.part.seoMetadata[action.payload.key] = action.payload.value;
      }
    },

    removeMetafield(state: PartState, action: PayloadAction<number>) {
      if (state.part?.proMetafields) {
        state.part.proMetafields.splice(action.payload, 1);
      }
    },

    addMetafield(state: PartState, action: PayloadAction<Metafield>) {
      if (!state.part) state.part = {};
      if (!state.part.proMetafields) state.part.proMetafields = [];
      state.part.proMetafields.push(action.payload);
    },

    updateMetafieldField<K extends keyof Metafield>(
      state: PartState,
      action: PayloadAction<{
        definitionId?: number;
        key?: K;
        value?: Metafield[K];
        data?: PayloadAction<Metafield>;
      }>
    ) {
      const is = state.part?.proMetafields?.find(
        (item) => item.metafieldDefinitionId == action.payload.definitionId
      );
      if (
        state.part?.proMetafields &&
        is &&
        action?.payload?.key &&
        action.payload.value
      ) {
        is[action?.payload?.key] = action.payload.value;
      } else {
        if (state?.part?.proMetafields && action.payload.data?.payload) {
          state.part.proMetafields.push(action.payload.data?.payload);
        }
      }
    },
    addOptions(state: PartState, action: PayloadAction<ProductOption>) {
      if (!state.part) state.part = {};
      if (!state.part.options) state.part.options = [];
      if (state.part?.options) {
        state.part.options?.push(action.payload);
      }
    },
    removeOptionByName(state: PartState, action: PayloadAction<string>) {
      if (state.part?.options) {
        console.log(state.part.options);
        if (state.part.options.length == 1) {
          state.part.variants = [];
        }
        state.part.options = state.part.options.filter(
          (opt) => opt.id !== action.payload
        );
      }
    },
    updateOptionsField<K extends keyof ProductOption>(
      state: PartState,
      action: PayloadAction<{
        id?: string;
        key?: K;
        value?: ProductOption[K];
        data?: PayloadAction<Metafield>;
      }>
    ) {
      const is = state.part?.options?.find(
        (item) => item.id == action.payload.id
      );
      if (
        state.part?.options &&
        is &&
        action?.payload?.key &&
        action.payload.value != undefined
      ) {
        is[action?.payload?.key] = action.payload.value;
      }
    },
    updateErrors<K extends keyof Errors>(
      state: PartState,
      action: PayloadAction<{
        id?: string;
        key?: K;
        value?: Errors[K];
      }>
    ) {
      if (
        state.errors &&
        action?.payload?.key &&
        action.payload.value != undefined
      ) {
        state.errors[action?.payload?.key] = action.payload.value;
      }
    },
    setAdditionalDetails(state, action: PayloadAction<AdditionalDetail[]>) {
      state.part!.additionalDetails = action.payload;
    },
  },
});

export const {
  setLoading,
  updatePartField,
  updateVariantField,
  updateAdditionalDetailField,
  addAdditionalDetail,
  removeAdditionalDetail,
  updateSeoFields,
  updateMetafieldField,
  removeMetafield,
  addMetafield,
  updateDefaultVariantField,
  addDefaultVariantField,
  addVariants,
  addOptions,
  removeOptionByName,
  updateOptionsField,
  updateErrors,
  resetPart,
  setPart,
  setAdditionalDetails,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
