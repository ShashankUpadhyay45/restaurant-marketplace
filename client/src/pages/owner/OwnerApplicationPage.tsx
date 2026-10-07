import React, { useState } from 'react';
import { FileCheck, Shield, UploadCloud, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { getMockDatabase } from '../../data/mockData';
import { useToastStore } from '../../store/useToastStore';

export const OwnerApplicationPage: React.FC = () => {
  const { user } = useAuthStore();
  const { showToast } = useToastStore();
  const db = getMockDatabase();
  
  // Get rest_dehradun_01 data
  const restaurant = db.restaurants.find(r => r._id === 'rest_dehradun_01');
  const kyc = db.applications?.find(k => k.city === 'Dehradun') || db.applications?.[0];

  const handleResubmit = () => {
    showToast({ message: 'Document upload will be supported in future integration.', type: 'info' });
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'VERIFIED':
        return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-5 h-5 mr-1" />, text: 'Verified' };
      case 'PENDING':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-5 h-5 mr-1" />, text: 'Pending Approval' };
      case 'CHANGES_REQUESTED':
        return { color: 'bg-red-100 text-red-800', icon: <AlertCircle className="w-5 h-5 mr-1" />, text: 'Changes Requested' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-5 h-5 mr-1" />, text: 'Not Submitted' };
    }
  };

  const status = getStatusDisplay(restaurant?.verificationStatus || 'PENDING');

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verification & KYC</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your restaurant's legal and verification documents</p>
        </div>
        <div className={`flex items-center px-4 py-2 rounded-full font-medium ${status.color}`}>
          {status.icon}
          {status.text}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-indigo-600" />
              Business Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">FSSAI License Number</p>
                <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">
                  {kyc?.fssaiLicenseNumber || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">GSTIN</p>
                <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">
                  {kyc?.gstinNumber || 'Not provided'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Operating Mode</p>
                <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">
                  {restaurant?.operatingMode || 'DINE_IN'}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Commission Tier</p>
                <p className="font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-100">
                  Standard (15%)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileCheck className="w-5 h-5 mr-2 text-indigo-600" />
              Documents
            </h2>
            
            <div className="space-y-4">
              {['FSSAI Certificate', 'GSTIN Certificate', 'Kitchen Hygiene Proof'].map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center">
                    <FileCheck className="w-8 h-8 text-gray-400 mr-4" />
                    <div>
                      <p className="font-medium text-gray-900">{doc}</p>
                      <p className="text-xs text-gray-500">PDF, JPG up to 5MB</p>
                    </div>
                  </div>
                  
                  {restaurant?.verificationStatus === 'VERIFIED' ? (
                    <span className="flex items-center text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Uploaded ✓
                    </span>
                  ) : (
                    <button onClick={handleResubmit} className="flex items-center text-sm font-medium text-indigo-600 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors border border-indigo-200">
                      <UploadCloud className="w-4 h-4 mr-2" />
                      Upload
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {restaurant?.verificationStatus !== 'VERIFIED' && (
              <div className="mt-6 flex justify-end">
                <button onClick={handleResubmit} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                  Submit Documents
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Application Timeline</h3>
            <div className="relative pl-6 space-y-6 border-l-2 border-gray-200 ml-3">
              <div className="relative">
                <div className="absolute -left-[31px] bg-green-500 w-4 h-4 rounded-full border-4 border-white"></div>
                <p className="font-medium text-sm text-gray-900">Application Submitted</p>
                <p className="text-xs text-gray-500">Oct 12, 2023</p>
              </div>
              <div className="relative">
                <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white ${['PENDING', 'CHANGES_REQUESTED', 'VERIFIED'].includes(restaurant?.verificationStatus || '') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <p className="font-medium text-sm text-gray-900">Document Review</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
              <div className="relative">
                <div className={`absolute -left-[31px] w-4 h-4 rounded-full border-4 border-white ${restaurant?.verificationStatus === 'VERIFIED' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                <p className="font-medium text-sm text-gray-900">Final Approval</p>
                <p className="text-xs text-gray-500">Pending</p>
              </div>
            </div>
          </div>
          
          <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 text-sm">
            <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              Need Help?
            </h4>
            <p className="text-indigo-800 mb-3">If you're having trouble with verification, our onboarding team is here to assist.</p>
            <button className="text-indigo-600 font-medium underline">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
};
