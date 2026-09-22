import { Errors } from "@/libs/redux/slices/partsSlice";

export const getStatusBadge = (status: string) => {
  const colors = {
    active: "bg-green-500/20 text-green-400",
    draft: "bg-yellow-500/20 text-yellow-400",
    archived: "bg-gray-500/20 text-gray-400",
  };
  return colors[status as keyof typeof colors] || colors.draft;
};

export const getInventoryStatus = (inventory: number) => {
  if (inventory === 0) return { label: "Out of Stock", color: "text-red-400" };
  if (inventory <= 10) return { label: "Low Stock", color: "text-yellow-400" };
  return { label: "In Stock", color: "text-green-400" };
};

export const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const columns = [
  {
    key: "logo",
    label: "Logo",
    sortable: false,
    align: "text-left",
  },
  {
    key: "name",
    label: "Brand Name",
    sortable: true,
    align: "text-left",
  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    align: "text-left",
  },
  {
    key: "buildsCount",
    label: "Builds Count",
    sortable: false,
    align: "text-left",
  },
  {
    key: "createdAt",
    label: "Created",
    sortable: true,
    align: "text-left",
  },
  {
    key: "actions",
    label: "Actions",
    sortable: false,
    align: "text-right",
  },
];

export const normalize = (value: string | undefined | null) =>
  (value ?? "").trim();

export const REASON_OPTIONS = [
  { label: "Spam", value: "spam" },
  { label: "Harassment / Bullying", value: "harassment" },
  { label: "Inappropriate Content", value: "inappropriate_content" },
  { label: "Fake Profile / Impersonation", value: "fake_profile" },
  { label: "Scam or Fraud", value: "scam_or_fraud" },
  { label: "Violence or Harm", value: "violence_or_harm" },
  { label: "Misinformation", value: "misinformation" },
  { label: "Other", value: "other" },
];

export const CATEGORY_OPTIONS = [
  { label: "Behavior", value: "behavior" },
  { label: "Content", value: "content" },
  { label: "Security", value: "security" },
  { label: "Integrity", value: "integrity" },
  { label: "Safety", value: "safety" },
  { label: "Other", value: "other" },
];

export const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
  { value: "sold", label: "Sold" },
  { value: "pending", label: "Pending" },
];

export const priceRangeOptions = [
  { value: "all", label: "All Prices" },
  { value: "0-100", label: "$0 - $100" },
  { value: "100-500", label: "$100 - $500" },
  { value: "500-1000", label: "$500 - $1,000" },
  { value: "1000-5000", label: "$1,000 - $5,000" },
  { value: "5000+", label: "$5,000+" },
];

export const inventoryStatusOptions = [
  { value: "all", label: "All Inventory" },
  { value: "in-stock", label: "In Stock" },
  { value: "low-stock", label: "Low Stock" },
  { value: "out-of-stock", label: "Out of Stock" },
];

export const dateRangeOptions = [
  { value: "all", label: "All Dates" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "quarter", label: "This Quarter" },
  { value: "year", label: "This Year" },
];

export const itemsPerPageOptions = [
  { value: "10", label: "10 per page" },
  { value: "25", label: "25 per page" },
  { value: "50", label: "50 per page" },
  { value: "100", label: "100 per page" },
];

export const ErrorsList: { label: string; key: keyof Errors }[] = [
  {
    label: "Title is required",
    key: "title",
  },
  {
    label: "Brand is required",
    key: "brandId",
  },
  {
    label: "Model is required",
    key: "modelId",
  },
  {
    label: "Type is required",
    key: "typeId",
  },
  {
    label: "Status is required",
    key: "status",
  },
  {
    label: "Manufacturer is required",
    key: "manufacturerId",
  },
  {
    label: "Listed is required",
    key: "listed",
  },
];

export const carNames = [
  "GearShifter",
  "TurboBoost",
  "NitroRider",
  "SpeedDrift",
  "ClutchMaster",
  "WheelSpin",
  "ExhaustKing",
  "PistonPower",
  "IgnitionX",
  "V8Beast",
  "RevMachine",
  "TorqueLord",
  "DriftHunter",
  "StreetRacer",
  "BurnoutBoss",
  "TireScreech",
  "FuelJunkie",
  "Overdrive",
  "FastLane",
  "CruiseControl",
  "MotorHead",
  "AsphaltRider",
  "HighOctane",
  "GearGrinder",
  "SpeedDemon",
  "Dragster",
  "RoadBlazer",
  "ShiftStorm",
  "NitroBlaze",
  "RPMWizard",
  "HorsePower",
  "PitStopper",
  "HighGear",
  "DriftKing",
  "OverRev",
  "EngineFury",
  "ClutchKick",
  "RoadRunner",
  "TunedUp",
  "AutoPilot",
  "Camshaft",
  "ExhaustFlow",
  "FuelInjector",
  "StreetKing",
  "TrackBeast",
  "ZeroToSixty",
  "RevLimiter",
  "GearBoxer",
  "SpeedShift",
  "Redline",
  "TorqueStorm",
];