import { Footer } from "@/components/footer/index.tsx";
import { Header } from "@/components/layout/index.ts";

export const PolicyModule = () => {
  return (
    <>
      <Header isHeroSearchInVisible={false} shouldHeaderBlur={false} />
      <div className="bg-white pb-8 pt-24 lg:pb-10 lg:pt-32">
        <div className="mx-auto max-w-3xl px-6 text-base leading-7 text-gray-700 lg:px-8">
          <h1 className="pb-24 text-center text-4xl font-bold tracking-tight text-gray-900 sm:pb-40 sm:text-5xl">
            Privacy Policy
          </h1>
        </div>
        <div className="max-w-8xl bg-gray-50 px-6 py-8 text-base leading-7 text-gray-700 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="mt-6 leading-8">
              We appreciate you utilising the mfoni App (also known as "the
              App"). This privacy statement aims to explain to you how we
              gather, utilise, and protect your personal data when you use the
              application. You acknowledge and agree to the terms of this
              Privacy Policy by using or accessing the App.
            </p>
            <div className="mt-10 max-w-2xl">
              <h2 className="mt-16 text-2xl font-bold text-gray-900">
                Information We Collect
              </h2>
            </div>

            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                i. User-Provided Information:
              </h2>
              <p className="mt-6">
                When you create an account, we may collect personal information
                such as your name, email address, and profile picture.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                ii. Photographic Data:
              </h2>
              <p className="mt-6">
                The app analyses images uploaded by photographers using object
                recognition technologies. Instead of storing the photos, our
                technique extracts pertinent information for search queries.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                How We Use Your Information
              </h2>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                i. Facilitating Photo Lookups:
              </h2>
              <p className="mt-6">
                The main objective of the application is to allow users to
                search for their photos that were taken by event photographers.
                Object recognition technology is employed by matching relevant
                photographs with user-provided details.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                ii. User Accounts:
              </h2>
              <p className="mt-6">
                The personal data gathered during account creation is utilised
                for communication, account administration, and app experience
                customisation.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                iii. Improving App Performance:
              </h2>
              <p className="mt-6">
                The functionality, efficiency, and user experience of the App
                may all be improved with the usage of aggregated and anonymised
                data.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Information Sharing
              </h2>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                i. Photographer Collaboration:
              </h2>
              <p className="mt-6">
                Photographers who upload photographs to the app will be able to
                receive aggregated data on downloads, views, and other pertinent
                information. However, individual user data is not shared with
                photographers.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                ii. Legal Compliance:
              </h2>
              <p className="mt-6">
                We may disclose information when required by law or in response
                to valid legal processes.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                Data Security
              </h2>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                i. Encryption:
              </h2>
              <p className="mt-6">
                We employ industry-standard encryption to safeguard your
                personal information during transmission and storage.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">ii. Opt-Out:</h2>
              <p className="mt-6">
                You have the option to opt-out of certain data processing
                activities. However, opting out may limit your access to certain
                features of the App.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                iii. Updates to Privacy Policy:
              </h2>
              <p className="mt-6">
                We might occasionally alter our privacy statement. Any
                significant changes will be communicated to you through the App
                or through other means. You will be deemed to have accepted the
                updated Privacy Policy if you keep using the app after these
                changes.
              </p>
            </div>
            <div className="mt-16 max-w-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Contact Us</h2>
              <p className="mt-6">
                If you have any questions or concerns about this Privacy Policy
                or the App, please contact us at team@mfoni.app. By using the
                App, you agree to the terms of this Privacy Policy. If you do
                not agree with these terms, please do not use the App.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
