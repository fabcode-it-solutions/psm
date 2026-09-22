/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import DialogPopup from "@/component/ui/dashboard/DialogPopup";
import { FormField } from "@/component/ui/dashboard/FormField";
import { userService } from "@/services/user.service";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Monitor, Globe, AlertCircle, Shield, Clock, Activity } from "lucide-react";
import { formatDate } from "@/utils/defaults";

interface BlockUserPopupProps {
  userId: number;
  adminId: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  onUserBlocked: () => void;
}

interface UserDevice {
  ipAddress: string;
  deviceFingerprint: string;
  userAgent: string;
  lastActivity: Date;
  activityCount: number;
}

const blockUserSchema = z.object({
  reason: z.string().min(1, "Reason is required"),
  blockTime: z.string().optional(),
  blockDevice: z.boolean().optional(),
  blockIp: z.boolean().optional(),
});

type BlockUserFormValues = z.infer<typeof blockUserSchema>;

const BlockUserPopup: React.FC<BlockUserPopupProps> = ({
  userId,
  adminId,
  open,
  setOpen,
  onUserBlocked,
}) => {
  const [loading, setLoading] = useState(false);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [userDevices, setUserDevices] = useState<UserDevice[]>([]);
  const [showDeviceInfo, setShowDeviceInfo] = useState(false);
  
  const defaultBlockTime = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 16);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlockUserFormValues>({
    resolver: zodResolver(blockUserSchema),
    defaultValues: { 
      blockTime: defaultBlockTime,
      blockDevice: false,
      blockIp: false,
    },
  });

  const blockDevice = watch("blockDevice");
  const blockIp = watch("blockIp");

  // Load user's recent devices
  useEffect(() => {
    if (open) {
      loadUserDevices();
      setValue("blockTime", defaultBlockTime);
      setValue("blockDevice", false);
      setValue("blockIp", false);
    }
  }, [open]);

  const loadUserDevices = async () => {
    setDevicesLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_PATH}/admin/users/${userId}/devices`
      );
      const data = await response.json();
      
      if (data.success) {
        setUserDevices(data.devices || []);
      }
    } catch (error) {
      console.error("Failed to load devices:", error);
    } finally {
      setDevicesLoading(false);
    }
  };

  const onSubmit = async (data: BlockUserFormValues) => {
    // Validate if blocking device/IP but no recent activity
    if ((data.blockDevice || data.blockIp) && userDevices.length === 0) {
      toast.error("Cannot block device/IP: User has no recent activity");
      return;
    }

    setLoading(true);
    try {
      const result = await userService.blockUserAsAdmin({
        userId,
        adminId,
        reason: data.reason,
        blockTime: data.blockTime,
        blockDevice: data.blockDevice,
        blockIp: data.blockIp,
      });

      if (result.success) {
        toast.success(
          `User blocked successfully${
            data.blockDevice ? " (Device blocked)" : ""
          }${data.blockIp ? " (IP blocked)" : ""}`
        );
        reset();
        setOpen(false);
        onUserBlocked();
      } else {
        toast.error(result.message || "Failed to block user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const getMostRecentDevice = () => {
    if (userDevices.length === 0) return null;
    return userDevices[0]; // Already sorted by most recent
  };

  return (
    <DialogPopup heading="Block User" open={open} setShowCreateModal={setOpen}>
      <div className="p-4">
        {/* Warning Banner */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 flex items-start gap-3 mb-4">
          <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-light-100 font-sofia-sans">
            <strong>Warning:</strong> Blocking this user will prevent them from
            accessing their account. This action can be reversed later.
          </div>
        </div>

        {/* User's Recent Activity Info */}
        {devicesLoading ? (
          <div className="bg-dark-200 border border-gray-5/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-sm text-gray-4 font-sofia-sans">
                Loading user activity...
              </span>
            </div>
          </div>
        ) : userDevices.length > 0 ? (
          <div className="bg-dark-200 border border-gray-5/20 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-semibold text-light-100 font-sofia-sans">
                  Recent Activity
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowDeviceInfo(!showDeviceInfo)}
                className="text-xs text-blue-500 hover:text-blue-400 font-sofia-sans"
              >
                {showDeviceInfo ? "Hide" : "Show"} Details
              </button>
            </div>
            
            <div className="space-y-2">
              {/* Most Recent Device */}
              <div className="flex items-center gap-2 text-sm text-light-100 font-sofia-sans">
                <Clock size={14} className="text-gray-4" />
                <span>Last seen: {formatDate(getMostRecentDevice()?.lastActivity || new Date())}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-light-100 font-sofia-sans">
                <Globe size={14} className="text-blue-500" />
                <code className="text-xs bg-dark-100 px-2 py-1 rounded">
                  {getMostRecentDevice()?.ipAddress || "Unknown IP"}
                </code>
              </div>

              {/* Show all devices on expand */}
              {showDeviceInfo && (
                <div className="mt-3 space-y-2 border-t border-gray-5/20 pt-3">
                  <p className="text-xs font-semibold text-gray-4 font-sofia-sans">
                    {userDevices.length} device(s) detected in last 30 days:
                  </p>
                  {userDevices.slice(0, 5).map((device, idx) => (
                    <div
                      key={idx}
                      className="bg-dark-100 rounded p-2 space-y-1"
                    >
                      <div className="flex items-center gap-2">
                        <Monitor size={12} className="text-orange-500" />
                        <span className="text-xs text-light-100 font-sofia-sans">
                          Device #{idx + 1}
                        </span>
                        <span className="text-xs text-gray-4 font-sofia-sans">
                          ({device.activityCount} activities)
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Globe size={12} className="text-blue-500" />
                        <code className="text-xs text-gray-4">
                          {device.ipAddress}
                        </code>
                      </div>
                      <p className="text-xs text-gray-4 font-sofia-sans">
                        Last: {formatDate(device.lastActivity)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
              <div className="text-sm text-light-100 font-sofia-sans">
                <strong>No Recent Activity:</strong> This user has no recorded
                activity. Device/IP blocking will not be available.
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <FormField
            type="text"
            label="Reason"
            placeholder="Enter reason for blocking"
            {...register("reason")}
            error={errors.reason}
            required
          />

          <FormField
            type="datetime-local"
            label="Block Until"
            placeholder="Select block time"
            {...register("blockTime")}
            error={errors.blockTime}
          />
          <p className="text-xs text-gray-4 -mt-2 font-sofia-sans">
            Leave empty for default 7-day block
          </p>

          {/* Additional Restrictions Section - Only show if user has activity */}
          {userDevices.length > 0 && (
            <div className="bg-dark-200 border border-gray-5/20 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-yellow-500" />
                <h3 className="text-sm font-semibold text-light-100 font-sofia-sans">
                  Additional Security Restrictions
                </h3>
              </div>

              {/* Block Device Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("blockDevice")}
                  className="w-5 h-5 mt-0.5 text-red-500 bg-dark-100 border-gray-5/20 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                  disabled={loading}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Monitor size={16} className="text-gray-4" />
                    <span className="text-sm font-medium text-light-100 font-sofia-sans group-hover:text-red-400 transition-colors">
                      Block Device Fingerprint
                    </span>
                  </div>
                  <p className="text-xs text-gray-4 font-sofia-sans">
                    Blocks the most recent device used by this user
                  </p>
                </div>
              </label>

              {/* Block IP Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register("blockIp")}
                  className="w-5 h-5 mt-0.5 text-red-500 bg-dark-100 border-gray-5/20 rounded focus:ring-2 focus:ring-red-500 cursor-pointer"
                  disabled={loading}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe size={16} className="text-gray-4" />
                    <span className="text-sm font-medium text-light-100 font-sofia-sans group-hover:text-red-400 transition-colors">
                      Block IP Address
                    </span>
                  </div>
                  <p className="text-xs text-gray-4 font-sofia-sans">
                    Blocks the IP: {getMostRecentDevice()?.ipAddress || "Unknown"}
                  </p>
                </div>
              </label>
            </div>
          )}

          {/* Selected Restrictions Summary */}
          {(blockDevice || blockIp) && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-xs text-light-100 font-sofia-sans">
                <strong>Will block:</strong>
                {blockDevice && " Device fingerprint."}
                {blockIp && ` IP address (${getMostRecentDevice()?.ipAddress}).`}
              </p>
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="px-4 py-2 border border-gray-5/20 rounded text-light-100 hover:bg-gray-5/10 font-sofia-sans"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-500 disabled:opacity-50 font-sofia-sans font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Blocking...
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Block User
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </DialogPopup>
  );
};

export default BlockUserPopup;