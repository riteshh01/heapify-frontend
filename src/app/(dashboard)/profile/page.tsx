"use client";

import React, { useState, useRef } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { apiCall } from "@/services/api";
import Image from "next/image";
import { FiUpload, FiTrash2, FiUser, FiMail, FiCalendar } from "react-icons/fi";

export default function ProfilePage() {
  const { user, getUserData } = useAuthContext();
  const { notify } = useNotification();
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      notify("File size must be less than 2MB", { type: "error" });
      return;
    }

    if (!file.type.startsWith("image/")) {
      notify("Only image files are allowed", { type: "error" });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const data = await apiCall<{ success: boolean; message?: string }>("/auth/avatar", {
        method: "POST",
        body: formData,
      });

      if (data.success) {
        notify("Profile image updated successfully!", { type: "success" });
        await getUserData(); // Refresh user context
      } else {
        notify(data.message || "Failed to update profile image", { type: "error" });
      }
    } catch (error) {
      console.error("Upload error:", error);
      notify("An error occurred while uploading", { type: "error" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm("Are you sure you want to remove your profile image?")) return;

    setIsDeleting(true);
    try {
      const data = await apiCall<{ success: boolean; message?: string }>("/auth/avatar", {
        method: "DELETE",
      });

      if (data.success) {
        notify("Profile image removed", { type: "success" });
        await getUserData(); // Refresh user context
      } else {
        notify(data.message || "Failed to remove image", { type: "error" });
      }
    } catch (error) {
      console.error("Delete error:", error);
      notify("An error occurred while deleting", { type: "error" });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-[#161b22] border border-[#e2e8f0] dark:border-[#30363d] rounded-2xl p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-8">My Profile</h1>
        
        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4 w-full md:w-auto">
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white dark:border-[#21262d] shadow-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-5xl">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={`${user.name}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{user.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              
              {/* Hover Overlay for Upload */}
              <div 
                className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer backdrop-blur-sm"
                onClick={() => !isUploading && fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center text-white">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <FiUpload size={24} className="mb-2" />
                      <span className="text-xs font-semibold">Change</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex gap-2 w-full justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-sm font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50"
              >
                <FiUpload size={16} />
                Upload
              </button>
              
              {user.avatar_url && (
                <button
                  onClick={handleDeleteImage}
                  disabled={isUploading || isDeleting}
                  className="flex items-center gap-2 px-4 py-2 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm font-semibold hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors disabled:opacity-50"
                >
                  <FiTrash2 size={16} />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 text-center max-w-[200px]">
              JPG, PNG or GIF. Max size of 2MB.
            </p>
          </div>

          {/* User Info Section */}
          <div className="flex-1 w-full space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <FiUser size={16} /> Full Name
                </label>
                <div className="px-4 py-3 bg-slate-50 dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                  {user.name}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <FiMail size={16} /> Email Address
                </label>
                <div className="px-4 py-3 bg-slate-50 dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                  {user.email}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <FiCalendar size={16} /> Member Since
              </label>
              <div className="px-4 py-3 bg-slate-50 dark:bg-[#0d1117] rounded-xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
