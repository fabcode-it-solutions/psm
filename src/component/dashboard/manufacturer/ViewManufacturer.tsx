import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import { Manufacturer } from "@/types/manufacturers.types";

import { formatDate, getStatusBadge } from "@/utils/defaults";
import Image from "next/image";
import React from "react";

type ViewManufacturerProps = {
  viewManufacturer: Manufacturer | null;
  showCreateModal: boolean;
  setShowCreateModal: (v: boolean) => void;
};

const ViewManufacturer = ({ showCreateModal, setShowCreateModal, viewManufacturer }: ViewManufacturerProps) => {
  return (
    <div>
      <DialogPopup
        heading="Manufacturer Details"
        open={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      >
        {viewManufacturer && (
          <div className="space-y-6 flex gap-4 flex-wrap">
            {viewManufacturer?.image && viewManufacturer.image?.url && (
              <div className="flex-1 max-tab-md:flex-none max-tab-md:w-full">
                <Image
                  src={
                    typeof viewManufacturer.image == "object" && viewManufacturer.image
                      ? viewManufacturer.image?.url
                      : viewManufacturer.imageUrl || ""
                  }
                  alt={
                    typeof viewManufacturer.image == "object" && viewManufacturer.image
                      ? viewManufacturer.image?.alt ?? ""
                      : ""
                  }
                  width={700}
                  height={450}
                  className="w-full h-[300px] max-tab-md:h-auto rounded-lg object-cover border border-gray-5/20"
                />
              </div>
            )}
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Manufacturer Name
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {viewManufacturer.name}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Status
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-sofia-sans ${getStatusBadge(
                      viewManufacturer.status
                    )}`}
                  >
                    {viewManufacturer.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                {viewManufacturer.subTitle && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                      Subtitle
                    </h3>
                    <p className="text-light-100 font-sofia-sans">
                      {viewManufacturer.subTitle}
                    </p>
                  </div>
                )}

                {viewManufacturer.description && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                      Description
                    </h3>
                    <p className="text-light-100 font-sofia-sans">
                      {viewManufacturer.description}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Created
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {formatDate(viewManufacturer.createdAt)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Updated
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {formatDate(viewManufacturer.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Images */}
              {(viewManufacturer.logo || viewManufacturer.image) && (
                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-3 font-sofia-sans">
                    Images
                  </h3>
                  <div className="flex gap-4">
                    {viewManufacturer.logo && (
                      <div>
                        <p className="text-xs text-gray-4 mb-2 font-sofia-sans">
                          Logo
                        </p>
                        <Image
                          src={
                            typeof viewManufacturer.logo == "object" && viewManufacturer.logo
                              ? viewManufacturer.logo?.url
                              : viewManufacturer.logoUrl || ""
                          }
                          alt={
                            typeof viewManufacturer.logo == "object" && viewManufacturer.logo
                              ? viewManufacturer.logo?.alt ?? ""
                              : ""
                          }
                          width={80}
                          height={80}
                          className="w-20 h-20 rounded-lg object-cover border border-gray-5/20"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogPopup>
    </div>
  );
};

export default ViewManufacturer;