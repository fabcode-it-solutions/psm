import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import { Model } from "@/types/models.types";

import { formatDate, getStatusBadge } from "@/utils/defaults";
import Image from "next/image";
import React from "react";

type ViewModelProps = {
  viewModel: Model | null;
  showCreateModal: boolean;
  setShowCreateModal: (v: boolean) => void;
};

const ViewModel = ({ showCreateModal, setShowCreateModal, viewModel }: ViewModelProps) => {  
  
  return (
    <div>
      <DialogPopup
        heading="Model Details"
        open={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      >
        {viewModel && (
          <div className="space-y-6 flex gap-4 flex-wrap">
            {viewModel.image && (
              <div className="flex-1 max-tab-md:flex-none max-tab-md:w-full">        
                <Image
                  src={
                    typeof viewModel.image == "object" && viewModel.image
                      ? viewModel.image?.url
                      : ""
                  }
                  alt={
                    typeof viewModel.image == "object" && viewModel.image
                      ? viewModel.image?.altText ?? ""
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
                    Model Name
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {viewModel.name}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Brand
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {viewModel.brand?.name || "Unknown Brand"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Status
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-sofia-sans ${getStatusBadge(
                      viewModel.status
                    )}`}
                  >
                    {viewModel.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Total Builds
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {viewModel._count?.builds || 0}
                  </p>
                </div>

                {viewModel.description && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                      Description
                    </h3>
                    <p className="text-light-100 font-sofia-sans">
                      {viewModel.description}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Created
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {formatDate(viewModel.createdAt)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Updated
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {formatDate(viewModel.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Brand Logo */}
              {viewModel.brand?.logo && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-4 mb-3 font-sofia-sans">
                    Brand Logo
                  </h3>
                  <div>
                    <Image
                      src={
                        typeof viewModel.brand.logo == "object" && viewModel.brand.logo
                          ? viewModel.brand.logo?.url
                          : viewModel.brand.logoUrl || ""
                      }
                      alt={
                        typeof viewModel.brand.logo == "object" && viewModel.brand.logo
                          ? viewModel.brand.logo?.alt ?? ""
                          : ""
                      }
                      width={60}
                      height={60}
                      className="w-15 h-15 rounded-lg object-cover border border-gray-5/20 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Model Types */}
              {viewModel.types && viewModel.types.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-gray-4 mb-3 font-sofia-sans">
                    Model Types ({viewModel.types.length})
                  </h3>
                  <div className="bg-gray-5/10 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {viewModel.types.map((type) => (
                        <div
                          key={type.id}
                          className="bg-dark-100 border border-gray-5/20 p-3 rounded text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-light-100 font-sofia-sans">
                                {type.name}
                              </p>
                              {type.description && (
                                <p className="text-gray-4 font-sofia-sans mt-1">
                                  {type.description}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full font-sofia-sans ${getStatusBadge(
                                type.status
                              )}`}
                            >
                              {type.status === "active" ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Associated Builds */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-4 mb-3 font-sofia-sans">
                  Associated Builds ({viewModel._count?.builds || 0})
                </h3>
                {viewModel.builds && viewModel.builds.length > 0 ? (
                  <div className="bg-gray-5/10 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {viewModel.builds.map((build) => (
                        <div
                          key={build.id}
                          className="bg-dark-100 border border-gray-5/20 p-3 rounded text-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-light-100 font-sofia-sans">
                                Build #{build.id}
                              </p>
                              {build.licensePlate && (
                                <p className="text-gray-4 font-sofia-sans">
                                  License: {build.licensePlate}
                                </p>
                              )}
                              {build.vinNumber && (
                                <p className="text-gray-4 font-sofia-sans">
                                  VIN: {build.vinNumber}
                                </p>
                              )}
                            </div>
                            <span className="text-xs text-gray-4 font-sofia-sans">
                              {formatDate(build.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-4 text-sm font-sofia-sans">
                    No builds associated with this model.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogPopup>
    </div>
  );
};

export default ViewModel;