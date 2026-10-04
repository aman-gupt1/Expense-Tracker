import React from "react";
import { Lock, Sparkles, X, ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const AuthPromptModal = ({ isOpen, onClose, actionName = "perform this action" }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
                <Lock className="w-8 h-8" />
              </div>
              <div className="absolute -top-1 -right-1 p-1 bg-amber-400 rounded-full text-white shadow">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Text Content */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 tracking-tight">
              Sign In Required
            </h3>
            <p className="text-gray-600 text-sm mt-2">
              Please sign in or create an account to{" "}
              <span className="font-semibold text-teal-700">{actionName}</span> and save your records permanently.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="bg-gray-50 rounded-2xl p-3.5 mb-6 border border-gray-100 text-xs text-gray-600 space-y-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>Secure cloud backup for your financial records</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Real-time budget tracking & customized reports</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => {
                onClose();
                navigate("/login");
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-500/20 transition-all cursor-pointer active:scale-98"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                onClose();
                navigate("/signup");
              }}
              className="w-full py-2.5 px-4 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer active:scale-98"
            >
              Create a Free Account
            </button>

            <button
              onClick={onClose}
              className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition cursor-pointer"
            >
              Continue Browsing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthPromptModal;
