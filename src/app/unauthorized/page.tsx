"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertTriangle, Home, LogIn, Mail } from "lucide-react";

function UnauthorizedPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get("reason");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const getErrorMessage = () => {
    switch (reason) {
      case "account_inactive":
        return {
          title: "Account Inactive",
          message:
            "Your admin account has been deactivated. Please contact the system administrator.",
          icon: <Mail className="w-16 h-16 text-orange-500" />,
          showContact: true,
        };
      default:
        return {
          title: "Access Denied",
          message:
            "You do not have permission to access this resource. Admin privileges are required.",
          icon: <AlertTriangle className="w-16 h-16 text-red-500" />,
          showContact: false,
        };
    }
  };

  const error = getErrorMessage();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {error.icon}

            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {error.title}
            </h2>

            <p className="mt-2 text-center text-sm text-gray-600">
              {error.message}
            </p>

            {error.showContact && (
              <div className="mt-4 p-4 bg-orange-50 rounded-md">
                <p className="text-sm text-orange-700">
                  If you believe this is an error, please contact:
                  <br />
                  <a
                    href="mailto:admin@example.com"
                    className="font-medium underline"
                  >
                    admin@example.com
                  </a>
                </p>
              </div>
            )}

            <div className="mt-6 space-y-4">
              <button
                onClick={() => router.push("/login")}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Go to Login
              </button>

              <button
                onClick={() => router.push("/")}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Home className="w-4 h-4 mr-2" />
                Go to Home
              </button>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Redirecting to login in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function UnauthorizedPageLoading() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto animate-pulse" />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Loading...
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Please wait while we load the page details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnauthorizedPage() {
  return (
    <Suspense fallback={<UnauthorizedPageLoading />}>
      <UnauthorizedPageContent />
    </Suspense>
  );
}
