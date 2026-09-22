import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import { Type } from "@/types/types.types";
import { formatDate, getStatusBadge } from "@/utils/defaults";
import Image from "next/image";
import React from "react";

type ViewTypeProps = {
  viewType: Type | null;
  showCreateModal: boolean;
  setShowCreateModal: (v: boolean) => void;
};

const ViewType = ({ showCreateModal, setShowCreateModal, viewType }: ViewTypeProps) => {

  return (
    <div>
      <DialogPopup
        heading="Type Details"
        open={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      >
        {viewType && (
          <div className="space-y-6 flex gap-4 flex-wrap">
            {viewType.image && (
              <div className="flex-1 max-tab-md:flex-none max-tab-md:w-full">
                <Image
                  src={
                    typeof viewType.image == "object" && viewType.image
                      ? viewType.image?.url
                      : ""
                  }
                  alt={
                    typeof viewType.image == "object" && viewType.image
                      ? viewType.image?.alt ?? ""
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
                    Type Name
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {viewType.name}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Model
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {viewType.model?.name || "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Status
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-sofia-sans ${getStatusBadge(
                      viewType.status
                    )}`}
                  >
                    {viewType.status === "active" ? "Active" : "Inactive"}
                  </span>
                </div>

                {viewType.description && (
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                      Description
                    </h3>
                    <p className="text-light-100 font-sofia-sans">
                      {viewType.description}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Created
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {formatDate(viewType.createdAt)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-4 mb-2 font-sofia-sans">
                    Updated
                  </h3>
                  <p className="text-light-100 font-sofia-sans">
                    {formatDate(viewType.updatedAt)}
                  </p>
                </div>
              </div>

              {/* Builds */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-4 mb-3 font-sofia-sans">
                  Associated Builds ({viewType._count?.builds || 0})
                </h3>
                {viewType.builds && viewType.builds.length > 0 ? (
                  <div className="bg-gray-5/10 rounded-lg p-4 max-h-48 overflow-y-auto">
                    <div className="space-y-2">
                      {viewType.builds.map((build) => (
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
                    No builds associated with this type.
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

export default ViewType;