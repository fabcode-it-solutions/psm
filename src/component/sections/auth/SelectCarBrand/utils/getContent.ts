import { ContentInput, ContentType } from "@/types/build";

export function getContent({
  slug,
  brands,
  models,
  types,
}: ContentInput): ContentType {
  switch (slug) {
    case "brand":
      return {
        carModelsList: brands ?? [],
        heading: "What Brand of car do you own?",
        subheading:
          "Select your car's make, model, and year to help us provide you with the best experience.",
        key: "brand",
      };
    case "model":
      return {
        carModelsList: models ?? [],
        heading: "Choose your car model",
        subheading:
          "Select your car's make, model, and year to help us provide you with the best experience.",
        key: "model",
      };
    case "type":
      return {
        carModelsList: types ?? [],
        heading: "What type of car do you own?",
        subheading:
          "Select your car's make, model, and year to help us provide you with the best experience.",
        key: "type",
      };
    case "licence":
      return {
        carModelsList: [],
        heading: "Please enter your Vehicle Licence plate number",
        subheading:
          "Enter your vehicle's license plate number to help us personalise your experience.",
        key: "licensePlate",
        label: "Licence Plate Number",
        buttonText: "Continue",
        buttonLink: "vin-number",
        tooltipText:
          "Toggling this feature on will keep your identity private while you can off this feature later if you want to!",
        tooltipLabel: "Can’t find your Licence Plate number?",
      };
    case "vin":
      return {
        carModelsList: [],
        heading: "Please enter your VIN number",
        subheading:
          "A Vehicle Identification Number (VIN) is a unique 17-character alpha-numeric identifier affixed to a motor vehicle, trailer or semi-trailer in accordance with international standards to establish a vehicle's identity. ",
        key: "vinNumber",
        label: "VIN Number",
        buttonText: "Continue",
        buttonLink: "vin-number",
        tooltipText:
          "Toggling this feature on will keep your identity private while you can off this feature later if you want to!",
        tooltipLabel: "Can’t find your VIN number?",
      };
    case "location":
      return {
        carModelsList: [],
        heading: "Where Do you Want Parts Sent?",
        subheading:
          "Add your shipping address below or provide it later during purchase.",
        key: "location",
        label: "Address",
        buttonText: "Continue",
        buttonLink: "vin-number",
        placeholder: "Level 13/144 Edward St, Brisbane City QLD 4000",
      };
    case "profile":
      return {
        carModelsList: [],
        heading: "Set Up Your Profile!",
        subheading:
          "Please be aware that your full name will not be shown on your public profile.",
        key: "profile",
        tooltipLabel: "Keep me anonymous",
        tooltipText: "Lorme ",
      };
    case "bio-profile":
      return {
        carModelsList: [],
        heading: "One Last Thing!",
        subheading:
          "Customize your profile to suit your preferences! This data will be displayed in your public profile.",
        key: "bio-profile",
      };

    default:
      return {
        carModelsList: [],
        heading: "",
        subheading: "",
        key: "",
      };
  }
}

export const getCarModelByBrandId = async (brandId: number) => {
  const brandResponse = await fetch(
    "/api/admin/cars/models?brandId=" + brandId,
    {
      next: {
        tags: ["car-models"],
      },
    }
  );

  const models = await brandResponse.json();
  return models.data;
};

export const getCarTypesByModelId = async (modelId: number) => {
  const brandResponse = await fetch(
    "/api/admin/cars/types?modelId=" + modelId,
    {
      next: {
        tags: ["car-models-type"],
      },
    }
  );

  const types = await brandResponse.json();
  return types.data;
};

export const getNextStepHref = (
  step: string,
  brandId: number,
  modelId: number,
  typeId: number
) => {
  const base = "/accounts/profile";
  const query: Record<string, string> = {
    brand: brandId?.toString() || "",
    model: modelId?.toString() || "",
    type: typeId?.toString() || "",
  };

  const stepMap: Record<string, string> = {
    brand: "model",
    model: "type",
    type: "licence",
    licence: "vin",
    vin: "location",
    location: "profile",
    profile: "bio-profile",
  };

  const nextStep = stepMap[step];

  if (!nextStep) return base;

  const params = new URLSearchParams({ step: nextStep });
  if (query.brand) params.append("brand", query.brand);
  if (
    ["type", "licence", "vin", "location", "profile", "bio-profile"].includes(
      nextStep
    ) &&
    query.model
  )
    params.append("model", query.model);
  if (
    ["licence", "vin", "location", "profile", "bio-profile"].includes(
      nextStep
    ) &&
    query.type
  )
    params.append("type", query.type);

  return `${base}?${params.toString()}`;
};
