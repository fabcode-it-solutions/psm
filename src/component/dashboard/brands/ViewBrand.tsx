import Accordion from "@/component/sections/marketPlace/Accordion";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import { Brand } from "@/types/brands.types";
import { formatDate, getStatusBadge } from "@/utils/defaults";
import Image from "next/image";
import React from "react";

type B = {
  viewBrand: Brand | null;
  showCreateModal: boolean;
  setShowCreateModal: (v: boolean) => void;
};

const ViewBrand = ({ showCreateModal, setShowCreateModal, viewBrand }: B) => {
  // ✅ multiple accordions open
  const [openModels, setOpenModels] = React.useState<number[]>([]);

  const toggleModel = (index: number) => {
    setOpenModels((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div>
      <DialogPopup
        heading="Brand Details"
        open={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      >
        {viewBrand && (
          <div className="space-y-6 flex gap-4 flex-wrap">
            {/* Brand Image */}
            {viewBrand.image && (
              <div className="flex-1 max-tab-md:flex-none max-tab-md:w-full">
                <Image
                  src={
                    typeof viewBrand.image === "object" && viewBrand.image
                      ? viewBrand.image.url
                      : ""
                  }
                  alt={
                    typeof viewBrand.image === "object" && viewBrand.image
                      ? viewBrand.image.alt ?? ""
                      : ""
                  }
                  width={700}
                  height={450}
                  className="w-full h-[300px] max-tab-md:h-auto rounded-lg object-cover border border-gray-5/20"
                />
              </div>
            )}

            <div className="flex-1">
              {/* Brand Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Brand Name
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {viewBrand.name}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Status
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-sofia-sans ${getStatusBadge(
                      viewBrand.status
                    )}`}
                  >
                    {viewBrand.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                {viewBrand.description && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                      Description
                    </h3>
                    <p className="text-light-100 font-sofia-sans">
                      {viewBrand.description}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Created
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {formatDate(viewBrand.createdAt)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Updated
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {formatDate(viewBrand.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Logo */}
              {viewBrand.logo && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-4 mb-3 font-sofia-sans">
                    Images
                  </h3>
                  <Image
                    src={
                      typeof viewBrand.logo === "object" && viewBrand.logo
                        ? viewBrand.logo.url
                        : ""
                    }
                    alt={
                      typeof viewBrand.logo === "object" && viewBrand.logo
                        ? viewBrand.logo.alt ?? ""
                        : ""
                    }
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-5/20"
                  />
                </div>
              )}

              {/* Models Accordion */}
              <div className="grid gap-3 pt-4 bg-gray-5/10 border border-gray-5/20 rounded-lg p-4 mt-4">
                <div className="text-base text-light-100 font-sofia-sans">
                  Models
                </div>

                {viewBrand.models?.map((model, modelIndex) => (
                  <Accordion
                    key={`model-${modelIndex}`}
                    id={`model-${modelIndex}`}
                    label={`${modelIndex + 1}. ${model.name}`}
                    open={openModels.includes(modelIndex)}
                    textColor="text-white"
                    onToggle={() => toggleModel(modelIndex)}
                  >
                    {model.variants && model.variants.length > 0 ? (
                      <div className="rounded-md border border-gray-5/20 mt-2">
                        {model.variants.map((variant, variantIndex) => (
                          <div
                            key={`variant-${variantIndex}`}
                            className="text-sm text-light-100 font-sofia-sans border-b last:border-0 border-gray-5/20 p-3"
                          >
                            {variantIndex + 1}. {variant.name}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-4 font-sofia-sans py-2">
                        No variants available
                      </div>
                    )}
                  </Accordion>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogPopup>
    </div>
  );
};

export default ViewBrand;
